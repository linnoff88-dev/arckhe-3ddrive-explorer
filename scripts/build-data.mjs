/**
 * Pre-processa drive_map.json e gera public/data.json otimizado.
 * - Calcula totalSize e fileCount por pasta
 * - Extrai thumbnail (primeiro JPG/PNG encontrado)
 * - Classifica arquivos por categoria
 * - Gera indice flat pra busca
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(__dirname, '..', '..', 'gws', 'drive_map.json');
const DEST = join(__dirname, '..', 'public', 'data.json');

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'jfif']);
const MODEL_EXTS = new Set(['stl', '3mf', 'blend', 'obj', 'fbx']);
const ARCHIVE_EXTS = new Set(['zip', 'rar', '7z', '001', '002', '003', '004']);
const VIDEO_EXTS = new Set(['mp4', 'mpg', 'avi', 'mov']);
const DOC_EXTS = new Set(['pdf', 'txt', 'doc', 'docx']);

function getExt(name) {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toLowerCase() : '';
}

function getCategory(ext) {
  if (MODEL_EXTS.has(ext)) return 'model';
  if (ARCHIVE_EXTS.has(ext)) return 'archive';
  if (IMAGE_EXTS.has(ext)) return 'image';
  if (VIDEO_EXTS.has(ext)) return 'video';
  if (DOC_EXTS.has(ext)) return 'document';
  return 'other';
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
}

function processNode(node, path = '') {
  const currentPath = path ? `${path}/${node.name}` : node.name;

  if (node.type === 'file') {
    const ext = getExt(node.name);
    return {
      id: node.id,
      name: node.name,
      type: 'file',
      size: node.size || 0,
      sizeLabel: formatSize(node.size || 0),
      ext,
      category: getCategory(ext),
      path: currentPath,
    };
  }

  // Folder
  const children = (node.children || []).map(c => processNode(c, currentPath));

  let totalSize = 0;
  let fileCount = 0;
  let thumbnail = null;

  function walk(items) {
    for (const item of items) {
      if (item.type === 'file') {
        totalSize += item.size;
        fileCount++;
        if (!thumbnail && IMAGE_EXTS.has(item.ext)) {
          thumbnail = item.id;
        }
      } else {
        if (!thumbnail && item.thumbnail) thumbnail = item.thumbnail;
        totalSize += item.totalSize || 0;
        fileCount += item.fileCount || 0;
      }
    }
  }
  walk(children);

  return {
    id: node.id,
    name: node.name,
    type: 'folder',
    children,
    totalSize,
    totalSizeLabel: formatSize(totalSize),
    fileCount,
    thumbnail,
    path: currentPath,
  };
}

// Stats por categoria
function collectStats(node, stats = {}) {
  if (node.type === 'file') {
    const cat = node.category;
    if (!stats[cat]) stats[cat] = { count: 0, size: 0 };
    stats[cat].count++;
    stats[cat].size += node.size;
  }
  if (node.children) {
    for (const c of node.children) collectStats(c, stats);
  }
  return stats;
}

// Flat index pra busca
function buildSearchIndex(node, index = []) {
  if (node.type === 'file') {
    index.push({
      id: node.id,
      name: node.name,
      ext: node.ext,
      category: node.category,
      size: node.size,
      sizeLabel: node.sizeLabel,
      path: node.path,
    });
  }
  if (node.children) {
    for (const c of node.children) buildSearchIndex(c, index);
  }
  return index;
}

console.log('Reading drive_map.json...');
const raw = JSON.parse(readFileSync(SOURCE, 'utf8'));

console.log('Processing tree...');
const tree = processNode(raw);

console.log('Building search index...');
const searchIndex = buildSearchIndex(tree);

console.log('Collecting stats...');
const stats = collectStats(tree);
for (const cat of Object.keys(stats)) {
  stats[cat].sizeLabel = formatSize(stats[cat].size);
}

const output = {
  tree,
  stats,
  searchIndex,
  totalFiles: searchIndex.length,
  totalSize: tree.totalSize,
  totalSizeLabel: tree.totalSizeLabel,
  generatedAt: new Date().toISOString(),
};

writeFileSync(DEST, JSON.stringify(output));
console.log(`Done! ${searchIndex.length} files indexed. Output: ${DEST}`);

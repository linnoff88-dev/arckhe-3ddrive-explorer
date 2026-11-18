'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { DriveData, DriveNode, DriveFolder, DriveFile } from '@/lib/types';
import { categoryMeta, extIcon, driveDownloadUrl, driveViewUrl, driveFolderUrl, driveThumbnailUrl } from '@/lib/drive-utils';

// ---- Stats Bar ----
function StatsBar({ data }: { data: DriveData }) {
  const cats = Object.entries(data.stats).sort((a, b) => b[1].count - a[1].count);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cats.map(([cat, s]) => {
        const m = categoryMeta(cat);
        return (
          <div key={cat} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{m.icon}</div>
            <div className={`text-sm font-semibold ${m.color}`}>{m.label}</div>
            <div className="text-xl font-bold text-white">{s.count.toLocaleString('pt-BR')}</div>
            <div className="text-xs text-gray-500">{s.sizeLabel}</div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Breadcrumbs ----
function Breadcrumbs({ path, onNavigate }: { path: DriveFolder[]; onNavigate: (i: number) => void }) {
  return (
    <nav className="flex items-center gap-1 text-sm mb-4 flex-wrap">
      {path.map((folder, i) => (
        <span key={folder.id} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-600 mx-1">/</span>}
          <button
            onClick={() => onNavigate(i)}
            className={`px-2 py-0.5 rounded transition ${
              i === path.length - 1
                ? 'bg-gray-800 text-white font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            {i === 0 ? '🏠 Inicio' : folder.name}
          </button>
        </span>
      ))}
    </nav>
  );
}

// ---- Folder Card ----
function FolderCard({ folder, onClick }: { folder: DriveFolder; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-gray-600 hover:bg-gray-800/60 transition group w-full"
    >
      <div className="flex items-start gap-3">
        {folder.thumbnail ? (
          <img
            src={driveThumbnailUrl(folder.thumbnail)}
            alt=""
            className="w-16 h-16 rounded-lg object-cover bg-gray-800 flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
            📁
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition">
            {folder.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {folder.fileCount.toLocaleString('pt-BR')} arquivos
          </p>
          <p className="text-xs text-gray-600">{folder.totalSizeLabel}</p>
        </div>
        <span className="text-gray-600 group-hover:text-gray-400 text-lg">&#8250;</span>
      </div>
    </button>
  );
}

// ---- File Row ----
function FileRow({ file }: { file: DriveFile }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition group">
      <span className="text-lg flex-shrink-0">{extIcon(file.ext)}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-200 truncate">{file.name}</p>
        <p className="text-xs text-gray-600">{file.sizeLabel}</p>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-gray-600 bg-gray-800 px-2 py-0.5 rounded font-mono">
        {file.ext || '?'}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <a
          href={driveViewUrl(file.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition"
          title="Visualizar no Drive"
        >
          👁
        </a>
        <a
          href={driveDownloadUrl(file.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 text-xs bg-cyan-900/50 hover:bg-cyan-800/60 rounded text-cyan-400 transition"
          title="Baixar"
        >
          ⬇
        </a>
      </div>
    </div>
  );
}

// ---- Search Results ----
function SearchResults({ results, query }: { results: DriveFile[]; query: string }) {
  const shown = results.slice(0, 100);
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        {results.length.toLocaleString('pt-BR')} resultados para &quot;{query}&quot;
        {results.length > 100 && ' (mostrando 100)'}
      </p>
      <div className="space-y-1.5">
        {shown.map((f) => (
          <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition group">
            <span className="text-lg flex-shrink-0">{extIcon(f.ext)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-200 truncate">{f.name}</p>
              <p className="text-[10px] text-gray-600 truncate">{f.path}</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gray-600 bg-gray-800 px-2 py-0.5 rounded font-mono">
              {f.ext}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <a href={driveViewUrl(f.id)} target="_blank" rel="noopener noreferrer"
                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition" title="Ver">
                👁
              </a>
              <a href={driveDownloadUrl(f.id)} target="_blank" rel="noopener noreferrer"
                className="px-2 py-1 text-xs bg-cyan-900/50 hover:bg-cyan-800/60 rounded text-cyan-400 transition" title="Baixar">
                ⬇
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Category Filter ----
const ALL_CATS = ['model', 'archive', 'image', 'document', 'video', 'other'] as const;

function CategoryFilter({
  active,
  onToggle,
}: {
  active: Set<string>;
  onToggle: (cat: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {ALL_CATS.map((cat) => {
        const m = categoryMeta(cat);
        const isActive = active.has(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`px-3 py-1.5 text-xs rounded-full border transition font-medium ${
              isActive
                ? 'border-cyan-700 bg-cyan-900/40 text-cyan-300'
                : 'border-gray-800 bg-gray-900 text-gray-500 hover:text-gray-300'
            }`}
          >
            {m.icon} {m.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- Main Page ----
export default function HomePage() {
  const [data, setData] = useState<DriveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [navPath, setNavPath] = useState<DriveFolder[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(ALL_CATS));

  useEffect(() => {
    fetch('/data.json')
      .then((r) => r.json())
      .then((d: DriveData) => {
        setData(d);
        setNavPath([d.tree]);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to load data:', e);
        setLoading(false);
      });
  }, []);

  const currentFolder = navPath[navPath.length - 1] || null;

  const navigateToChild = useCallback(
    (folder: DriveFolder) => setNavPath((p) => [...p, folder]),
    []
  );

  const navigateToBreadcrumb = useCallback(
    (i: number) => setNavPath((p) => p.slice(0, i + 1)),
    []
  );

  const toggleFilter = useCallback((cat: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  // Filter current folder children
  const { folders, files } = useMemo(() => {
    if (!currentFolder) return { folders: [], files: [] };
    const folders: DriveFolder[] = [];
    const files: DriveFile[] = [];
    for (const child of currentFolder.children) {
      if (child.type === 'folder') folders.push(child);
      else if (activeFilters.has(child.category)) files.push(child);
    }
    folders.sort((a, b) => b.fileCount - a.fileCount);
    files.sort((a, b) => a.name.localeCompare(b.name));
    return { folders, files };
  }, [currentFolder, activeFilters]);

  // Search
  const searchResults = useMemo(() => {
    if (!data || search.length < 2) return null;
    const q = search.toLowerCase();
    return data.searchIndex.filter(
      (f) =>
        activeFilters.has(f.category) &&
        (f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
    );
  }, [data, search, activeFilters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🧊</div>
          <p className="text-gray-500">Carregando acervo 3D...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">Erro ao carregar dados.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              🧊 <span className="hidden sm:inline">3D Print Library</span>
            </h1>
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar arquivos..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-cyan-700 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"
                >
                  x
                </button>
              )}
            </div>
            <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
              <span>{data.totalFiles.toLocaleString('pt-BR')} arquivos</span>
              <span className="text-gray-700">|</span>
              <span>{data.totalSizeLabel}</span>
            </div>
          </div>
          <CategoryFilter active={activeFilters} onToggle={toggleFilter} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <StatsBar data={data} />

        {/* Search mode */}
        {searchResults ? (
          <SearchResults results={searchResults} query={search} />
        ) : (
          <>
            {/* Breadcrumbs */}
            <Breadcrumbs path={navPath} onNavigate={navigateToBreadcrumb} />

            {/* Current folder header with Drive link */}
            {currentFolder && navPath.length > 1 && (
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-white">{currentFolder.name}</h2>
                <a
                  href={driveFolderUrl(currentFolder.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1 rounded-full transition"
                >
                  Abrir no Drive ↗
                </a>
                <span className="text-xs text-gray-600">
                  {currentFolder.fileCount} arquivos / {currentFolder.totalSizeLabel}
                </span>
              </div>
            )}

            {/* Folders grid */}
            {folders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-wider text-gray-600 mb-3 font-semibold">
                  Pastas ({folders.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {folders.map((f) => (
                    <FolderCard key={f.id} folder={f} onClick={() => navigateToChild(f)} />
                  ))}
                </div>
              </div>
            )}

            {/* Files list */}
            {files.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-600 mb-3 font-semibold">
                  Arquivos ({files.length})
                </h3>
                <div className="space-y-1.5">
                  {files.map((f) => (
                    <FileRow key={f.id} file={f} />
                  ))}
                </div>
              </div>
            )}

            {folders.length === 0 && files.length === 0 && (
              <div className="text-center py-16 text-gray-600">
                <div className="text-3xl mb-3">📂</div>
                <p>Pasta vazia</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export function driveDownloadUrl(id: string): string {
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

export function driveViewUrl(id: string): string {
  return `https://drive.google.com/file/d/${id}/view`;
}

export function driveFolderUrl(id: string): string {
  return `https://drive.google.com/drive/folders/${id}`;
}

export function driveThumbnailUrl(id: string): string {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w400`;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  model:    { label: 'Modelos 3D',  icon: '🧊', color: 'text-cyan-400' },
  archive:  { label: 'Compactados', icon: '📦', color: 'text-amber-400' },
  image:    { label: 'Imagens',     icon: '🖼️', color: 'text-pink-400' },
  video:    { label: 'Videos',      icon: '🎬', color: 'text-purple-400' },
  document: { label: 'Documentos',  icon: '📄', color: 'text-green-400' },
  other:    { label: 'Outros',      icon: '📎', color: 'text-gray-400' },
};

export function categoryMeta(cat: string) {
  return CATEGORY_META[cat] || CATEGORY_META.other;
}

const EXT_ICONS: Record<string, string> = {
  stl: '🧊', '3mf': '🧊', blend: '🎨', obj: '🧊', fbx: '🧊',
  zip: '📦', rar: '📦', '7z': '📦',
  jpg: '🖼️', jpeg: '🖼️', png: '🖼️', webp: '🖼️',
  pdf: '📄', mp4: '🎬', txt: '📝',
};

export function extIcon(ext: string): string {
  return EXT_ICONS[ext] || '📎';
}

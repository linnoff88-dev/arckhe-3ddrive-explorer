export interface DriveFile {
  id: string;
  name: string;
  type: 'file';
  size: number;
  sizeLabel: string;
  ext: string;
  category: string;
  path: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  type: 'folder';
  children: DriveNode[];
  totalSize: number;
  totalSizeLabel: string;
  fileCount: number;
  thumbnail: string | null;
  path: string;
}

export type DriveNode = DriveFile | DriveFolder;

export interface CategoryStats {
  count: number;
  size: number;
  sizeLabel: string;
}

export interface DriveData {
  tree: DriveFolder;
  stats: Record<string, CategoryStats>;
  searchIndex: DriveFile[];
  totalFiles: number;
  totalSize: number;
  totalSizeLabel: string;
  generatedAt: string;
}

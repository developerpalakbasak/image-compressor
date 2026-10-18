export interface SelectedImage {
  id: string;
  uri: string;
  name: string;
  originalSize?: number;
  compressedSize?: number;
  compressedUri?: string;
  width?: number;
  height?: number;
}

export interface CompressedFileItem {
  uri: string;
  name: string;
  size: number;
}

export interface CompressionResult {
  type: 'single' | 'multiple';
  items: CompressedFileItem[];
  totalOriginalSize: number;
  totalCompressedSize: number;
  reductionPercentage: number;
}

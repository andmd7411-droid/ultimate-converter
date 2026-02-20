export type FileFormat =
    | 'JPG' | 'PNG' | 'WEBP' | 'BMP' | 'ICO' | 'TIFF' | 'GIF' | 'SVG' | 'AVIF' | 'HEIC' | 'HEIF' | 'EPUB'
    | 'TTF' | 'WOFF' | 'WOFF2' | 'CSS'
    | 'PDF' | 'TXT' | 'MD' | 'HTML'
    | 'MP3' | 'WAV' | 'OGG' | 'AAC' | 'FLAC'
    | 'MP4' | 'WEBM' | 'AVI' | 'MOV' | 'MKV'
    | 'JSON' | 'CSV' | 'XML' | 'B64'
    | 'ZIP';

export interface FileData {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    outputName?: string;
    outputBlob?: Blob;
    error?: string;
}

export interface ConversionOptions {
    quality?: number;
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
    bitrate?: string;
    sampleRate?: number;
    resolution?: string;
}

export interface TileSettings {
  gap: { horizontal: number; vertical: number };
  gapColor: string;
  tileSize: { width: number; height: number };
  placement: 'full' | 'center' | 'custom';
  rotation: number;
  opacity: number;
}

export interface AppState {
  wallImage: string | null;
  tileImage: string | null;
  settings: TileSettings;
  zoom: number;
}
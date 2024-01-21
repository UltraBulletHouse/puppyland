import { TileLayerOptions } from 'leaflet';

export interface TileLayerOptionsPlugins extends TileLayerOptions {
  edgeBufferTiles: number;
}

export interface CanvasMarkerImg {
  url: string | null;
  size?: [number, number];
  rotate?: number;
  offset?: { x: number; y: number };
  radius?: number
}

export interface CanvasMarkerOptions {
  radius: number;
  img: CanvasMarkerImg;
}

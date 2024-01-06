import { TileLayerOptions } from 'leaflet';

export interface TileLayerOptionsPlugins extends TileLayerOptions {
  edgeBufferTiles: number;
}

//TODO: Change to Path albo inny Canvasowy
export type MarkersList = Map<string, L.Circle>;

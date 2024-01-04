import { TileLayerOptions } from 'leaflet';

export interface TileLayerOptionsPlugins extends TileLayerOptions {
  edgeBufferTiles: number;
}

export type MarkersList = Map<string, L.Marker>;

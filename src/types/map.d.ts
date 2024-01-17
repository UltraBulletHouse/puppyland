import { TileLayerOptions } from 'leaflet';

export interface TileLayerOptionsPlugins extends TileLayerOptions {
  edgeBufferTiles: number;
}

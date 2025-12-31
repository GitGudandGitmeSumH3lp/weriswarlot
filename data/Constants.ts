// src/data/Constants.ts

export const TILE_SIZE = 50;
export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 600;
export const COLS = 16;
export const ROWS = 12;

export enum TileType {
  STREET = 0,
  WALL = 1,
  GRASS = 4,
  DIRT = 5,
  WATER = 6,
  DENSE_FOLIAGE = 7
}

export const PALETTE = {
    GRASS_BASE: 0x3a5a40, GRASS_HIGHLIGHT: 0x588157,
    DIRT_BASE: 0x5c4033, DIRT_HIGHLIGHT: 0x8d6e63,
    STONE_BASE: 0x4a4e69, STONE_LIGHT: 0x9a8c98,
    WATER_DEEP: 0x1d3557, WATER_SHALLOW: 0x457b9d,
    TREE_TRUNK: 0x4a3b2a,
    TREE_LEAF_DARK: 0x132a13, TREE_LEAF_MID: 0x31572c, TREE_LEAF_LIGHT: 0x4f772d,
    SHADOW: 0x000000,
    LAMPLIGHT: 0xffaa00
};
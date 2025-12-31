// src/systems/MovementSystem.ts
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, TileType } from '@/data/Constants';

// Helper: Define what blocks movement
const isSolid = (tile: number) => {
    return tile === TileType.WALL || tile === TileType.WATER || tile === TileType.DENSE_FOLIAGE;
};

// Helper: Random Range
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

export interface MovableEntity {
    id: string;
    x: number;
    y: number;
    speed?: number;
    targetX?: number;
    targetY?: number;
    waitTimer?: number;
}

/**
 * Updates a single entity's position based on physics and AI rules.
 * MUTATES the entity object directly for performance in the loop.
 */
export const updateEntityMovement = (
    entity: MovableEntity, 
    grid: number[][], 
    delta: number
) => {
    // Default Speed: 60px/sec (approx) adjusted for delta
    // If delta is 1 (60fps), speed should be ~1px per tick.
    // Pixi Ticker delta is usually ~1.0 at 60fps.
    const baseSpeed = (entity.speed || 50) * 0.016; // Normalize to ms roughly
    const moveStep = baseSpeed * delta; 

    // STATE 1: IDLE / WAITING
    if (entity.targetX === undefined || entity.targetY === undefined) {
        if (entity.waitTimer && entity.waitTimer > 0) {
            entity.waitTimer -= delta; // Count down
        } else {
            // Pick a new target
            const nextX = randomRange(50, WORLD_WIDTH - 50);
            const nextY = randomRange(50, WORLD_HEIGHT - 50);
            
            // Simple validation: Don't pick a target inside a wall
            const c = Math.floor(nextX / TILE_SIZE);
            const r = Math.floor(nextY / TILE_SIZE);
            
            if (grid[c] && grid[c][r] !== undefined && !isSolid(grid[c][r])) {
                entity.targetX = nextX;
                entity.targetY = nextY;
                entity.waitTimer = 0;
            } else {
                // Retry later (short wait)
                entity.waitTimer = 10;
            }
        }
        return;
    }

    // STATE 2: MOVING
    const dx = entity.targetX - entity.x;
    const dy = entity.targetY - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // ARRIVAL CHECK
    if (dist < 5) {
        entity.x = entity.targetX;
        entity.y = entity.targetY;
        entity.targetX = undefined;
        entity.targetY = undefined;
        entity.waitTimer = randomRange(60, 180); // Wait 1-3 seconds (assuming 60fps tick)
        return;
    }

    // VELOCITY
    const vx = (dx / dist) * moveStep;
    const vy = (dy / dist) * moveStep;

    const nextX = entity.x + vx;
    const nextY = entity.y + vy;

    // COLLISION CHECK (Predictive)
    const c = Math.floor(nextX / TILE_SIZE);
    const r = Math.floor(nextY / TILE_SIZE);

    if (grid[c] && grid[c][r] !== undefined && !isSolid(grid[c][r])) {
        // Safe to move
        entity.x = nextX;
        entity.y = nextY;
    } else {
        // Hit a wall -> Stop and Rethink
        entity.targetX = undefined;
        entity.targetY = undefined;
        entity.waitTimer = 30; // Pause briefly on bump
    }
};
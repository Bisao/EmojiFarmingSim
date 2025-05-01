import { pgTable, text, serial, integer, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Game state schema for database storage
export const gameStates = pgTable('game_states', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  gameData: jsonb('game_data').notNull(),
  lastSaved: text('last_saved').notNull(),
  createdAt: text('created_at').notNull()
});

// Type definitions for the game state
export type ResourceType = 'tree' | 'bigTree' | 'rock';
export type StructureType = 'lumberjackHouse' | 'minerHouse' | 'storage';
export type FieldType = 'plantio' | 'agua' | 'pasto';
export type SeedType = 'wheat' | 'corn' | 'carrot' | 'potato' | 'tomato';

export interface GridTile {
  x: number;
  y: number;
  resource?: ResourceType;
  structure?: StructureType;
  type?: 'field';
  fieldType?: FieldType;
  planted?: SeedType;
  growthStage?: number;
  harvestable?: boolean;
}

export interface Agent {
  x: number;
  y: number;
  state: string;
  timer: number;
  target: GridTile | null;
  path: {x: number, y: number}[];
}

export interface Resources {
  coins: number;
  wood: number;
  stone: number;
  seeds: Record<SeedType, number>;
  crops: Record<SeedType, number>;
}

export interface GameState {
  resources: Resources;
  gridTiles: GridTile[];
  agents: {
    lumber: Agent;
    miner: Agent;
  };
  logMessages: Array<{
    text: string;
    timestamp: string;
    icon: string;
  }>;
}

// Zod schemas for validation
export const gameStateInsertSchema = createInsertSchema(gameStates, {
  gameData: (schema) => schema.pipe(z.any()),
  userId: (schema) => schema.min(1, "User ID is required"),
  lastSaved: (schema) => schema.min(1, "Last saved timestamp is required"),
});

export type GameStateInsert = z.infer<typeof gameStateInsertSchema>;
export const gameStateSelectSchema = createSelectSchema(gameStates);
export type GameStateSelect = z.infer<typeof gameStateSelectSchema>;

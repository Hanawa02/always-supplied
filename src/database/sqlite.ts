import sqlite3InitModule, { type Database } from "@sqlite.org/sqlite-wasm"

let db: Database | null = null

export const initDB = async (): Promise<Database> => {
  if (db) return db
  try {
    const sqlite3 = await sqlite3InitModule()

    // Check if OPFS is available
    if ("oo1" in sqlite3 && "OpfsDb" in sqlite3.oo1) {
      // Correct constructor access
      db = new sqlite3.oo1.OpfsDb("/always-supplied-db.sqlite3") as Database
      console.log("Using OPFS storage")
    } else {
      // Fallback to memory if OPFS isn't supported (e.g., missing headers)
      db = new sqlite3.oo1.DB({ filename: "/always-supplied-db.sqlite3" }) as Database
      console.warn("OPFS not available, using transient memory storage")
    }

    // CRITICAL: Enable foreign keys for this session
    db.exec("PRAGMA foreign_keys = ON;")

    db.exec(`
    CREATE TABLE IF NOT EXISTS buildings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS areas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      area_id TEXT,
      FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS shopping_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      stock_item_id TEXT,
      FOREIGN KEY (stock_item_id) REFERENCES stock_items(id) ON DELETE SET NULL
    );
  
    CREATE TABLE IF NOT EXISTS building_stock (
      building_id TEXT,
      stock_item_id TEXT,
      PRIMARY KEY (building_id, stock_item_id),
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
      FOREIGN KEY (stock_item_id) REFERENCES stock_items(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS building_shopping_list (
      building_id TEXT,
      shopping_item_id TEXT,
      PRIMARY KEY (building_id, shopping_item_id),
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
      FOREIGN KEY (shopping_item_id) REFERENCES shopping_items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS building_users (
      building_id TEXT,
      user_id TEXT,
      PRIMARY KEY (building_id, user_id),
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS building_areas (
      building_id TEXT,
      area_id TEXT,
      PRIMARY KEY (building_id, area_id),
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
      FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
    );

    
    CREATE TABLE IF NOT EXISTS app_logs (
      id TEXT PRIMARY KEY,
      building_id TEXT,
      user_id TEXT,
      log_message TEXT NOT NULL,
      tags TEXT,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  
  `)

    return db
  } catch (err) {
    console.error("Failed to initialize SQLite WASM", err)
    throw err
  }
}

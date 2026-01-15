import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * 1. Define the structure of a single report in the database
 */
export interface QueuedReport {
  id?: number; // Optional because IndexedDB generates this on save
  data: any;   // The report payload (text, metadata, image analysis)
  timestamp: string;
}

/**
 * 2. Define the Schema for the Database
 * This maps the store name to the key and value types
 */
interface VeilDB extends DBSchema {
  'queued_reports': {
    key: number;
    value: QueuedReport;
  };
}

const DB_NAME = 'VeilOfflineDB';
const STORE_NAME = 'queued_reports';

/**
 * 3. Initialize Database with the Schema
 * Uses generics <VeilDB> to ensure type safety throughout the app
 */
export const initDB = async (): Promise<IDBPDatabase<VeilDB>> => {
  return openDB<VeilDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }
    },
  });
};

/**
 * 4. Save a report to the queue
 * Use this when the user is offline or the relayer is unreachable
 */
export const saveToQueue = async (reportData: any): Promise<void> => {
  const db = await initDB();
  await db.add(STORE_NAME, { 
    data: reportData, 
    timestamp: new Date().toISOString() 
  });
};

/**
 * 5. Retrieve all reports from the queue
 * Returns an array of QueuedReport objects
 */
export const getQueue = async (): Promise<QueuedReport[]> => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

/**
 * 6. Delete a report once synced
 * Use this inside your SyncManager after a successful fetch()
 */
export const removeFromQueue = async (id: number): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};
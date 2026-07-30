/**
 * evvOfflineQueue.js — Offline-first GPS queue for EVV visits.
 *
 * Stores EVV readings in IndexedDB when Supabase is unreachable
 * and syncs when connectivity returns.
 *
 * Usage:
 *   import { enqueueEvvRecord, processEvvQueue, getQueueSize } from "@/lib/evvOfflineQueue";
 *
 *   // On network error in dataService:
 *   await enqueueEvvRecord({ type: "clockIn", nurseId, clientId, gpsData, createdAt });
 *
 *   // On 'online' event:
 *   const { synced, failed } = await processEvvQueue(async (record) => {
 *     // Called for each queued record — return { error } on failure
 *   });
 */

const DB_NAME = "evv-offline-queue";
const STORE_NAME = "pending-evv-records";
const DB_VERSION = 1;
const MAX_RETRIES = 5;
const MAX_QUEUE_SIZE = 200;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function closeDb(db) {
  try { db.close(); } catch { /* already closed */ }
}

/**
 * Store an EVV record in the offline queue.
 * @param {Object} record - { type, nurseId, clientId, gpsData, ...meta }
 * @returns {Promise<Object|null>} The stored record with id, or null
 */
export async function enqueueEvvRecord(record) {
  if (!indexedDB) return null;
  const recordWithMeta = {
    ...record,
    status: "pending",
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };
  let db;
  try {
    db = await openDb();
    // Check queue size before adding
    const size = await getQueueSize();
    if (size >= MAX_QUEUE_SIZE) return null;
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const req = tx.objectStore(STORE_NAME).add(recordWithMeta);
      req.onsuccess = () => resolve(recordWithMeta);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => closeDb(db);
      tx.onerror = () => closeDb(db);
    });
  } catch {
    closeDb(db);
    return null;
  }
}

/**
 * Process all pending records in the queue.
 * Opens DB once, processes all records in a single connection,
 * then closes.
 *
 * @param {Function} submitFn - Async function called with each record.
 *   Should throw or return { error } on failure.
 * @returns {Promise<{synced: number, failed: number}>}
 */
export async function processEvvQueue(submitFn) {
  if (!indexedDB) return { synced: 0, failed: 0 };
  let db;
  try {
    db = await openDb();
  } catch {
    return { synced: 0, failed: 0 };
  }

  // Read all pending records
  const records = await new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("status");
    const range = IDBKeyRange.only("pending");
    const results = [];
    const req = index.openCursor(range);
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        results.push({ ...cursor.value, _cursor: cursor });
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => resolve(results);
    tx.oncomplete = () => {}; // don't close db here
  });

  let synced = 0;
  let failed = 0;

  // Process each record using the same db connection
  for (const record of records) {
    // Skip records that have exceeded max retries
    if ((record.retryCount || 0) >= MAX_RETRIES) {
      // Mark as dead — won't retry again
      await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put({ ...record, status: "dead", lastError: "Max retries exceeded" });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
      failed++;
      continue;
    }

    try {
      const result = await submitFn(record);
      if (result && result.error) {
        failed++;
        await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.put({
            ...record,
            retryCount: (record.retryCount || 0) + 1,
            lastError: result.error?.message || String(result.error),
          });
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
      } else {
        // Success — delete from queue
        await new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.delete(record.id);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        });
        synced++;
      }
    } catch {
      failed++;
    }
  }

  closeDb(db);
  return { synced, failed };
}

/**
 * Get the number of pending records in the queue.
 * @returns {Promise<number>}
 */
export async function getQueueSize() {
  if (!indexedDB) return 0;
  let db;
  try {
    db = await openDb();
    return await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const index = store.index("status");
        const req = index.count(IDBKeyRange.only("pending"));
        req.onsuccess = () => { resolve(req.result); closeDb(db); };
        req.onerror = () => { resolve(0); closeDb(db); };
      } catch { resolve(0); closeDb(db); }
    });
  } catch {
    closeDb(db);
    return 0;
  }
}
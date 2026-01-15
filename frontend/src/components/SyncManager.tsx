'use client';
import { useEffect } from 'react';
import { useNetwork } from '../store/useNetwork';
import { initDB } from '../utils/db'; // Import the unified init function

export default function SyncManager() {
  const online = useNetwork();

  useEffect(() => {
    const sync = async () => {
      if (online) {
        try {
          const db = await initDB();
          
          // FIX: Change 'reports' to 'queued_reports' to match db.ts
          const all = await db.getAll('queued_reports'); 

          if (all.length > 0) {
            console.log(`SyncManager: Attempting to sync ${all.length} reports...`);
            
            for (const item of all) {
              if (!item.id) continue;

              const res = await fetch('http://localhost:3001/api/submit-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data),
              });

              if (res.ok) {
                // FIX: Change 'reports' to 'queued_reports'
                await db.delete('queued_reports', item.id);
                console.log(`SyncManager: Successfully synced report ${item.id}`);
              }
            }
          }
        } catch (err) {
          console.error("Sync Logic Failed:", err);
        }
      }
    };

    sync();
  }, [online]);

  return null;
}
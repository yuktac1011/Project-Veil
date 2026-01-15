import { useEffect } from 'react';
import { initDB } from '../utils/db';

export const useOfflineSync = () => {
  useEffect(() => {
    const syncReports = async () => {
      // 1. Ensure we are online before attempting sync
      if (!navigator.onLine) return;

      try {
        const db = await initDB();
        // Use 'queued_reports' to match db.ts
        const allReports = await db.getAll('queued_reports');

        if (allReports.length > 0) {
          console.log(`SyncManager: Found ${allReports.length} reports to sync.`);
          
          for (const report of allReports) {
            // Ensure ID exists to satisfy TypeScript
            if (report.id === undefined) continue;

            try {
              // 2. Point to the correct Relayer endpoint defined in server.js
              const res = await fetch('http://localhost:3001/api/submit-report', {
                method: 'POST',
                body: JSON.stringify(report.data),
                headers: { 'Content-Type': 'application/json' }
              });

              if (res.ok) {
                // Use 'queued_reports' to match db.ts
                await db.delete('queued_reports', report.id);
                console.log(`Report ${report.id} successfully broadcasted to chain.`);
              }
            } catch (error) {
              console.error("Gemma Relayer is unreachable. Keeping in queue.", error);
            }
          }
        }
      } catch (dbError) {
        console.error("IndexedDB Access Error:", dbError);
      }
    };

    // Trigger on initial load and whenever the 'online' event fires
    syncReports();
    window.addEventListener('online', syncReports);
    return () => window.removeEventListener('online', syncReports);
  }, []);
};
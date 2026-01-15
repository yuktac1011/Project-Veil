
import { useEffect } from 'react';
import { useReportStore } from '../store/useReportStore';
import { uploadToIPFS } from '../utils/ipfs';
import { api } from '../api/api';

export const OfflineSync = () => {
    const { queue, removeFromQueue, addReport, addActivity } = useReportStore();

    useEffect(() => {
        const handleOnline = () => {
            console.log("Network online. Processing queue...", queue.length);
            processQueue();
        };

        window.addEventListener('online', handleOnline);
        
        // Also check on mount if online and queue has items
        if(navigator.onLine && queue.length > 0) {
            processQueue();
        }

        return () => window.removeEventListener('online', handleOnline);
    }, [queue]);

    const processQueue = async () => {
        if (queue.length === 0) return;

        // Process one by one
        for (const item of queue) {
            try {
                console.log(`Syncing item ${item.id}...`);
                const ipfsCid = await uploadToIPFS({ content: item.encryptedString });
                
                const response = await api.submitReport({
                    proofData: item.proofData,
                    ipfsCid,
                    zkProof: ""
                });

                if (response.success) {
                    addReport({
                        id: response.data?.reportId || `local_${Date.now()}`,
                        title: item.formData.title,
                        status: 'pending',
                        date: new Date().toISOString().split('T')[0],
                        cid: ipfsCid,
                        category: item.formData.category,
                        severity: item.formData.severity
                    });
            
                    addActivity({
                        type: "network",
                        message: `Offline report synced successfully`,
                        status: "success",
                        hash: ipfsCid,
                    });
                    
                    removeFromQueue(item.id);
                }
            } catch (err) {
                console.error(`Failed to sync item ${item.id}`, err);
                // Keep in queue to retry later
            }
        }
    };

    return null; // Headless component
};

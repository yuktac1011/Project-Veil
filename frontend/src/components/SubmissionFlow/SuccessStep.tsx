import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export const SuccessStep = () => {
    return (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
            <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle size={48} />
                </div>
            </div>
            
            <div className="space-y-2">
                <h2 className="text-3xl font-bold">Report Submitted</h2>
                <p className="text-zinc-400">
                    Your report has been encrypted and is now pending validator review.
                    <br/>Your identity remains 100% anonymous.
                </p>
            </div>

            <Link to="/dashboard">
                <Button className="w-full py-4">
                    Return to Dashboard
                </Button>
            </Link>
        </motion.div>
    );
};

'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, XCircle, ArrowDownToLine } from 'lucide-react';

interface UpdateInfo {
    version?: string;
    releaseNotes?: string;
}

export default function UpdateNotification() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateDownloaded, setUpdateDownloaded] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({});
    const [error, setError] = useState<string | null>(null);
    const [currentVersion, setCurrentVersion] = useState('');

    useEffect(() => {
        // Check if running in Electron
        if (typeof window !== 'undefined' && (window as any).electronAPI?.isElectron) {
            const api = (window as any).electronAPI;

            // Get current version
            api.getAppVersion().then((version: string) => {
                setCurrentVersion(version);
            });

            // Listen for update events
            api.onUpdateAvailable((info: UpdateInfo) => {
                setUpdateAvailable(true);
                setUpdateInfo(info);
            });

            api.onUpdateDownloaded((info: UpdateInfo) => {
                setUpdateDownloaded(true);
                setIsDownloading(false);
                setUpdateInfo(info);
            });

            api.onDownloadProgress((progress: { percent: number }) => {
                setDownloadProgress(Math.round(progress.percent));
            });

            api.onUpdateError((err: string) => {
                setError(err);
                setIsDownloading(false);
            });
            api.onUpdateStatus((status: string) => {
                // You might want to show this status in the UI temporarily or as a toast
                console.log('Update status:', status);
                if (status === 'App is up to date') {
                    // Show a temporary success message or just log it
                    // For now, let's just ensure we clear any error state
                    setError(null);
                    setUpdateAvailable(false);
                    alert('App is up to date!'); // Simple feedback for now
                }
            });
        }
    }, []);

    const handleDownload = async () => {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            setIsDownloading(true);
            setError(null);
            await (window as any).electronAPI.downloadUpdate();
        }
    };

    const handleInstall = () => {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            (window as any).electronAPI.installUpdate();
        }
    };

    const handleCheckForUpdates = async () => {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            setError(null);
            await (window as any).electronAPI.checkForUpdates();
        }
    };

    // Don't render anything if not in Electron
    if (typeof window === 'undefined' || !(window as any).electronAPI?.isElectron) {
        return null;
    }

    if (error) {
        return (
            <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm z-50">
                <XCircle size={20} />
                <div>
                    <p className="text-sm font-semibold">Update Error</p>
                    <p className="text-xs">{error}</p>
                </div>
            </div>
        );
    }

    if (updateDownloaded) {
        return (
            <div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm z-50">
                <CheckCircle size={20} />
                <div className="flex-1">
                    <p className="text-sm font-semibold">Update Ready!</p>
                    <p className="text-xs">Version {updateInfo.version} is ready to install.</p>
                </div>
                <button
                    onClick={handleInstall}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                    Restart & Install
                </button>
            </div>
        );
    }

    if (isDownloading) {
        return (
            <div className="fixed bottom-4 right-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl shadow-lg max-w-sm z-50">
                <div className="flex items-center gap-3 mb-2">
                    <ArrowDownToLine size={20} className="animate-bounce" />
                    <div>
                        <p className="text-sm font-semibold">Downloading Update...</p>
                        <p className="text-xs">{downloadProgress}% complete</p>
                    </div>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${downloadProgress}%` }}
                    />
                </div>
            </div>
        );
    }

    if (updateAvailable) {
        return (
            <div className="fixed bottom-4 right-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm z-50">
                <Download size={20} />
                <div className="flex-1">
                    <p className="text-sm font-semibold">Update Available!</p>
                    <p className="text-xs">Version {updateInfo.version} is available.</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                    Download
                </button>
            </div>
        );
    }

    // Show current version with check button
    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={handleCheckForUpdates}
                className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                title="Check for updates"
            >
                <RefreshCw size={14} />
                v{currentVersion}
            </button>
        </div>
    );
}

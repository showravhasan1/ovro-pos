const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Disable GPU acceleration for better compatibility
app.disableHardwareAcceleration();

let mainWindow;
let splashWindow;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
// GitHub provider is configured in package.json build.publish

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        icon: path.join(__dirname, 'icon.ico'),
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Remove menu bar
    mainWindow.setMenuBarVisibility(false);

    if (isDev) {
        // Development mode - load from Next.js dev server
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // Production mode - load from root (POS is now the home page)
        const indexPath = path.join(__dirname, '..', 'out', 'index.html');
        mainWindow.loadFile(indexPath);
    }

    mainWindow.once('ready-to-show', () => {
        if (splashWindow) {
            splashWindow.close();
        }
        mainWindow.show();

        // Check for updates on startup (production only)
        if (!isDev) {
            setTimeout(() => {
                autoUpdater.checkForUpdates().catch(err => {
                    console.log('Update check failed:', err.message);
                });
            }, 3000); // Wait 3 seconds after app shows
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

// App lifecycle
app.whenReady().then(() => {
    createSplashWindow();
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('check-for-updates', async () => {
    if (isDev) {
        return { updateAvailable: false, message: 'Updates disabled in development' };
    }
    try {
        const result = await autoUpdater.checkForUpdates();
        return result;
    } catch (error) {
        return { error: error.message };
    }
});

ipcMain.handle('download-update', async () => {
    try {
        await autoUpdater.downloadUpdate();
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
});

ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('open-dashboard', () => {
    const dashboardWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Ovro POS - Dashboard',
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        backgroundColor: '#ffffff'
    });

    dashboardWindow.setMenuBarVisibility(false);
    dashboardWindow.loadURL('https://admin.showravhasan.com');

    // Open links in external browser
    dashboardWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
    sendToRenderer('update-status', 'Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
    sendToRenderer('update-available', info);
});

autoUpdater.on('update-not-available', () => {
    sendToRenderer('update-status', 'App is up to date');
});

autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('download-progress', progress);
});

autoUpdater.on('update-downloaded', (info) => {
    sendToRenderer('update-downloaded', info);
});

autoUpdater.on('error', (error) => {
    sendToRenderer('update-error', error.message);
});

function sendToRenderer(channel, data) {
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send(channel, data);
    }
}

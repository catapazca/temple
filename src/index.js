// @flow

import path from 'path';
import { app, BrowserWindow, Tray, Menu, globalShortcut } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import AutoLaunch from 'auto-launch';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload({ strategy: 'react-hmr' });

async function handleReady() {
  if (isDevMode) {
    // Show the window immediately.
    await focusWindow();
  }

  createTray();

  registerShortcut();

  if (!isDevMode) {
    registerAutoLaunch();
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 320,
    frame: false,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the Chrome DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    // Dereference the window object; usually you would store windows
    // in an array if your app supports multi windows.
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'images/icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Focus', click: focusWindow },
    { label: 'Quit', click: quit },
  ]);
  tray.setContextMenu(contextMenu);

  tray.setToolTip('Temple');
}

function registerShortcut() {
  globalShortcut.register('CmdOrCtrl+Alt+Shift+Space', focusWindow);
}

function registerAutoLaunch() {
  const autoLauncher = new AutoLaunch({
    name: 'Temple',
  });
  autoLauncher.enable();
}

async function focusWindow() {
  if (mainWindow) {
    mainWindow.focus();
  } else {
    await createWindow();
  }
}

function handleAllClosed() {
  // No-op; remain in tray.
}

async function handleActivate() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    await createWindow();
  }
}

function quit() {
  app.quit();
}

app.on('ready', handleReady);

app.on('window-all-closed', handleAllClosed);

app.on('activate', handleActivate);

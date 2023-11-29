const path = require("path");
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const localShortcut = require("electron-localshortcut");


const isMac = process.platform === 'darwin';

const isDev = process.env.NODE_ENV != "development";


// Create the main window
function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: "Automation App",
        width: 1400,
        height: 750,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });

   //  dev tools -> dev environment ONLY;
  /* if (isDev) {
    mainWindow.webContents.openDevTools();
}
*/
    mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));



    
    

    // pasting functionality
    mainWindow.webContents.on("did-finish-load", () => {
        localShortcut.register(mainWindow, "CmdOrCtrl+V", () => {
          mainWindow.webContents.paste();
        });
    
        localShortcut.register(mainWindow, "CmdOrCtrl+A", () => {
          mainWindow.webContents.selectAll();
        });
      });
}
    


//reloading 
ipcMain.on("reload-window", (event) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.reload();
    }
  });
// About window
function AboutPage() {
    console.log("about page");
}

// App ready
app.whenReady().then(() => {
    createMainWindow();

    // Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// menu-template
const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: AboutPage,
            }
        ]
    }] : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac ? [{
        label: "Help",
        submenu: [
            {
                label: "About",
            }
        ]
    }] : [])
];

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

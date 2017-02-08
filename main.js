const electron = require('electron');
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    dialog
} = electron;
const path = require('path');
const url = require('url');
const fs = require('fs');
const menuFunctions = require('./menuFunctions');
const loadPersistedData = require('./dataPersistance');

let win;

const DATA_FILE_PATH = path.join(app.getPath("userData"), "data.json");

const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CommandOrControl+O',
                click: menuFunctions.open
            },
            {
                role: 'quit'
            }
        ]
    },
    {
        label: 'eBook',
        submenu: [
            {
                label: 'Next Page',
                accelerator: 'Right',
                click: menuFunctions.nextPage
            },
            {
                label: 'Previous Page',
                accelerator: 'Left',
                click: menuFunctions.previousPage
            },
            {
                label: 'Back',
                accelerator: 'Alt+Left',
                click: menuFunctions.back
            },
            {
                label: 'Forward',
                accelerator: 'Alt+Right',
                click: menuFunctions.forward
            },
            {
                label: 'Toggle Table of Contents',
                accelerator: 'Control+t',
                click: menuFunctions.toggleToc
            },
            {
                label: 'Increase Font Size',
                accelerator: 'Control+=',
                click: menuFunctions.increaseFontSize
            },
            {
                label: 'Decrease Font Size',
                accelerator: 'Control+-',
                click: menuFunctions.decreaseFontSize
            },
            {
                label: 'Restore Default Font Size',
                accelerator: 'Control+0',
                click: menuFunctions.restoreDefaultFontSize
            }
        ]
    },
    {
        label: 'Window',
        submenu: [
            {
                role: 'toggledevtools'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    }
];

function createWindow(bookData) {
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;

    const iconPath = path.join(__dirname, "icon.png");
    
    const windowOptions = {
        width: width,
        height: height,
        icon: iconPath
    }
    
    win = new BrowserWindow(windowOptions);

    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: 'file',
        slashes: true
    }));

    const parseArgv = function() {
        if (process.argv[2]) {
            fs.access(process.argv[2], function(err) {
                if (err) {
                    dialog.showMessageBox(win, {
                        type: "error",
                        title: "Error loading book",
                        message: "Unable to load file " + process.argv[2] + ".",
                        buttons: ["OK"]
                    });
                }
                else {
                    win.webContents.send('loadBook', process.argv[2])
                }
            });
        }
    }
    
    if (bookData) {
        win.webContents.on('dom-ready', function() {
            win.webContents.send('loadPersistedData', bookData);
            parseArgv();
        });
    }
    else {
        win.webContents.on('dom-ready', function() {
            win.webContents.send('initNoData');
            parseArgv();
        });
    }

    win.on('closed', () => {
        win = null;
    });
}

function init() {
    loadPersistedData(function(err, data) {
        if (err) {
            if (err.code === 'ENOENT') {
                createWindow();
            }
            else if (err instanceof SyntaxError) {
                console.error("Could not read config file: invalid syntax.");
                createWindow();
            }
            else {
                throw err;
            }
        }
        else {
            createWindow(data);
        }

        ipcMain.on('persistData', function(event, bookData) {
            const json = JSON.stringify(bookData);
            fs.writeFile(DATA_FILE_PATH, json, 'utf8', (err) => {
                if (err) {
                    throw err;
                }
            }); 
        });
    });
}

app.on("ready", init);


app.on("windows-all-closed", () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        init();
    }
});

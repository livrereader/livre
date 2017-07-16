const electron = require('electron');
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    dialog,
    powerSaveBlocker
} = electron;
const path = require('path');
const url = require('url');
const fs = require('fs');
const menuFunctions = require('./lib/menuFunctions');
const loadPersistedData = require('./lib/dataPersistance');
const config = require('./lib/config');

let win;

const DATA_FILE_PATH = path.join(app.getPath('userData'), 'data.json');

const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CommandOrControl+O',
                click: menuFunctions.open(maybeNewWindow => {
                    win = maybeNewWindow;
                })
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
                label: 'Find in Chapter',
                accelerator: 'CommandOrControl+f',
                click: menuFunctions.find
            },
            {
                label: 'Toggle Table of Contents',
                accelerator: 'CommandOrControl+t',
                click: menuFunctions.toggleToc
            },
            {
                label: 'Increase Font Size',
                accelerator: 'CommandOrControl+=',
                click: menuFunctions.increaseFontSize
            },
            {
                label: 'Decrease Font Size',
                accelerator: 'CommandOrControl+-',
                click: menuFunctions.decreaseFontSize
            },
            {
                label: 'Restore Default Font Size',
                accelerator: 'CommandOrControl+0',
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
            },
            {
                accelerator: 'Escape',
                click: menuFunctions.escape,
                visible: false
            }
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Report an Issue',
                click: menuFunctions.reportIssue
            }
        ]
    }
];

function createWindow(bookData) {
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    const { width, height } = config();

    const windowOptions = {
        width: width,
        height: height
    };

    win = new BrowserWindow(windowOptions);

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, '..', '..', 'html', 'index.html'),
            protocol: 'file',
            slashes: true
        })
    );

    const parseArgv = function() {
        // Ugly hack because the path could be argv[1] or argv[2] depending on whether
        // we are running a compiled binary or source code
        let bookPath = process.argv[1];
        if (
            bookPath &&
            typeof bookPath === 'string' &&
            path.extname(bookPath).toLowerCase() !== '.epub'
        ) {
            bookPath = process.argv[2];
        }
        if (bookPath) {
            bookPath = path.resolve(bookPath);
            fs.access(bookPath, function(err) {
                if (err) {
                    dialog.showMessageBox(win, {
                        type: 'error',
                        title: 'Error loading book',
                        message: 'Unable to load file ' + bookPath + '.',
                        buttons: ['OK']
                    });
                } else if (path.extname(bookPath).toLowerCase() !== '.epub') {
                    dialog.showMessageBox(win, {
                        type: 'error',
                        title: 'Error loading book',
                        message: bookPath + ' is not a valid .epub file.',
                        buttons: ['OK']
                    });
                } else {
                    win.webContents.send('loadBook', bookPath);
                }
            });
        }
    };

    if (bookData) {
        win.webContents.on('dom-ready', function() {
            win.webContents.send('loadPersistedData', bookData);
            parseArgv();
        });
    } else {
        win.webContents.on('dom-ready', function() {
            win.webContents.send('initNoData');
            parseArgv();
        });
    }

    win.on('closed', () => {
        win = null;
    });

    createBackgroundWindow();
}

function createBackgroundWindow() {
    backgroundWin = new BrowserWindow({ show: false });

    backgroundWin.loadURL(
        url.format({
            pathname: path.join(__dirname, '..', '..', 'html', 'background.html'),
            protocol: 'file',
            slashes: true
        })
    );

    ipcMain.on('find', (event, data) => {
        backgroundWin.webContents.send('find', data);
    });

    ipcMain.on('findResults', (event, data) => {
        win.webContents.send('findResults', data);
    });
}

function init() {
    loadPersistedData(function(err, data) {
        if (err) {
            if (err.code === 'ENOENT') {
                createWindow();
            } else if (err instanceof SyntaxError) {
                console.error('Could not read config file: invalid syntax.');
                createWindow();
            } else {
                throw err;
            }
        } else {
            createWindow(data);
        }

        ipcMain.on('persistData', function(event, bookData) {
            const json = JSON.stringify(bookData);
            fs.writeFile(DATA_FILE_PATH, json, 'utf8', err => {
                if (err) {
                    throw err;
                }
            });
        });
    });
}

const powerSaveId = powerSaveBlocker.start('prevent-display-sleep');

app.on('ready', init);

app.on('windows-all-closed', () => {
    powerSaveBlocker.stop(powerSaveId);
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        init();
    }
});

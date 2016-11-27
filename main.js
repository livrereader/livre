const electron = require('electron');
const {
    app,
    BrowserWindow,
    Menu
} = electron;
const path = require('path');
const url = require('url');
const menuFunctions = require('./menuFunctions');

let win;

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

function createWindow() {
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    
    const windowOptions = {
        width: width,
        height: height
    }
    
    win = new BrowserWindow(windowOptions);

    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: 'file',
        slashes: true
    }));

    win.on('closed', () => {
        win = null;
    })
}

app.on("ready", createWindow);

app.on("windows-all-closed", () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

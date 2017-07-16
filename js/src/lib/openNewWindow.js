const electron = require('electron');
const { BrowserWindow, dialog } = electron;
const path = require('path');
const url = require('url');
const fs = require('fs');
const loadPersistedData = require('./dataPersistance');
const config = require('./config');

const createWindow = function(bookData, bookPath) {
    const { width, height } = config();

    const windowOptions = {
        width: width,
        height: height
    };

    const win = new BrowserWindow(windowOptions);

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, '..', '..', '..', 'html', 'index.html'),
            protocol: 'file',
            slashes: true
        })
    );

    const openBook = () => {
        bookPath = path.resolve(bookPath);
        fs.access(bookPath, err => {
            if (err) {
                dialog.showMessageBox(win, {
                    type: 'error',
                    title: 'Error loading book',
                    message: `Unable to load file ${bookPath}.`,
                    buttons: ['OK']
                });
            } else {
                win.webContents.send('loadBook', bookPath);
            }
        });
    };

    if (bookData) {
        win.webContents.on('dom-ready', () => {
            win.webContents.send('loadPersistedData', bookData);
            openBook();
        });
    } else {
        win.webContents.on('dom-ready', () => {
            win.webContents.send('initNoData');
            openBook();
        });
    }

    return win;
};

module.exports = function(bookPath, callback) {
    loadPersistedData((err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                callback(createWindow(null, bookPath));
            } else if (err instanceof SyntaxError) {
                console.error('Could not read config file: invalid syntax.');
                callback(createWindow(null, bookPath));
            } else {
                throw err;
            }
        } else {
            callback(createWindow(data, bookPath));
        }
    });
};

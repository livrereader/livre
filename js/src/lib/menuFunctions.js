const { dialog, shell } = require('electron');
const openNewWindow = require('./openNewWindow');
const config = require('./config');

const openDialogOptions = {
    filters: [{ name: 'eBooks', extensions: ['epub'] }],
    properties: ['openFile']
};

module.exports = {
    open: function(callback) {
        return function(menuItem, browserWindow) {
            dialog.showOpenDialog(
                browserWindow,
                openDialogOptions,
                bookPaths => {
                    if (bookPaths) {
                        if (browserWindow) {
                            browserWindow.webContents.send(
                                'loadBook',
                                bookPaths[0]
                            );
                            callback(browserWindow);
                        } else {
                            openNewWindow(bookPaths[0], callback);
                        }
                    }
                }
            );
        };
    },
    nextPage: function(menuItem, browserWindow) {
        browserWindow.webContents.send('nextPage');
    },
    previousPage: function(menuItem, browserWindow) {
        browserWindow.webContents.send('prevPage');
    },
    increaseFontSize: function(menuItem, browserWindow) {
        browserWindow.webContents.send('increaseFont');
    },
    decreaseFontSize: function(menuItem, browserWindow) {
        browserWindow.webContents.send('decreaseFont');
    },
    restoreDefaultFontSize: function(menuItem, browserWindow) {
        browserWindow.webContents.send('restoreFont');
    },
    toggleToc: function(menuItem, browserWindow) {
        browserWindow.webContents.send('toggleToc');
    },
    back: function(menuItem, browserWindow) {
        browserWindow.webContents.send('back');
    },
    forward: function(menuItem, browserWindow) {
        browserWindow.webContents.send('forward');
    },
    find: function(menuItem, browserWindow) {
        browserWindow.webContents.send('find');
    },
    escape: function(menuItem, browserWindow) {
        browserWindow.webContents.send('escape');
    },
    reportIssue: function(menuItem, browserWindow) {
        shell.openExternal(config().reportIssueUrl);
    }
};

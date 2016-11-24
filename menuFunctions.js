const {dialog} = require('electron');

const openDialogOptions = {
  filters: [
    {name: "eBooks", extensions: ['epub']}
  ],
  properties: ['openFile']
};

module.exports = {
  open: function(menuItem, browserWindow) {
    dialog.showOpenDialog(browserWindow, openDialogOptions, (bookPaths) => {
      if (bookPaths) {
        browserWindow.webContents.send('loadBook', bookPaths[0]);
      }
    });
  },
  nextPage: function(menuItem, browserWindow) {
    browserWindow.webContents.send('nextPage');
  },
  previousPage: function(menuItem, browserWindow) {
    browserWindow.webContents.send('prevPage');
  }
}

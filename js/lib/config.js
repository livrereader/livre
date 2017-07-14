const electron = require('electron');
const { app } = electron;

module.exports = () => {
    if (!app.isReady()) {
        throw new Error('Cannot load config until app is ready');
    }
    return {
        width: electron.screen.getPrimaryDisplay().workAreaSize.width,
        height: electron.screen.getPrimaryDisplay().workAreaSize.height
    };
};

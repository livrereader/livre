const path = require('path');

module.exports = {
    entry: './js/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.bundle.js',
        library: 'Livre',
        libraryTarget: 'var'
    },
    target: 'electron-renderer'
};

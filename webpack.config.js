const path = require('path');

module.exports = {
    entry: './js/src/renderer.js',
    output: {
        path: path.resolve(__dirname, 'js', 'dist'),
        filename: 'renderer.bundle.js',
        library: 'Livre',
        libraryTarget: 'var'
    },
    target: 'electron-renderer'
};

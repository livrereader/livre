# Livre
> An eBook reader built on [Electron](http://electron.atom.io)

*Livre* is a minimal eBook reader. Currently, it only support `.epub` formatted eBooks.

## Download
*Livre* is still in development. When it's done, binaries for Windows, Linux, and MacOS will be available; currently, you'll have to download the source and build it yourself.

## Features
- Minimalistic interface
- Remembers the last page you read in every eBook
- Remembers recently opened eBooks for easy access
- Table of contents with links
- Back and forward functionality
- Full text search

## Installation and Usage
```
$ git clone https://github.com/livrereader/livre
$ cd livre
$ git submodule init
$ git submodule update
$ npm install
$ # To start the Electron process locally:
$ npm start
$ # Or to build a binary for your platform in ./dist:
$ npm run package
```

The compiled binary or the `start` script can be passed a path to a valid `.epub` file; if no file is passed than the app will open to the start screen and books can be opened from within the app.

The build process has been tested on Linux but not Windows or macOS. If you run into problems, please [submit an issue](https://github.com/livrereader/livre/issues).

## Keyboard shortcuts:
Note: macOS uses `cmd` instead of `ctrl`.

`ctrl+o`: Open an eBook

`right arrow`: Next page

`left arrow`: Previous page

`alt+left arrow`: Back

`alt+right arrow`: Forward

`ctrl+t`: Open table of contents

`escape`: Close sidebar

`ctrl+f`: Find in eBook

`ctrl+=`: Increase text size

`ctrl+-`: Decrease text size

`ctrl+0`: Restore default text size

`ctrl+q`: Quit

`ctrl+shift+i`: Toggle Chrome developer tools


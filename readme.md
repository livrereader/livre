# Livre
## An eBook reader built on [Electron](https://electron.atom.io)

*Livre* is a minimal eBook reader. Currently, it only support `.epub` formatted eBooks.

## Download
*Livre* is still in development. When it's done, binaries for Windows, Linux, and MacOS will be available; currently, you'll have to download the source and build it yourself.

## Installation and Usage
```
$ git clone https://github.com/jdormit/livre
$ cd livre
$ npm install
$ # To start the Electron process locally:
$ npm start
$ # Or to build a binary for your platform in ./dist:
$ npm run build
```

Keyboard shortcuts:

`ctrl-o`: Open an eBook

`right arrow`: Next page

`left arrow`: Previous page

`ctrl - t`: Toggle table of contents

`ctrl - =`: Increase text size

`ctrl - -`: Decrease text size

`ctrl - 0`: Restore default text size

`ctrl - q`: Quit

`ctrl - shift - i`: Toggle Chrome developer tools

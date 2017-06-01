const { ipcRenderer, remote } = require("electron");
const { dialog } = remote;
const tocBuilder = require("./tocBuilder");
const recentlyOpenedBuilder = require("./recentlyOpenedBuilder");
const findResultsBuilder = require("./findResultsBuilder");

const DEFAULT_FONT_SIZE = 18;

let Book;
let id;
let persistedData;
let persistInterval;
let backBuffer = [];
let forwardBuffer = [];
let bookPath;

const win = remote.getCurrentWindow();

const init = function() {
    // Build 'recently opened' list
    document
        .getElementById("recently-opened")
        .appendChild(recentlyOpenedBuilder(persistedData, loadBook));

    // Ensure correct body height
    document.body.style.height = win.getSize()[1] - 50 + "px";
    win.on("resize", () => {
        document.body.style.height = win.getSize()[1] - 50 + "px";
    });

    // Set up event listeners
    setupEventListeners();

    // Show #book
    document.getElementById("book").style.display = "flex";
};

const loadBook = function(path) {
    bookPath = path;
    if (Book && Book.destroy) {
        Book.destroy();
    }
    Book = ePub({
        styles: {
            "font-size": DEFAULT_FONT_SIZE + "px"
        }
    });

    const $book = document.getElementById("book");
    $book.innerHTML = "";

    Book.open(bookPath)
        .then(() => Book.renderTo("book", {width: "100%", height: "100%"}))
        .then(() => Book.loaded.metadata)
        .then(metadata => {
            // Fill in title and author div
            if (metadata.title) {
                const $title = document.getElementById("title");
                const title = metadata.creator ? metadata.title + " - " + metadata.creator : metadata.title;
                const titleContent = document.createTextNode(title);
                $title.appendChild(titleContent);
            }
            // Set up location persistence
            id = metadata.identifier;
            if (!persistedData) {
                persistedData = {};
            }
            if (!persistedData[id]) {
                persistedData[id] = {
                    title: metadata.title,
                    href: bookPath
                };
            } else {
                if (
                    !persistedData[id].href ||
                    persistedData[id].href !== bookPath
                ) {
                    persistedData[id].href = bookPath;
                }
                if (
                    !persistedData[id].title ||
                    persistedData[id].title !== metadata.title
                ) {
                    persistedData[id].title = metadata.title;
                }
            }
            if (persistedData[id].currentLocation) {
                return persistedData[id].currentLocation;
            }
        })
        .then(location => Book.rendition.display(location))
        .then(() => {
            ipcRenderer.send("persistData", persistedData);

            if (persistInterval) {
                window.clearInterval(persistInterval);
            }

            persistInterval = window.setInterval(() => {
                ipcRenderer.send("persistData", persistedData);
            }, 30000);

            return Book.loaded.navigation;
        })
        .then(navigation => {
            const toc = navigation.toc;
            const $tocEl = document.getElementById("table-of-contents");
            if (!toc || toc.length === 0) {
                $tocEl.innerHTML = "<h2>No table of contents available.</h2>";
            } else {
                $tocEl.innerHTML = "";
                $tocList = tocBuilder(toc, Book, backBuffer, forwardBuffer);
                $tocEl.appendChild($tocList);
            }
        })
        .then(() => {
            // Setup Book event listeners
            Book.rendition.on("locationChanged", function(locationCfi) {
                persistedData[id].currentLocation = locationCfi.start;
                ipcRenderer.send("persistData", persistedData);
            });
            Book.rendition.hooks.content.register(view => {
                view.on("link", link => {
                    backBuffer.push(Book.rendition.currentLocation().start);
                    forwardBuffer = [];
                });
            });
        })
        .then(() => {
            const $findInput = document.getElementById("findInput");
            $findInput.removeAttribute("disabled");
        })
        .catch(err => {
            alert("Something went wrong!\n" + err.stack);
            if (Book && Book.destroy) {
                Book.destroy();
            }
            $book.innerHTML = "";
            init();
        });
};

const openDialogOptions = {
    filters: [{ name: "eBooks", extensions: ["epub"] }],
    properties: ["openFile"]
};

const loadBookDialog = function() {
    dialog.showOpenDialog(win, openDialogOptions, bookPaths => {
        if (bookPaths) {
            bookPath = bookPaths[0];
            loadBook(bookPath);
        }
    });
};

const toggleToc = function() {
    const $tocEl = document.getElementById("table-of-contents");
    if ($tocEl.style.display === "none" || $tocEl.style.display === "") {
        $tocEl.style.display = "inline";
    } else {
        $tocEl.style.display = "none";
    }
};

const nextPage = function() {
    backBuffer.push(Book.rendition.currentLocation().start);
    forwardBuffer = [];
    Book.rendition.next();
};

const prevPage = function() {
    backBuffer.push(Book.rendition.currentLocation().start);
    forwardBuffer = [];
    Book.rendition.prev();
};

const toggleFind = function() {
    const $find = document.getElementById("find");
    if ($find.style.display == "none" || $find.style.display == "") {
        $find.style.display = "inline";
    } else {
        $find.style.display = "none";
    }
};

function setupEventListeners() { 

    const $findInput = document.getElementById("findInput");
    $findInput.addEventListener("input", event => {
        const query = $findInput.value;
        if (query === "") {
            return;
        }
        ipcRenderer.send('find', {
            bookPath: bookPath,
            query: query
        });
    });
    ipcRenderer.on('findResults', (event, data) => {
        const $findResults = document.getElementById("findResults");
        $findResults.innerHTML = "";
        $resultsList = findResultsBuilder(data, Book, backBuffer, forwardBuffer);
        $findResults.appendChild($resultsList);
    });
}

let currentFontSize = DEFAULT_FONT_SIZE;

ipcRenderer.on("loadPersistedData", (event, data) => {
    persistedData = data;
    init();
});

ipcRenderer.on("initNoData", () => {
    init();
});

ipcRenderer.on("loadBook", (event, path) => {
    bookPath = path;
    loadBook(bookPath);
});

ipcRenderer.on("prevPage", () => {
    prevPage();
});

ipcRenderer.on("nextPage", () => {
    nextPage();
});

ipcRenderer.on("increaseFont", () => {
    currentFontSize += 2;
    Book.rendition.themes.fontSize(currentFontSize + "px");
});

ipcRenderer.on("decreaseFont", () => {
    currentFontSize -= 2;
    Book.rendition.themes.fontSize(currentFontSize + "px");
});

ipcRenderer.on("restoreFont", () => {
    currentFontSize = DEFAULT_FONT_SIZE;
    Book.rendition.themes.fontSize(currentFontSize + "px");
});

ipcRenderer.on("toggleToc", () => {
    toggleToc();
});

ipcRenderer.on("back", () => {
    backLocation = backBuffer.pop();
    if (backLocation) {
        if (
            forwardBuffer[forwardBuffer.length - 1] !==
            Book.rendition.currentLocation().start
        ) {
            forwardBuffer.push(Book.rendition.currentLocation().start);
        }
        Book.rendition.display(backLocation);
    }
});

ipcRenderer.on("forward", () => {
    forwardLocation = forwardBuffer.pop();
    if (forwardLocation) {
        if (
            backBuffer[backBuffer.length - 1] !==
            Book.rendition.currentLocation().start
        ) {
            backBuffer.push(Book.rendition.currentLocation().start);
        }
        Book.rendition.display(forwardLocation);
    }
});

ipcRenderer.on("find", () => {
    toggleFind();
});

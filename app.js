const { ipcRenderer, remote } = require("electron");
const { dialog } = remote;
const tocBuilder = require("./tocBuilder");
const recentlyOpenedBuilder = require("./recentlyOpenedBuilder");

const DEFAULT_FONT_SIZE = 18;

let Book;
let id;
let persistedData;
let persistInterval;
let backBuffer = [];
let forwardBuffer = [];

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

    // Show #book
    document.getElementById("book").style.display = "flex";
};

const loadBook = function(bookPath) {
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

    Promise.resolve(Book.open(bookPath))
        .then(() => Book.getMetadata())
        .then(metadata => {
            // Fill in title and author div
            if (metadata.bookTitle) {
                const $title = document.getElementById("title");
                const title = metadata.creator ? metadata.bookTitle + " - " + metadata.creator : metadata.bookTitle;
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
                    title: metadata.bookTitle,
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
                    persistedData[id].title !== metadata.bookTitle
                ) {
                    persistedData[id].title = metadata.bookTitle;
                }
            }
            if (persistedData[id].currentLocation) {
                Book.settings.previousLocationCfi =
                    persistedData[id].currentLocation;
            }
        })
        .then(() => Book.renderTo("book"))
        .then(() => {
            ipcRenderer.send("persistData", persistedData);

            Book.on("renderer:locationChanged", function(locationCfi) {
                persistedData[id].currentLocation = locationCfi;
                ipcRenderer.send("persistData", persistedData);
            });

            if (persistInterval) {
                window.clearInterval(persistInterval);
            }

            persistInterval = window.setInterval(() => {
                ipcRenderer.send("persistData", persistedData);
            }, 30000);

            return Book.getToc();
        })
        .then(toc => {
            const $tocEl = document.getElementById("table-of-contents");
            if (!toc || toc.length === 0) {
                $tocEl.innerHTML = "<h2>No table of contents available.</h2>";
            } else {
                $tocEl.innerHTML = "";
                $tocList = tocBuilder(toc, Book, backBuffer, forwardBuffer);
                $tocEl.appendChild($tocList);
            }
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
            loadBook(bookPaths[0]);
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
    backBuffer.push(Book.renderer.currentLocationCfi);
    forwardBuffer = [];
    Book.nextPage();
};

const prevPage = function() {
    backBuffer.push(Book.renderer.currentLocationCfi);
    forwardBuffer = [];
    Book.prevPage();
};

let currentFontSize = DEFAULT_FONT_SIZE;

ipcRenderer.on("loadPersistedData", (event, data) => {
    persistedData = data;
    init();
});

ipcRenderer.on("initNoData", () => {
    init();
});

ipcRenderer.on("loadBook", (event, bookPath) => {
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
    Book.setStyle("font-size", currentFontSize + "px");
});

ipcRenderer.on("decreaseFont", () => {
    currentFontSize -= 2;
    Book.setStyle("font-size", currentFontSize + "px");
});

ipcRenderer.on("restoreFont", () => {
    currentFontSize = DEFAULT_FONT_SIZE;
    Book.setStyle("font-size", currentFontSize + "px");
});

ipcRenderer.on("toggleToc", () => {
    toggleToc();
});

ipcRenderer.on("back", () => {
    backLocation = backBuffer.pop();
    if (backLocation) {
        if (
            forwardBuffer[forwardBuffer.length - 1] !==
            Book.renderer.currentLocationCfi
        ) {
            forwardBuffer.push(Book.renderer.currentLocationCfi);
        }
        Book.goto(backLocation);
    }
});

ipcRenderer.on("forward", () => {
    forwardLocation = forwardBuffer.pop();
    if (forwardLocation) {
        if (
            backBuffer[backBuffer.length - 1] !==
            Book.renderer.currentLocationCfi
        ) {
            backBuffer.push(Book.renderer.currentLocationCfi);
        }
        Book.goto(forwardLocation);
    }
});

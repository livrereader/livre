const { ipcRenderer, remote } = require("electron");
const { dialog } = remote;
const tocBuilder = require("./tocBuilder");
const recentlyOpenedBuilder = require("./recentlyOpenedBuilder");
const findResultsBuilder = require("./findResultsBuilder");

const DEFAULT_FONT_SIZE = 1.2;
const LOADING_HTML =
    '<div class="findLoading"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>';

let Book;
let id;
let persistedData;
let persistInterval;
let backBuffer = [];
let forwardBuffer = [];
let tableOfContents = "<h2>No table of contents available</h2>";

const win = remote.getCurrentWindow();

const init = function() {
    // Build 'recently opened' list
    document
        .getElementById("recently-opened")
        .appendChild(recentlyOpenedBuilder(persistedData, loadBook));

    // Ensure correct body height
    const SIZE_ADJUSTMENT_FACTOR = 25;
    document.body.style.height =
        win.getSize()[1] - win.getSize()[1] / SIZE_ADJUSTMENT_FACTOR + "px";
    win.on("resize", () => {
        document.body.style.height =
            win.getSize()[1] - win.getSize()[1] / SIZE_ADJUSTMENT_FACTOR + "px";
    });

    // Set up event listeners
    setupEventListeners();

    // Show #book
    document.getElementById("book").style.display = "flex";
};

const loadBook = function(bookPath) {
    if (Book && Book.destroy) {
        Book.destroy();
    }
    Book = ePub({
        styles: {
            "font-size": DEFAULT_FONT_SIZE + "rem"
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
                $title.innerHTML = "";
                const title = metadata.creator
                    ? metadata.bookTitle + " - " + metadata.creator
                    : metadata.bookTitle;
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

            Book.on("book:linkClicked", function(href) {
                backBuffer.push(Book.renderer.currentLocationCfi);
                forwardBuffer = [];
            });

            if (persistInterval) {
                window.clearInterval(persistInterval);
            }

            persistInterval = window.setInterval(() => {
                ipcRenderer.send("persistData", persistedData);
            }, 30000);
        })
        .then(() => {
            const $sidebarContents = document.getElementById(
                "sidebar-contents"
            );
            $sidebarContents.innerHTML = "";
            $sidebarContents.innerHTML = LOADING_HTML;
        })
        .then(() => Book.getToc())
        .then(toc => {
            return Book.locations.generate().then(() => toc);
        })
        .then(toc => {
            const $sidebarContents = document.getElementById(
                "sidebar-contents"
            );
            if (toc && toc.length > 0) {
                tableOfContents = tocBuilder(
                    toc,
                    Book,
                    backBuffer,
                    forwardBuffer
                );
                $sidebarContents.innerHTML = "";
                $sidebarContents.appendChild(tableOfContents);
            }
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
            loadBook(bookPaths[0]);
        }
    });
};

const toggleSidebar = function() {
    const $tocEl = document.getElementById("sidebar");
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

const showClearFind = function() {
    const $clearFind = document.getElementById("clearFind");
    $clearFind.style.display = "inline-block";
};

const hideClearFind = function() {
    const $clearFind = document.getElementById("clearFind");
    $clearFind.style.display = "none";
};

function setupEventListeners() {
    const $findInput = document.getElementById("findInput");
    const $sidebarContents = document.getElementById("sidebar-contents");
    $findInput.addEventListener("input", event => {
        $sidebarContents.innerHTML = "";
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            const query = $findInput.value;
            if (query === "") {
                $sidebarContents.appendChild(tableOfContents);
                return;
            }
            showClearFind();
            ipcRenderer.send("find", {
                bookPath: Book.settings.bookPath,
                query: query
            });
            $sidebarContents.innerHTML = LOADING_HTML;
        }, 150);
    });
    ipcRenderer.on("findResults", (event, data) => {
        $sidebarContents.innerHTML = "";
        $resultsList = findResultsBuilder(
            data,
            Book,
            backBuffer,
            forwardBuffer
        );
        $sidebarContents.appendChild($resultsList);
    });

    const $menuButton = document.getElementById("menu-button");
    $menuButton.addEventListener("click", event => {
        toggleSidebar();
    });

    const $clearFind = document.getElementById("clearFind");
    $clearFind.addEventListener("click", event => {
        $findInput.value = "";
        $findInput.dispatchEvent(new Event("input"));
        hideClearFind();
    });

    // TODO this is janky - it shouldn't be necessary
    $sidebarContents.addEventListener("scroll", event => {
        $sidebarContents.scrollLeft = 0;
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
    currentFontSize /= 0.75;
    Book.setStyle("font-size", currentFontSize + "rem");
});

ipcRenderer.on("decreaseFont", () => {
    currentFontSize *= 0.75;
    Book.setStyle("font-size", currentFontSize + "rem");
});

ipcRenderer.on("restoreFont", () => {
    currentFontSize = DEFAULT_FONT_SIZE;
    Book.setStyle("font-size", currentFontSize + "rem");
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

ipcRenderer.on("find", () => {
    toggleFind();
});

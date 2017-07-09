const menuItem = require("./menuItem");
const menuList = require("./menuList");

const buildTocListItem = function(tocItem, Book, backBuffer, forwardBuffer) {
    const location = Book.locations.locationFromCfi(tocItem.cfi);

    const onclick = event => {
        event.stopPropagation();
        backBuffer.push(Book.renderer.currentLocationCfi);
        forwardBuffer = [];
        Book.goto(tocItem.href);
    };

    const $tocItem = menuItem({
        body: tocItem.label.trim(),
        footer: `Location: ${location}`,
        onclick: onclick
    });

    const parentItem = () => {
        const $wrapper = document.createElement("li");
        const $item = $tocItem;
        const $subitem = menuList({
            items: tocItem.subitems.map(subitem =>
                buildTocListItem(subitem, Book, backBuffer, forwardBuffer)
            )
        });
        $wrapper.appendChild($subitem);
        $wrapper.insertBefore($item, $subitem);
        return $wrapper;
    };

    return tocItem.subitems && tocItem.subitems.length > 0
        ? parentItem()
        : $tocItem;
};

module.exports = function(toc, Book, backBuffer, forwardBuffer) {
    return menuList({
        items: toc.map(tocItem =>
            buildTocListItem(tocItem, Book, backBuffer, forwardBuffer)
        ),
        id: "table-of-contents",
        classList: ["toc"]
    });
};

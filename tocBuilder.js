const menuItem = require('./menuItem');
const menuList = require('./menuList');

const buildTocListItem = function(tocItem, Book, backBuffer, forwardBuffer) {
    const location = Book.locations.locationFromCfi(tocItem.cfi);
    const body = tocItem.subItems && tocItem.subitems.length > 0
          ? 'TODO'
          : tocItem.label.trim();
    return menuItem({
        body: body,
        footer: `Location: ${location}`,
        onclick: event => {
            event.stopPropagation();
            backBuffer.push(Book.renderer.currentLocationCfi);
            forwardBuffer = [];
            Book.goto(tocItem.href);
        }
    });

    if (tocItem.subitems && tocItem.subitems.length > 0) {
        const $subList = document.createElement("ul");
        for (let i in tocItem.subitems) {
            let subItem = tocItem.subitems[i];
            let $subItemList = buildTocListItem(
                subItem,
                Book,
                backBuffer,
                forwardBuffer
            );
            $subList.appendChild($subItemList);
        }
        $listItem.appendChild($subList);
    }
};

module.exports = function(toc, Book, backBuffer, forwardBuffer) {
    const tocItems = toc.map(tocItem => buildTocListItem(tocItem, Book, backBuffer, forwardBuffer));

    return menuList({
        items: tocItems,
        id: 'table-of-contents',
        classList: [ 'toc' ]
    });

    const $tocList = document.createElement("ul");
    $tocList.id = "table-of-contents";
    $tocList.classList = "toc";
    for (let i in toc) {
        let tocItem = toc[i];
        let $listItem = buildTocListItem(
            tocItem,
            Book,
            backBuffer,
            forwardBuffer
        );
        $tocList.appendChild($listItem);
    }
    return $tocList;
};

const buildTocListItem = function(tocItem, Book, backBuffer, forwardBuffer) {
    const $listItem = document.createElement("li");

    const $stylingSpan = document.createElement("span");
    const listItemContent = document.createTextNode(tocItem.label.trim());
    $stylingSpan.appendChild(listItemContent);

    $listItem.appendChild($stylingSpan);

    $listItem.onclick = function(event) {
        event.stopPropagation();
        backBuffer.push(Book.rendition.currentLocation().start);
        forwardBuffer = [];
        Book.rendition.display(tocItem.href);
    };

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

    return $listItem;
};

module.exports = function(toc, Book, backBuffer, forwardBuffer) {
    const $tocList = document.createElement("ul");
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

const buildTocListItem = function(tocItem, Book) {
    const $listItem = document.createElement('li');

    const $stylingSpan = document.createElement('span');
    const listItemContent = document.createTextNode(tocItem.label.trim());
    $stylingSpan.appendChild(listItemContent);

    $listItem.appendChild($stylingSpan);
    
    $listItem.onclick = function(event) {
        event.stopPropagation();
        Book.goto(tocItem.href);
    };
   
    if (tocItem.subitems && tocItem.subitems.length > 0) {
        const $subList = document.createElement('ul');
        for (let i in tocItem.subitems) {
            let subItem = tocItem.subitems[i];
            let $subItemList = buildTocListItem(subItem, Book);
            $subList.appendChild($subItemList);
        }
        $listItem.appendChild($subList);
    }
    
    return $listItem;
}

module.exports = function(toc, Book) {
    const $tocList = document.createElement('ul');
    for (let i in toc) {
        let tocItem = toc[i];
        let $listItem = buildTocListItem(tocItem, Book);
        $tocList.appendChild($listItem);
    }
    return $tocList;
}



const menuList = function(items, onclick) {
    if (!items || !Array.isArray(items)) {
        throw new Error(`${items} is not a list`);
    }
    if (onclick && !typeof onclick === 'function') {
        throw new Error(`${onclick} is not a function`); 
    }

    const $list = document.createElement('ul');
    $list.classList = 'menuList';
    for (let index in items) {
        const item = items[index];
        if (!item instanceof Node) {
            throw new Error(`${item} is not a DOM node`);
        }
        const $item = document.createElement('li');
        $item.classList = 'menuListItem';
        if (onclick) {
            $item.classList.add('clickable');
            $item.onclick = onclick;
        }

        $item.appendChild(item);
        $list.appendChild($item);
    }

    return $list;
}

module.exports = menuList;

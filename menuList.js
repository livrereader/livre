const withClasses = require("./withClasses");

const menuList = function(options) {
    const { items, id, onclick, classList, itemClassList } = options;

    if (!items || !Array.isArray(items)) {
        throw new Error(`${items} is not a list`);
    }
    if (id && !typeof id === "string") {
        throw new Error(`${id} is not a string`);
    }
    if (onclick && !typeof onclick === "function") {
        throw new Error(`${onclick} is not a function`);
    }
    if (classList && !Array.isArray(classList)) {
        throw new Error(`${classList} is not a list`);
    }
    if (itemClassList && !Array.isArray(itemClassList)) {
        throw new Error(`${itemClassList} is not a list`);
    }

    let $list = document.createElement("ul");
    $list.classList = "menuList";
    if (id) {
        $list.id = id;
    }
    if (classList) {
        $list = withClasses($list, classList);
    }
    for (let index in items) {
        const item = items[index];
        if (!item instanceof Node) {
            throw new Error(`${item} is not a DOM node`);
        }
        let $item = document.createElement("li");
        $item.classList = "menuListItem";
        if (itemClassList) {
            $item = withClasses($item, itemClassList);
        }
        if (onclick) {
            $item.classList.add("clickable");
            $item.onclick = onclick;
        }

        $item.appendChild(item);
        $list.appendChild($item);
    }

    return $list;
};

module.exports = menuList;

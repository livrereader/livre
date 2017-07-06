const menuItem = function(body, footer, title, onclick) {
    if (!body || !typeof body === 'string') {
        throw new Error(`Invalid menu item body: ${body}`);
    }
    if (onclick && !typeof onclick === 'function') {
        throw new Error(`${onclick} is not a function`);
    }
    const $item = document.createElement('div');
    $item.classList = 'menuItem';

    if (onclick) {
        $item.onclick = onclick;
        $item.classList.add('clickable');
    }

    if (title && typeof title === 'string') {
        const $title = document.createElement('span');
        $title.classList = 'menuItemTitle';
        const $titleText = document.createTextNode(title);
        $title.appendChild($titleText);
        $item.appendChild($title);
        $item.appendChild(document.createElement('br'));
    }

    const $body = document.createElement('span');
    $body.classList = 'menuItemBody';
    const $bodyText = document.createTextNode(body);
    $body.appendChild($bodyText);
    $item.appendChild($body);

    if (footer && typeof footer === 'string') {
        $item.appendChild(document.createElement('br'));
        const $footer = document.createElement('span');
        $footer.classList = 'menuItemFooter';
        const $footerText = document.createTextNode(footer);
        $footer.appendChild($footerText);
        $item.appendChild($footer);
    }

    return $item;
};

module.exports = menuItem;

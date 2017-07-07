const withClasses = require('./withClasses');

const menuItem = function(options) {
    const {
        body,
        title,
        footer,
        onclick,
        classList
    } = options;

    if (!body || (!typeof body === 'string' && !body instanceof Node)) {
        throw new Error(`Invalid menu item body: ${body}`);
    }
    if (onclick && !typeof onclick === 'function') {
        throw new Error(`${onclick} is not a function`);
    }
    if (classList && !Array.isArray(classList)) {
        throw new Error(`${classList} is not a list`);
    }

    const $bodyContents = body instanceof Node
          ? body
          : document.createTextNode(body);

    let $item = document.createElement('div');
    $item.classList = 'menuItem';
    if (classList) {
        item = withClasses($item, classList);
    }

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
    $body.appendChild($bodyContents);
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

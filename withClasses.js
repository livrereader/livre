const withClasses = function($el, classList) {
    if (!$el || !$el instanceof Node) {
        throw new Error("Element does not exist or is not a node");
    }
    if (!classList || !Array.isArray(classList)) {
        throw new Error("Class list does not exist or is not a list");
    }

    const $clone = $el.cloneNode(true);

    for (let i in classList) {
        const cls = classList[i];
        if (!typeof cls === 'string') {
            throw new Error(`${cls} is not a string`);
        }
        $clone.classList.add(cls);
    }

    return $clone;
};

module.exports = withClasses;

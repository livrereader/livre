const menuItem = require('./menuItem');
const menuList = require('./menuList');

const buildFindResults = function(results, Book, backBuffer, forwardBuffer) {
    const resultItems = results.map(result => {
        const location = Book.locations.locationFromCfi(result.cfi);
        return menuItem(result.excerpt.trim(), `Location: ${location}`, null, event => {
            event.stopPropagation();
            backBuffer.push(Book.renderer.currentLocationCfi);
            forwardBuffer = [];
            Book.goto(result.cfi);
        });
    });
    return menuList(resultItems);
};

module.exports = buildFindResults;

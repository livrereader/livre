const menuItem = require("./menuItem");
const menuList = require("./menuList");

const buildFindResults = function(results, Book, backBuffer, forwardBuffer) {
    const resultItems = results.map(result => {
        const location = Book.locations.locationFromCfi(result.cfi);
        return menuItem({
            body: result.excerpt.trim(),
            footer: `Location: ${location}`,
            onclick: event => {
                event.stopPropagation();
                backBuffer.push(Book.renderer.currentLocationCfi);
                forwardBuffer = [];
                Book.goto(result.cfi);
            }
        });
    });
    return menuList({
        items: resultItems,
        id: "find-results-list",
        itemClassList: ["bottomBorder"]
    });
};

module.exports = buildFindResults;

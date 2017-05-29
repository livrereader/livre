const buildResultListItem = function(result, Book, backBuffer, forwardBuffer) {
    const $result = document.createElement("li");
    const resultText = `Page ${Book.pagination.pageFromCfi(result.cfi)}: ${result.excerpt.trim()}`;
    const $resultContent = document.createTextNode(resultText);
    $result.appendChild($resultContent);

    $result.onclick = function(event) {
        event.stopPropagation();
        backBuffer.push(Book.rendition.currentLocation().start);
        forwardBuffer = [];
        Book.gotoCfi(result.cfi);
    };

    return $result;
};

const buildFindResults = function(results, Book, backBuffer, forwardBuffer) {
    const $resultsList = document.createElement("ul");
    for (let i in results) {
        const result = results[i];
        const $result = buildResultListItem(
            result,
            Book,
            backBuffer,
            forwardBuffer
        );
        $resultsList.appendChild($result);
    }
    return $resultsList;
};

module.exports = buildFindResults;

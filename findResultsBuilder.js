const buildResultListItem = function(result, Book, backBuffer, forwardBuffer) {
    const $result = document.createElement("li");
    const resultText = `${result.excerpt.trim()}`;
    const $resultContent = document.createTextNode(resultText);
    $result.appendChild($resultContent);

    $result.onclick = function(event) {
        event.stopPropagation();
        backBuffer.push(Book.renderer.currentLocationCfi);
        forwardBuffer = [];
        Book.goto(result.cfi);
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

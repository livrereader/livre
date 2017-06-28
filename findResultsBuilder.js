const buildResultListItem = function(result, Book, backBuffer, forwardBuffer) {
    const $result = document.createElement("li");
    $result.classList = "findResult";
    const location = Book.locations.locationFromCfi(result.cfi);
    const resultHTML = `<div>
                            <span class="findResultExcerpt">${result.excerpt.trim()}</span>
                            <br>
                            <span class="findResultLocation">Location: ${location}</span>
                        </div>`;
    $result.innerHTML = resultHTML;

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
    $resultsList.id = "findResults"
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

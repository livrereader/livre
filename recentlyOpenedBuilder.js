module.exports = function(persistedData, openBookFunction) {
    const docFrag = document.createDocumentFragment();
    if (!persistedData || Object.keys(persistedData).length === 0) {
        document.getElementById("recent-books").style.display = "none";
    }
    for (let id in persistedData) {
        let book = persistedData[id];
        let $bookItem = document.createElement("li");
        let $bookItemText = document.createTextNode(book.title);
        $bookItem.appendChild($bookItemText);
        $bookItem.onclick = () => openBookFunction(book.href);
        docFrag.appendChild($bookItem);
    }
    return docFrag;
}

const fs = require('fs');
const path = require('path');
const {app} = require('electron');

const DATA_PATH = path.join(app.getPath("userData"), "data.json");

module.exports = function(callback) {
    fs.readFile(DATA_PATH, (err, data) => {
        if (err) {
            callback(err);
        }
        else {
            try {
                const bookData = JSON.parse(data);
                callback(null, bookData);
            }
            catch (e) {
                callback(e);
            }
        }
    });
};


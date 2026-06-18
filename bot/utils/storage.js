const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getFilePath(collection) {
    return path.join(DATA_DIR, `${collection}.json`);
}

function loadCollection(collection) {
    const fp = getFilePath(collection);
    if (!fs.existsSync(fp)) return {};
    try {
        return JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch {
        return {};
    }
}

function saveCollection(collection, data) {
    fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2));
}

function getUser(collection, userID) {
    const data = loadCollection(collection);
    return data[userID] || null;
}

function setUser(collection, userID, userData) {
    const data = loadCollection(collection);
    data[userID] = userData;
    saveCollection(collection, data);
}

function getAllUsers(collection) {
    return loadCollection(collection);
}

module.exports = { loadCollection, saveCollection, getUser, setUser, getAllUsers };

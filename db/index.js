const db = require('diskdb');
const collections = ['users', 'followerDetails', 'hydratedUsers', 'appState'];
db.connect('./db', collections);

module.exports = db;

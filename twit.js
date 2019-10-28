const log = require('debug')('twit-cli:twit');
const { camelify } = require('./transforms.js');
const Twit = require('twit');
const FP = require('functional-promises');

const T = new Twit({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
});

module.exports = {

  getFriendList(username, cursor) {
    return T.get('friends/list', {
      screen_name: username,
      count: 200,
      cursor,
    })
      .tap(log.bind(null, 'getFriendList'))
      .get('data')
      .then(camelify)
      // .then(({ data }) => FP.delay(2000).then(() => data));
  },
  
  getUsers(screenNames) {
    return T.post('users/lookup', {
      screen_name: screenNames
    })
      .tap(log.bind(null, 'getUsers'))
      .then(({ data }) => data)
      .then(camelify);
  },

  unfollow(screen_name) {
    return T.post('friendships/destroy', { screen_name })
      .tap(log.bind(null, 'unfollow'))
  }

};


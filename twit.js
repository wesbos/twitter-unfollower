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
      .then(({ data }) => FP.delay(5000).then(() => data));
  },
  
  getUsers(screenNames) {
    return T.post('users/lookup', {
      screen_name: screenNames
    })
      .then(({ data }) => FP.delay(5000).then(() => data));
  },

  unfollow(screen_name) {
    return T.post('friendships/destroy', { screen_name })
  }

};



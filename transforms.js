const camelCase = require('lodash.camelcase');

exports.camelify = object => {
  return Object.entries(object)
  .reduce((obj, [key, value]) =>{
    obj[camelCase(key)] = typeof value === 'object' ? camelify(value) : value;
    return obj
  }, {})
}

exports.followers = user => ({
  screen_name: user.screen_name,
  name: user.name,
  id: user.id,
});

exports.userWithLastTweetTime = user => ({
  screen_name: user.screen_name,
  id: user.id,
  lastTweet: new Date(user.status.created_at).getTime(),
  timeSinceLastTweet:
    Date.now() - new Date(user.status.created_at).getTime(),
});

exports.setUserStatus = user => {
  user.status = user.status || { created_at: 0 };
  return user;
};

exports.isActiveTwitterPoster = cutLimit => user => user.timeSinceLastTweet > cutLimit;

exports.showUserInfo = user => {
  // TODO: .tap()
  console.log(
    `${user.screen_name} last tweeted ${ms(user.timeSinceLastTweet)}`
  );
  return user;
};

exports.getProp = (propName, defaultValue = null) => (obj) => obj[propName] || defaultValue;


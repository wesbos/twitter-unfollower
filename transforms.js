const ms = require('ms');
const log = require('debug')('twit-cli:transforms');

exports.followers = user => ({
  screenName: user.screenName,
  name: user.name,
  id: user.id
});

exports.userWithLastTweetTime = user => ({
  screenName: user.screenName,
  id: user.id,
  lastTweet: new Date(user.status.createdAt).getTime(),
  timeSinceLastTweet:
    Date.now() - new Date(user.status.createdAt).getTime(),
});

exports.setUserStatus = user => {
  user.status = user.status || { createdAt: 0 };
  return user;
};

exports.isActiveTwitterPoster = cutLimit => user => user.timeSinceLastTweet > cutLimit;

exports.showUserInfo = user => {
  // TODO: .tap()
  console.log(
    `${user.screenName} last tweeted ${ms(user.timeSinceLastTweet)}`
  );
  return user;
};

exports.getProp = (propName, defaultValue = null) => (obj) => obj[propName] || defaultValue;


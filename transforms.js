const prettyMs = require('pretty-ms');
const ms = require('ms');
const log = require('debug')('twit-cli:transforms');

exports.followers = user => ({
  __importedDate: new Date(),
  id: user.id,
  name: user.name,
  screenName: user.screenName,
  createdAt: user.createdAt,
  favouritesCount: user.favouritesCount,
  followersCount: user.followersCount,
  friendsCount: user.friendsCount,
  listedCount: user.listedCount
});

exports.userWithLastTweetTime = user => ({
  __importedDate: new Date(),
  id: user.id,
  name: user.name,
  screenName: user.screenName,
  createdAt: user.createdAt,
  favouritesCount: user.favouritesCount,
  followersCount: user.followersCount,
  friendsCount: user.friendsCount,
  listedCount: user.listedCount,
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
    `${user.screenName} last tweeted ${prettyMs(user.timeSinceLastTweet)}`
  );
  return user;
};

exports.getProp = (propName, defaultValue = null) => (obj) => obj[propName] || defaultValue;


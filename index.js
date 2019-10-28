require('dotenv').config();
const log = require('debug')('twit-cli:index');
const ms = require('ms');
const db = require('diskdb');
const { getFriendList, getUsers, unfollow } = require('./twit');
const FP = require('functional-promises');
const chunkify = require('./chunking');
const transforms = require('./transforms.js');
const cliProgress = require('cli-progress');

const collections = ['users', 'hydratedUsers', 'appState'];

db.connect('./db', collections);

const MAX_TWEET_AGE = ms('280 days');
const RETRY_LIMIT = 8;
const MAX_FOLLOWERS_TO_DOWNLOAD = 2000

function go() {
  return FP.resolve(resetDb())
    .then(getListOfPeopleYouFollow)
    .then(hydrateUsers)
    .then(massUnfollow)
    .catch(handleError);
}

go();

function resetDb() {
  collections.map(c => db[c].remove())
  db.loadCollections(collections)
}

function getListOfPeopleYouFollow(cursor = -1, retries = 0) {
  if (retries > RETRY_LIMIT) return Promise.reject(new Error('Failed to download. Exceeded rate limits! Please try again later.'));
  if (cursor !== -1) { console.log(`Downloading next page...      `, cursor); }

  if (db.users.find().length >= MAX_FOLLOWERS_TO_DOWNLOAD) {
    return FP.resolve((db.users.find()))
  }
  const fieldsToKeep = ['id', 'name', 'screenName', 'profileImageUrlHttps', 'location', 'description', 'favouritesCount', 'followersCount', 'friendsCount', 'listedCount']

  return FP.resolve(getFriendList(process.env.username, cursor))
    .catch(retryGetFollowers(cursor, retries))
    .then(data => {
      // if (data.nextCursor) {
      //   db.appState.update({currentState: true}, {
      //     followerCursor: cursor,
      //     followerRetries: retries,
      //     followerNextCursor: data.nextCursor
      //   });
      // }

      return FP.resolve(data.users)      // .concurrency(1)
        .map(u => FP.resolve(u).get(fieldsToKeep))
        .then(data => db.users.save(data))
        // .then(screenNames => db.users.save(screenNames))
        .thenIf(() => data.nextCursor,
          () => getListOfPeopleYouFollow(data.nextCursor), 
          () => db.users.find())
    })
    .tap(users => console.log(`Downloaded ${users.length} followers!`))
}

function hydrateUsers(users = db.users.find()) {
  const screenNames = users
    .map(transforms.followers)
    .map(transforms.getProp('screenName'))
  
  console.log(`Loading tweets for ${screenNames.length} users`, screenNames)
  return FP.resolve(chunkify(screenNames, 100))
    .concurrency(1)
    .map(findLastTweet)
    .then(results => db.hydratedUsers.save(results));
}

function massUnfollow() {
  return FP.resolve(db.hydratedUsers.find())
    // .map(user => unfollow(user.screenName))
    .tap(results => console.log(`Unfollowed ${results.length} users`));
}

function findLastTweet(screenNames) {
  return FP.resolve(getUsers(screenNames))
    .concurrency(1)
    .map(transforms.setUserStatus)
    .concurrency(1)
    .map(transforms.userWithLastTweetTime)
    .concurrency(1)
    .map(transforms.showUserInfo)
    .filter(transforms.isActiveTwitterPoster(MAX_TWEET_AGE))
    .tap(results => console.log('findLastTweet', results));
}

function retryGetFollowers(cursor, retries) {
  return error => {
     // console.error('Error', JSON.stringify(error, null, 2));
     if (error.statusCode === 429) {
       console.log(`NOTE: RATE LIMITED! WAITING 15 MINUTES... (try #${retries + 1}/${RETRY_LIMIT})`);

        // create a new progress bar instance and use shades_classic theme
        const startTime = new Date().getTime();
        const delayBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

        // start the progress bar with a total value of 200 and start value of 0
        delayBar.start(15.4 * 60 * 1000, 0);
        
        setInterval(
          () => delayBar.update(new Date().getTime() - startTime), 500);
        
       return FP.delay(15.5 * 60 * 1000)
        .then(() => delayBar.stop())
        .then(() => getListOfPeopleYouFollow(cursor, ++retries));
     }
     return Promise.reject(error);
   }
 } 

function handleError(err) {
  console.log('-------------');
  console.log('Oh no!');
  console.log(err);
  console.log('-------------');
}


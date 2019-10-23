require('dotenv').config();
const ms = require('ms');
const db = require('diskdb');
const { getFriendList, getUsers, unfollow } = require('./twit');
const FP = require('functional-promises');
const chunkify = require('./chunking');
const transforms = require('./transforms.js');

db.connect('./db', ['users', 'hydratedUsers']);

const MAX_TWEET_AGE = ms('280 days');
const RETRY_LIMIT = 8;

function go() {
  return getListOfPeopleYouFollow()
    .then(hydrateUsers)
    .then(massUnfollow)
    .catch(handleError);
}

go();

function getListOfPeopleYouFollow(cursor = -1, retries = 0) {
  if (retries > RETRY_LIMIT) return Promise.reject(new Error('Failed to download. Exceeded rate limits! Please try again later.'));

  return FP.resolve(getFriendList(process.env.username, cursor))
    .catch(retryGetFollowers(cursor, retries))
    .then(data => {
      return FP.resolve(data.users)      // .concurrency(1)
        .map(transforms.followers)
        .map(transforms.getProp('screen_name'))
        .then(screenNames => db.users.save(screenNames))
        .thenIf(() => data.next_cursor,
          () => getListOfPeopleYouFollow(data.next_cursor), 
          () => db.users.find())
    })
    .tap(users => console.log(`Downloaded ${users.length} followers!`))
}

function hydrateUsers(users = db.users.find()) {
  return FP.resolve(chunkify(users, 100))
    .concurrency(2)
    .map(findLastTweet)
    .then(results => db.hydratedUsers.save(results));
}

function massUnfollow() {
  return FP.resolve(db.hydratedUsers.find())
    // .map(user => unfollow(user.screen_name))
    .tap(results => console.log(`Unfollowed ${results.length} users`));
}

function findLastTweet(screenNames) {
  return FP.resolve(getUsers(screenNames))
    .map(transforms.setUserStatus)
    .map(transforms.userWithLastTweetTime)
    .map(transforms.showUserInfo)
    .filter(transforms.isActiveTwitterPoster(MAX_TWEET_AGE))
    .tap(results => console.log('findLastTweet', results));
}

function retryGetFollowers(cursor, retries) {
  return error => {
     // console.error('Error', JSON.stringify(error, null, 2));
     if (error.statusCode === 429) {
       console.log(`NOTE: RATE LIMITED! WAITING 90 SECONDS... (try #${retries + 1}/${RETRY_LIMIT})`);
       return FP.delay(90 * 1000)
         .then(() => getListOfPeopleYouFollow(cursor, ++retries));
     }
     throw error;
   }
 } 

function handleError(err) {
  console.log('-------------');
  console.log('Oh no!');
  console.log(err);
  console.log('-------------');
}


require('dotenv').config();
const ms = require('ms');
const db = require('diskdb');
const T = require('./twit');
const FP = require('functional-promises');
const chunkify = require('./chunking');
const transforms = require('./transforms.js');

db.connect('./db', ['users', 'hydratedUsers']);

const cutLimit = ms('280 days');

async function getListOfPeopleYouFollow(cursor = -1) {
  const { data } = await T.get('friends/list', {
    screen_name: process.env.username,
    count: 200,
    cursor,
  });
  const followerSet = data.users.map(transforms.followers);
  console.log(followerSet);
  const screenNames = followerSet.map(user => user.screen_name);
  // save to DB
  db.users.save(screenNames);
  if (data.next_cursor) {
    getListOfPeopleYouFollow(data.next_cursor);
  } else {
    console.log('Thats it! Here is your list');
    console.log(db.users.find());
  }
}

async function findLastTweet(screenNames) {
  // given an array of screen names, look up their last tweet
  const { data: users } = await T.post('users/lookup', {
    screen_name: screenNames,
  });

  const cutList = users
    // some people deleted all their tweets, we mark them as old
    .map(transforms.setUserStatus)
    // massage the data into what we need
    .map(transforms.userWithLastTweetTime)
    // cut anyone over the limit
    .map(transforms.showUserInfo)
    .filter(transforms.isActiveTwitterPoster(cutLimit));
    
  console.log('cutList', cutList);
  return cutList;
}

async function hydrateUsers() {
  const users = chunkify(db.users.find(), 100);
  const userPromises = users.map(findLastTweet);
  const usersChunked = await Promise.all(userPromises);
  console.log('Fetched all data!');
  const usersFlat = usersChunked.flat();
  db.hydratedUsers.save(usersFlat);
}

async function massUnfollow() {
  const users = db.hydratedUsers.find();
  console.log('About to unfollow the following users:', users);
  // const userPromises = users.map(user => unfollow(user.screen_name));
  // const statuses = await Promise.allSettled(userPromises);
  console.log(statuses);
}
async function unfollow(screen_name) {
  console.log('Unfollowing ', screen_name);
  const { status } = await T.post('friendships/destroy', { screen_name });
  console.log(status);
  return status;
}

function handleError(err) {
  console.log('-------------');
  console.log('Oh no!');
  console.log(err);
  console.log('-------------');
}

async function go() {
  await getListOfPeopleYouFollow();
  await hydrateUsers();
  await massUnfollow();
}

go().catch(handleError);

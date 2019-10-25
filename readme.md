Requirements:

* Node 12.9.0+ because it uses Promise.allSettled() 
* Twitter dev keys (more below)
* A good attitude 

# Unfollow Stale accounts

You'll need a developer keys from twitter → https://developer.twitter.com/en/apps - this might be hard because they don't just hand out keys anymore. You need to apply if you don't have a legacy app from before the crackdown.

Put your keys in a file called `.env` like this:

```bash
username=wesbos
consumer_key=wowowowo
consumer_secret=yayayaay
access_token=teeheee
access_token_secret=errrrnngggg
```

Set the `cutLimit` variable in `index.js` and then run it with `npm start`.

## Some things to note

Rate limits on twitter are real. If you follow more than 3000 people, you'll hit the 200 x 15 rate limit. 

You could fix this by `npm install waait`

then:

```
const wait = require('waait');
// ... then in your getListOfPeopleYouFollow function, add this:
if (data.next_cursor) {
    // wait 1 min
    await wait(60000);
    getListOfPeopleYouFollow(data.next_cursor);
```

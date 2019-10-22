# Unfollow Stale accounts

You'll need a developer keys from twitter → https://developer.twitter.com/en/apps - this might be hard because they don't just hand out keys anymore. You need to apply if you don't have a legacy app from before the crack down.

Put your keys in a file called `.env` like this:

```bash
consumer_key=wowowowo
consumer_secret=yayayaay
access_token=teeheee
access_token_secret=errrrnngggg
```

Set the `cutLimit` variable in `index.js` and then run it with `npm start`.




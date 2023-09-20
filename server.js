const express = require('express');
const cors = require('cors');
const ngeohash = require('ngeohash');
const axios = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require("path");

const MAX_RETRIES = 3

// credentials are optional
const spotifyApi = new SpotifyWebApi({
  clientId: '',
  clientSecret: ''
});

// function getCredential() {
//   spotifyApi.clientCredentialsGrant().then(
//     function(data) {
//       spotifyApi.setAccessToken(data.body['access_token'])
//     },
//     function (err) {
//       console.error('Something went wrong when retrieving an access token', err)
//     })
// }

async function getCredential() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
  } catch (err) {
    console.error('Retrieving spotify access token failed', err);
  }
}

getCredential().then(()=>{})

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('./dist/hw8'));

const GOOGLE_GEO_API = "";
const TM_API = "";

// Serve the Angular app's index.html file for all other requests
app.get(['/', '/search'], (req, res) => {
  res.sendFile(path.join(__dirname,'/dist/hw8/index.html'));
});

app.get('/events_search', async (req, res) => {
  //prepare geohash
  // console.log(req.query)
  let gh = '';
  if ('autodetect' in req.query) {
    const loc = req.query.location.split(',');
    gh = ngeohash.encode(loc[0], loc[1], 7)
    // console.log(gh)
  } else {
    // console.log(req.query.location)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.location.replace(/\s+/g, '+')}&key=${GOOGLE_GEO_API}`;
    console.log('location=>geo info: ' + url);
    try{
      const response = await axios.get(url);
      const data = response.data;
      if (!data.results?.[0]?.geometry?.location?.lat || !data.results?.[0]?.geometry?.location?.lng) {
        console.error('Failed to retrieve geo info for specified location!');
        res.json({});
        return
      }
      gh = ngeohash.encode(data.results[0].geometry.location.lat, data.results[0].geometry.location.lng, 7)
    } catch (error) {
      console.error(error);
      res.json({});
      return
    }
  }

  // console.log(req.query.keyword)
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TM_API}&keyword=${req.query.keyword.replace(/\s+/g, '+')}&segmentId=${req.query.segmentId}&radius=${req.query.distance}&unit=miles&geoPoint=${gh}`;
  console.log('tm events: ' + url);
  try{
    const response = await axios.get(url);
    const data = response.data;
    if (data.page.totalElements !== 0) {
      res.json(data)
    } else {
      res.json({});
    }
  } catch (error) {
    console.error(`Failed to retrieve events from Ticketmaster!, error code: ${error.response.status}`);
    res.json({});
  }
});

app.get('/autocomplete', async (req, res) => {
  // console.log(req.query.keyword)
  const url = `https://app.ticketmaster.com/discovery/v2/suggest.json?apikey=${TM_API}&keyword=${req.query.keyword.replace(/\s+/g, '+')}`;
  console.log('tm suggest: ' + url);
  try{
    const response = await axios.get(url);
    const data = response.data;
    res.json(data)
  } catch (error) {
    console.error(`Failed to retrieve autocomplete suggestions from Ticketmaster!, error code: ${error.response.status}`);
    res.json({});
  }
})

app.get('/event_details', async (req, res) => {
  const eventId = req.query.id;
  // console.log(eventId)
  const url = `https://app.ticketmaster.com/discovery/v2/events/${eventId.replace(/\s+/g, '+')}.json?apikey=${TM_API}`;
  console.log('event_details: ' + url);

  try {
    const response = await axios.get(url);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error(`Failed to retrieve event details from Ticketmaster!, error code: ${error.response.status}`);
    res.json({});
  }
});

function spotifySearch(keyword, res, method_name, success_callback, retries = 0, options = {}, retriesBecauseOfTokenExpiration = 0) {
  spotifyApi[method_name](keyword, options)
    .then(data => {
      console.log(`${method_name} ${keyword} succeeded after ${retriesBecauseOfTokenExpiration} retries because of token expiration`)
      res.json(success_callback(data, keyword))
    })
    .catch(err => {
      if (retries < MAX_RETRIES) {
        if (Number(err.statusCode) === 429) {
          const retryAfter = parseInt(err.headers['retry-after'], 2);
          console.error(`Rate limit reached. Retrying in ${retryAfter} seconds...`);

          // Wait for the specified delay and then retry the API call
          setTimeout(() => {
            spotifySearch(keyword, res, method_name, success_callback, retries + 1);
          }, retryAfter * 1000);
        }
        else {
          console.error(`${method_name} ${keyword} received status ${err.statusCode}, try to reset token...`);
          getCredential().then(() => {
            spotifySearch(keyword, res, method_name, success_callback, retries + 1, retriesBecauseOfTokenExpiration + 1);
          })
        }
      }
      else {
        console.error(`${method_name} ${keyword} Maximum retries reached, aborting...`);
        res.status(err.statusCode)
      }
    });
}

function onSuccessSearchArtist(data, keyword) {
  if (data.body?.artists?.items) {
    for(let item of data.body.artists.items) {
      //choose the first item with the same name(case-insensitive)
      if (item.name.toLowerCase() === keyword.toLowerCase()) {
        return item;
      }
    }
  }
  return {};
}

function onSuccessSearchAlbums(data, keyword) {
  if (data.body?.items?.length > 0) {
    return data.body.items;
  }
  return {};
}

app.get('/artists', async (req, res) => {
  spotifySearch(req.query.keyword, res, 'searchArtists', onSuccessSearchArtist)
});

app.get('/albums', async (req, res) => {
  spotifySearch(req.query.keyword, res, 'getArtistAlbums', onSuccessSearchAlbums, 0, {limit: 3})
})


app.get('/venue_details', async (req, res) => {
  // console.log(req.query.keyword)
  const venueName = req.query.keyword.replace(/\s+/g, '+');
  const url = `https://app.ticketmaster.com/discovery/v2/venues.json?keyword=${venueName}&apikey=${TM_API}`;

  console.log('venue_details: ' + url);

  try {
    const response = await axios.get(url);
    res.json(response.data)
  } catch (error) {
    console.error(`Failed to retrieve venue details from Ticketmaster!, error code: ${error.response.status}`);
    res.json({});
  }
});




// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});



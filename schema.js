const fetch = require('node-fetch');
require('dotenv').config();

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList
} = require('graphql');

// Spotify //

const SpotifyWebApi = require('spotify-web-api-node');

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
});

// // 

const TracksType = new GraphQLObjectType({
  name: 'Tracks',
  description: '...',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: response => {
        console.log('this is not working right now ;(')
      }
    }
  })
})

const SpotifyType = new GraphQLObjectType({
  name: 'Artist',
  description: '...',

  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: response => {
        return response.artists.items[0].id
      }
    },
    tracks: {
      type: new GraphQLList(TracksType),
      resolve: response => {
        const id = response.artists.items[0].id
        return fetch(
          `https://api.spotify.com/v1/artists/${id}/top-tracks?country=US&access_token=${process.env.ACCESS_TOKEN}`
        )
        .then(response => response.json())
      }
    }
  })
})

const EventType = new GraphQLObjectType({
  name: 'Event',
  description: '...',

  fields: () => ({
    city: {
      type: GraphQLString,
      resolve: event =>
      event.city_name
    },
    date: {
      type: GraphQLString,
      resolve: event =>
        event.start_time
    },
    event_url: {
      type: GraphQLString,
      resolve: event =>
        event.url
    },
    performer: {
      type: GraphQLString,
      resolve: event =>
        event.performers.performer.name
    },
    performer_pic: {
      type: GraphQLString,
      resolve: event =>
        event.image.medium.url
    },
    performer_url: {
      type: GraphQLString,
      resolve: event =>
        event.performers.performer.url
    },
    title: {
      type: GraphQLString
    },
    spotify: {
      type: SpotifyType,
      resolve: event => {
        const artist = event.performers.performer.name;
        return fetch(
          `https://api.spotify.com/v1/search?q=${artist}&type=artist&access_token=${process.env.ACCESS_TOKEN}&limit=1`
        )
        .then(response => response.json())
      }
    },
    venue_address: {
      type: GraphQLString,
      resolve: event =>
        event.venue_address
    },
    venue_name: {
      type: GraphQLString,
      resolve: event =>
        event.venue_name
    },
    venue_url: {
      type: GraphQLString,
      resolve: event =>
        event.venue_url
    }
  })
})

const CityType = new GraphQLObjectType({
  name: 'City',
  description: '...',

  fields: () => ({
    totalEvents: {
      type: GraphQLString,
      resolve: response => {
        return response.total_items
      }
    },
    events: {
      type: new GraphQLList(EventType),
      resolve: response => {
        return response.events.event
      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
      city: {
        type: CityType,
        args: {
          location: { type: GraphQLString },
          genre: { type: GraphQLString },
          start_date: {type: GraphQLString },
          end_date: {type: GraphQLString },
        },
        resolve: (root, args) => fetch(
            `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_KEY}&categories=music_${args.genre}&location=${args.location}&date=${args.start_date}00-${args.end_date}00&page_size=25`
        )
          .then(response => response.json())
      },
      // Only add to get an access token if expires
      spotify: {
        type: GraphQLString,
        resolve: () => {
          spotifyApi.clientCredentialsGrant()
          .then((data) => {
            spotifyApi.setAccessToken(data.body.access_token);
            console.log('our spotify info is: ', spotifyApi);
          }, (err) => {
            console.log('something went wrong :( >>> ', err);
            process.exit(-1); // if we don't have a working spotify credentials grant, all is lost.
          });
        }
      }
    })
  })
})

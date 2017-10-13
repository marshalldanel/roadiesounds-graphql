const fetch = require('node-fetch');
require('dotenv').config();

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList
} = require('graphql');

const EventType = new GraphQLObjectType({
  name: 'Event',
  description: '...',

  fields: () => ({
    city: {
      type: GraphQLString,
      resolve: event =>
      event.city_name
    },
    title: {
      type: GraphQLString
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
    venue_name: {
      type: GraphQLString,
      resolve: event =>
        event.venue_name
    },
    venue_address: {
      type: GraphQLString,
      resolve: event =>
        event.venue_address
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
      }
    })
  })
})
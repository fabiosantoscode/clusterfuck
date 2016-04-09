/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  Game,
  Tag,
  HidingSpot,
  checkHidingSpotForTreasure,
  getGame,
  getHidingSpot,
  getHidingSpots,
  getTag,
  getTags,
  getTurnsRemaining,
} from './database';

const {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    const {type, id} = fromGlobalId(globalId);
    if (type === 'Game') {
      return getGame(id)
    } else if (type === 'HidingSpot') {
      return getHidingSpot(id)
    } else if (type === 'Tag') {
      return getTag(id)
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof Game) {
      return gameType
    } else if (obj instanceof HidingSpot) {
      return hidingSpotType
    } else if (obj instanceof Tag) {
      return tagType
    } else {
      return null
    }
  }
);

var gameType = new GraphQLObjectType({
  name: 'Game',
  description: 'A treasure search game',
  fields: () => ({
    id: globalIdField('Game'),
    hidingSpots: {
      type: hidingSpotConnection,
      description: 'Places where treasure might be hidden',
      args: connectionArgs,
      resolve: (game, args) => connectionFromArray(getHidingSpots(), args),
    },
    turnsRemaining: {
      type: GraphQLInt,
      description: 'The number of turns a player has left to find the treasure',
      resolve: () => getTurnsRemaining(),
    },
    tags: {
      type: tagConnection,
      description: 'Java script tags',
      args: connectionArgs,
      resolve: (game, args) => connectionFromArray(getTags(), args),
    },
    tagCount: {
      type: GraphQLInt,
      description: 'How many JS tags you have',
      resolve: () => Math.floor(Math.random() * 500),
    },
  }),
  interfaces: [nodeInterface],
});

var hidingSpotType = new GraphQLObjectType({
  name: 'HidingSpot',
  description: 'A place where you might find treasure',
  fields: () => ({
    id: globalIdField('HidingSpot'),
    hasBeenChecked: {
      type: GraphQLBoolean,
      description: 'True this spot has already been checked for treasure',
      resolve: (hidingSpot) => hidingSpot.hasBeenChecked,
    },
    hasTreasure: {
      type: GraphQLBoolean,
      description: 'True if this hiding spot holds treasure',
      resolve: (hidingSpot) => {
        if (hidingSpot.hasBeenChecked) {
          return hidingSpot.hasTreasure;
        } else {
          return null;  // Shh... it's a secret!
        }
      },
    },
  }),
  interfaces: [nodeInterface],
});

var {connectionType: hidingSpotConnection} =
  connectionDefinitions({name: 'HidingSpot', nodeType: hidingSpotType});

var tagType = new GraphQLObjectType({
  name: 'Tag',
  description: 'A third-party javascript tag',
  fields: () => ({
    id: globalIdField('Tag'),
    source: {
      type: GraphQLString,
      description: 'Java Script that inserts the tag',
    }
  }),
  interfaces: [nodeInterface],
})

var {connectionType: tagConnection} =
  connectionDefinitions({ name: 'Tag', nodeType: tagType })

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    game: {
      type: gameType,
      resolve: () => getGame(),
    },
  }),
});

const CheckHidingSpotForTreasureMutation = mutationWithClientMutationId({
  name: 'CheckHidingSpotForTreasure',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    hidingSpot: {
      type: hidingSpotType,
      resolve: ({localHidingSpotId}) => getHidingSpot(localHidingSpotId),
    },
    game: {
      type: gameType,
      resolve: () => getGame(),
    },
  },
  mutateAndGetPayload: ({id}) => {
    const localHidingSpotId = fromGlobalId(id).id;
    checkHidingSpotForTreasure(localHidingSpotId);
    return {localHidingSpotId};
  },
});

const AddTagMutation = mutationWithClientMutationId({
  name: 'AddTag',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    source: { type: GraphQLString },
  },
  outputFields: {
    randomNumber: {
      type: GraphQLInt,
      resolve: () => new Promise(resolve => { setTimeout(() => { resolve(Math.random()) }, 4000) })
    },
    game: {
      type: gameType,
      resolve: () => getGame(),
    }
  },
  mutateAndGetPayload: (e) => {
    console.log('GOT A THING', e)
    return Promise.resolve({});
  }
})

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    checkHidingSpotForTreasure: CheckHidingSpotForTreasureMutation,
    addTag: AddTagMutation,
  }),
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

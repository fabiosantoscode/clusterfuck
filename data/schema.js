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
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  Game,
  Tag,
  getGame,
  getTag,
  getTags,
  addTag,
} from './database';

const {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    const {type, id} = fromGlobalId(globalId);
    if (type === 'Game') {
      return getGame(id)
    } else if (type === 'Tag') {
      console.log('called getTag(%s)', id)
      return getTag(id)
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof Game) {
      return gameType
    } else if (obj instanceof Tag) {
      return tagType
    } else {
      return null
    }
  }
);

var gameType = new GraphQLObjectType({
  name: 'Game',
  description: 'iss just a gaem, y u heff to be mad',
  fields: () => ({
    id: globalIdField('Game'),
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

var {connectionType: tagConnection, edgeType: TagEdgeType} =
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

const AddTagMutation = mutationWithClientMutationId({
  name: 'AddTag',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    source: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    game: {
      type: gameType,
      resolve: () => getGame(),
    },
    tagEdge: {
      type: TagEdgeType,
    }
  },
  mutateAndGetPayload: ({source}) => {
    console.log('adding tag', source)
    var newTagId = addTag({source})
    var tag = getTag(newTagId)
    console.log('added tag', tag)
    return ({
      tagEdge: {
        cursor: cursorForObjectInConnection(getTags(), tag),
        node: tag
      }
    })
  }
})

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
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

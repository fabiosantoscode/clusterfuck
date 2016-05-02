import Relay from 'react-relay';

import AddTagMutation from './AddTagMutation.js'

export default class EditTagMutation extends Relay.Mutation {
  // This makes Relay ensure that the game ID is present when the mutation is used
  static fragments = {
    tag: () => Relay.QL` fragment on Tag { id, source, title } `
  };
  getMutation() {
    return Relay.QL`mutation{editTag}`;
  }
  getVariables() {
    return {
      id: this.props.id,
      source: this.props.source,
      title: this.props.title,
    };
  }
  // The fat query represents what fields change when the query is executed
  getFatQuery() {
    return Relay.QL`
      fragment on EditTagPayload @relay(pattern: true) {
        tag { id, title, source },
        game { id, },
      }
    `;
  }
  getConfigs() {
     return [{
       type: 'FIELDS_CHANGE',
       fieldIDs: {
         tag: this.props.id
       }
     }];
  }
  getOptimisticResponse() {
    return {
      tagEdge: {
        node: {
          source: 'lel saving tag, wait....',
          title: '...',
          id: 'im new'
        }
      }
    };
  }
}

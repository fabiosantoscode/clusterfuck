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

import Relay from 'react-relay';

export default class AddTagMutation extends Relay.Mutation {
  // This makes Relay ensure that the game ID is present when the mutation is used
  static fragments = {
    game: () => Relay.QL` fragment on Game { id, } `
  };
  getMutation() {
    return Relay.QL`mutation{addTag}`;
  }
  getVariables() {
    return { id: this.props.game.id, };
  }
  // The fat query represents what fields change when the query is executed
  getFatQuery() {
    return Relay.QL`
      fragment on AddTagPayload {
        randomNumber,
        game {
          tags,
          tagCount,
        },
      }
    `;
  }
  getConfigs() {
     return [{
       type: 'FIELDS_CHANGE',
       fieldIDs: {
         game: this.props.game.id,
       },
     }];
  }
  getOptimisticResponse() {
    return {
      randomNumber: Math.random()
    };
  }
}

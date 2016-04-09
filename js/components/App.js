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

import CheckHidingSpotForTreasureMutation from '../mutations/CheckHidingSpotForTreasureMutation';
import AddTagMutation from '../mutations/AddTagMutation';
import React from 'react';
import Relay from 'react-relay';

function TagEditor({ source }) {
  return (
    <pre>{source}</pre>
  )
}

class TagManager extends React.Component {
  _handleAddClick(e) {
    Relay.Store.commitUpdate(
      new AddTagMutation({
        game: this.props.game,
        source: this.refs.textarea.value
      })
    );
  }
  _hasFoundTreasure() {
    return (
      this.props.game.hidingSpots.edges.some(edge => edge.node.hasTreasure)
    );
  }
  _isGameOver() {
    return !this.props.game.turnsRemaining || this._hasFoundTreasure();
  }
  renderTagEditors() {
    return this.props.game.tags.edges.map((edge, i) => (
      <TagEditor source={edge.node.source} key={i} />
    ))
  }
  renderAddButton() {
    return (
      <div>
        <textarea ref={(textarea) => { this.refs = { ...this.refs, textarea } }}/>
        <div onClick={(e) => this._handleAddClick(e)}>add</div>
      </div>
    )
  }
  render() {
    let headerText = 'Clusterfuck';
    return (
      <div>
        <h1>{headerText}</h1>
        {this.renderTagEditors()}
        {this.renderAddButton()}
        <p>Turns remaining: {this.props.game.turnsRemaining}</p>
      </div>
    );
  }
}

export default Relay.createContainer(TagManager, {
  fragments: {
    game: () => Relay.QL`
      fragment on Game {
        turnsRemaining,
        hidingSpots(first: 9) {
          edges {
            node {
              hasBeenChecked,
              hasTreasure,
              id,
              ${CheckHidingSpotForTreasureMutation.getFragment('hidingSpot')},
            }
          }
        },
        tags(first: 3) {
          edges {
            node {
              id,
              source,
            }
          }
        },
        ${AddTagMutation.getFragment('game')}
      }
    `,
  },
});

import React from 'react';

import assert from 'assert';

import Relay from 'react-relay';

import TagEditor from './TagEditor'


function AddButton({ onAdd = () => undefined }) {
  return <button onClick={onAdd}>add</button>
}

class MultiTagEditor extends React.Component {
  render() {
    const adding = this.state && this.state.addctive
    const additors = adding ?
      [(
        <TagEditor tag={null} game={this.props.game} createMode={true} key={'create'} />
      )] : []
    const addButtons = !adding ?
      [(
        <AddButton onAdd={() => { this.setState({ addctive: true })}}/>
      )] : []
    const editors = this.props.tagConnection.edges
    .map((edge, i) => (
      <TagEditor tag={edge.node} game={this.props.game} key={i} />
    ))
    return (
      <div>
        {editors.concat(addButtons).concat(additors)}
      </div>
    )
  }
}

export default Relay.createContainer(MultiTagEditor, {
  fragments: {
    tagConnection: () => Relay.QL`
      fragment on TagConnection {
        edges {
          node {
            ${TagEditor.getFragment('tag')}
          }
        }
      }
    `,
    game: _ => Relay.QL`
      fragment on Game {
        ${TagEditor.getFragment('game')}
      }
    `
  },
})


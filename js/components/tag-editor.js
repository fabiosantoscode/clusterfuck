import React from 'react';

import assert from 'assert';

import Relay from 'react-relay';

import AddTagMutation from '../mutations/AddTagMutation';
import EditTagMutation from '../mutations/EditTagMutation';

class TagEditor extends React.Component {
  componentWillMount() {
    if (this.props.createMode) {
      this.setState({ editMode: true })
    }
  }
  handleSaveClick(e) {
    const mutationVariables = {
      game: this.props.game,
      tag: this.props.tag,
      id: (this.props.tag||{}).id,
      title: this.refs.input.value,
      source: this.refs.textarea.value,
    }
    const mutation = this.props.createMode ?
      new AddTagMutation(mutationVariables) :
      new EditTagMutation(mutationVariables)

    Relay.Store.commitUpdate(mutation, {
      onSuccess: () => {
        if (!this.props.createMode) {
          this.setState({ editMode: false })
        }
      },
      onFailure: () => {
        alert('Failed to edit tag ' + JSON.stringify(this.props.title) + '. Please try again.')
      }
    })
  }
  handleEditModeToggle() {
    this.setState({
      editMode: !(this.state && this.state.editMode)
    })
  }
  renderEditButton() {
    const editWord = (this.state||{}).editMode ? 'Cancel' : 'Edit'
    return (
      <button onClick={() => { this.handleEditModeToggle() }}>{editWord}</button>
    )
  }
  renderEditMode() {
    const editButton =
      this.props.createMode !== true ?  // If this was instantiated in create mode, don't toggle back
        this.renderEditButton() :
        null;
    const tag = this.props.tag || {}
    return (
      <div>
        <dl>
          <dt> Title </dt>
          <dl>
            <input
              ref={(input) => { this.refs = { ...this.refs, input } }}
              defaultValue={tag.title}
              onChange={ e => { this.setState({ title: e.target.value }) } }
            />
          </dl>
          <dt> Source code </dt>
          <dl>
            <textarea
              ref={(textarea) => { this.refs = { ...this.refs, textarea } } }
              defaultValue={tag.source}
              onChange={ e => { this.setState({ source: e.target.value }) } }
            />
          </dl>
        </dl>
        <button onClick={(e) => this.handleSaveClick(e)}>Save</button>
        {editButton}
      </div>
    )
  }
  render() {
    if (this.state && this.state.editMode) {
      return this.renderEditMode()
    }
    const { tag } = this.props
    return (
      <pre>
        {JSON.stringify(tag)}
        {this.renderEditButton()}
      </pre>
    )
  }
}

export default Relay.createContainer(TagEditor, {
  fragments: {
    tag: () => Relay.QL`
      fragment on Tag {
        id,
        source,
        title,
        ${EditTagMutation.getFragment('tag')},
      }
    `,
    game: () => Relay.QL`
      fragment on Game {
        ${AddTagMutation.getFragment('game')},
      }
    `
  }
})


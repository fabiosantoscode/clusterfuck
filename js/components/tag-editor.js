import React from 'react';

import assert from 'assert';

import Relay from 'react-relay';

import AddTagMutation from '../mutations/AddTagMutation';

class TagEditor extends React.Component {
  componentWillMount() {
    if (this.props.createMode) {
      this.setState({ editMode: true })
    }
  }
  handleSaveClick(e) {
    const mutation = this.props.createMode ?
      new AddTagMutation({
        game: this.props.game,
        title: this.refs.input.value,
        source: this.refs.textarea.value,
      }) :
      null

    assert(mutation)
    Relay.Store.commitUpdate(
      mutation
    );
  }
  handleEditModeToggle() {
    this.setState({
      editMode: !(this.state && this.state.editMode)
    })
  }
  renderEditButton() {
    return (
      <button onClick={() => { this.handleEditModeToggle() }}>edit</button>
    )
  }
  renderEditMode() {
    const editButton =
      this.props.createMode !== true ?  // If this was instantiated in create mode, don't toggle back
        this.renderEditButton() :
        null;
    return (
      <div>
        <dl>
          <dt> Source code </dt>
          <dl> <textarea ref={(textarea) => { this.refs = { ...this.refs, textarea } }}/> </dl>
          <dt> Title </dt>
          <dl> <input ref={(input) => { this.refs = { ...this.refs, input } }}/> </dl>
        </dl>
        <div onClick={(e) => this.handleSaveClick(e)}>Save</div>
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
      </pre>
    )
  }
}

export default Relay.createContainer(TagEditor, {
  fragments: {
    tag: () => Relay.QL`
      fragment on Tag {
        source,
        title,
      }
    `,
    game: () => Relay.QL`
      fragment on Game {
        ${AddTagMutation.getFragment('game')},
      }
    `
  }
})


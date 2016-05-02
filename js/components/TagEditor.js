import React from 'react';

import assert from 'assert';

import Relay from 'react-relay';

import AddTagMutation from '../mutations/AddTagMutation';
import EditTagMutation from '../mutations/EditTagMutation';

function EditToggleButton({ onEdit = () => null, children = 'Edit' }) {
  return (
    <button onClick={onEdit}>{children}</button>
  );
}

function TagViewer({ tag, onEdit = () => null }) {
  return (
    <pre>
      {tag.title}
      <EditToggleButton onEdit={onEdit} />
    </pre>
  )
}

class TagEditorEditMode extends React.Component {
  componentWillMount() {
    this.setState(this.props.tag)
  }
  isValid() {
    if (!this.state) return false
    const { title, source } = this.state;
    return title && source
  }
  render() {
    let {
      tag,
      onCancel = () => null,
      onSave = () => null,
      displayCancel,
    } = this.props
    tag = tag || {}
    const editButton = displayCancel && (
      <EditToggleButton onEdit={onCancel}>Cancel</EditToggleButton>
    )
    return (
      <form>
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
        <button
          disabled={!this.isValid()}
          onClick={
            (e) => {
              e.preventDefault()
              onSave({
                title: this.state.title,
                source: this.state.source,
              })
            }
          }
        >
          Save
        </button>
        {editButton}
      </form>
    )
  }
}

class TagEditor extends React.Component {
  componentWillMount() {
    if (this.props.createMode) {
      this.setState({ editMode: true })
    }
  }
  initialiseMutation(fieldData) {
    console.log('initialiseMutation', fieldData)
    const mutationVariables = {
      ...fieldData,
      game: this.props.game,
      tag: this.props.tag,
      id: (this.props.tag||{}).id,
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
  render() {
    if (this.state && this.state.editMode) {
      return (
        <TagEditorEditMode
          tag={this.props.tag}
          displayCancel={!this.props.createMode}
          onCancel={ () => { this.handleEditModeToggle() } }
          onSave={ (fieldData) => this.initialiseMutation(fieldData) }
        />
      )
    }
    return (
      <TagViewer
        tag={this.props.tag}
        onEdit={ () => { this.handleEditModeToggle() } }
      />
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


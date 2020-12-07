import {EditorView, EditorState, basicSetup} from '@codemirror/next/basic-setup';
import {ChangeSet} from '@codemirror/next/state';
import {diffChars} from 'diff';

/**
 * Convert a diff to a ChangeSet.
 * Usage:
 * changeSet = diffToChangeSet(Diff.diffChars('berry', 'strawberry'))
 * @param {array<{value: string, added: boolean-like, removed: boolean-like}>} diff
 * @returns {ChangeSet}
 */
function diffToChangeSet(diff) {
  let oldOffset = 0;
  let newOffset = 0;
  let changes = [];
  for (let {value, added, removed} of diff) {
    if (added) {
      changes.push({
        from: oldOffset,
        to: oldOffset,
        insert: value,
      });
      newOffset += value.length;
    } else if (removed) {
      changes.push({
        from: oldOffset,
        to: oldOffset + value.length,
        insert: '',
      });
      oldOffset += value.length;
    } else {
      oldOffset += value.length;
      newOffset += value.length;
    }
  }
  return ChangeSet.of(changes, oldOffset);
}

class EditorViewDiff {
  /**
   * Construct this diff and attach it to two editor views.
   */
  constructor(left, right) {
    this._updateListeners = [];
    this.left = left;
    this.right = right;

    this.left.dispatch(this.left.state.update({
      reconfigure: {
        append: EditorView.updateListener.of(this._onUpdateLeft.bind(this)),
      },
    }));
    this.right.dispatch(this.right.state.update({
      reconfigure: {
        append: EditorView.updateListener.of(this._onUpdateRight.bind(this)),
      },
    }));
  }
  _emptyUpdate(lr) {
    return {
      changes: ChangeSet.empty(lr.state.doc.length),
      prevState: lr.state,
      view: lr,
      state: lr.state,
      transactions: [],
      viewportChanged: false,
      heightChanged: false,
      geometryChanged: false,
      focusChanged: false,
      docChanged: false,
      selectionSet: false,
    };
  }
  _onUpdateLeft(update) {
    this._onUpdate(update, this._emptyUpdate(this.right));
  }
  _onUpdateRight(update) {
    this._onUpdate(this._emptyUpdate(this.left), update);
  }
  _onUpdate(leftUpdate, rightUpdate) {
    for (let onupdate of this._updateListeners) {
      onupdate(leftUpdate, rightUpdate);
    }
  }
  /**
   * @param {(left: ViewUpdate, right: ViewUpdate) -> undefined} onupdate
   */
  addUpdateListener(onupdate) {
    if (this._updateListeners.indexOf(onupdate) === -1) {
      this._updateListeners.push(onupdate);
    }
  }
  removeUpdateListener(onupdate) {
    let i = this._updateListeners.indexOf(onupdate);
    if (i !== -1) {
      this._updateListeners.splice(i, 1);
    }
  }
  getChangeSet() {
    return diffToChangeSet(diffChars(
      this.left.state.doc.toString(),
      this.right.state.doc.toString()));
  }
}

class MergeView {
  /**
   * @param {EditorView} options.left
   * @param {EditorView} options.right
   * @param {EditorViewDiff} options.diff
   * @param {Element} options.parent
   */
  constructor(options) {
    this.left = options.left;
    this.right = options.right;
    this.diff = options.diff || new EditorViewDiff(this.left, this.right);
    this.parent = options.parent;
    this.diff.addUpdateListener(this._update.bind(this));
    this._update();
  }
  _update(left, right) {
    console.log('update', this.parent, left, right, this.diff.getChangeSet());
  }
}

let left = new EditorView({
  state: EditorState.create({
    doc:
`CodeMirror 5's merge addon displays diffs.
Features:
- 2-way and 3-way diffs
- left or center pane is editable
- locked and unlocked scrolling
- 2-way only: optionally align changed sections
- 2-way only: optionally collapse unchanged lines`,
    extensions: [
      basicSetup,
    ],
  }),
  parent: document.querySelector('#left'),
});

let right = new EditorView({
  state: EditorState.create({
    doc:
`CodeMirror 6's merge addon displays diffs.
Features:
- n-way diffs
- all panes are editable
- locked scrolling
- align changed sections
- collapse unchanged lines`,
    extensions: [
      basicSetup,
    ],
  }),
  parent: document.querySelector('#right'),
});

let merge = new MergeView({
  left,
  right,
  parent: document.querySelector('#merge'),
});

import {EditorView, EditorState, basicSetup} from '@codemirror/next/basic-setup';
import {ChangeSet} from '@codemirror/next/state';
import {RangeSet} from '@codemirror/next/rangeset';
import {diffChars} from 'diff';
import {html, render} from 'lit-html';

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
    this._leftDecorations = RangeSet.empty;
    this._rightDecorations = RangeSet.empty;

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

  // Updates:
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

  get leftDecorations() { return this._leftDecorations; }
  get rightDecorations() { return this._rightDecorations; }
  set leftDecorations(decorations) {
    this._leftDecorations = decorations;
  }
  set rightDecorations(decorations) {
    this._rightDecorations = decorations;
  }

  // Changeset:
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
    render(html`
    <div style="width: 2em; height: 100%; background-color: red;">
    </div>
    `, this.parent);
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
  parent: document.querySelector('#a'),
});

let center = new EditorView({
  state: EditorState.create({
    doc:
`CodeMirror 6's merge addon displays diffs.
Features:
- all panes are editable
- align changed sections`,
    extensions: [
      basicSetup,
    ],
  }),
  parent: document.querySelector('#b'),
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
  parent: document.querySelector('#c'),
});

let mergeLeft = new MergeView({
  left,
  right: center,
  parent: document.querySelector('#ab'),
});
let mergeRight = new MergeView({
  left: center,
  right,
  parent: document.querySelector('#bc'),
});

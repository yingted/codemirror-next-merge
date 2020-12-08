import {EditorView, EditorState, basicSetup} from '@codemirror/next/basic-setup';
import {ViewPlugin, Decoration, WidgetType} from '@codemirror/next/view';
import {ChangeSet, StateField, StateEffect} from '@codemirror/next/state';
import {StyleModule} from 'style-mod';
import {RangeSet} from '@codemirror/next/rangeset';
import {diffChars} from 'diff';
import {html, render} from 'lit-html';

function assert(cond) {
  console.assert(cond);
  if (!cond) debugger;
}

class TemplateWidget extends WidgetType {
  constructor(template) {
    super(template);
    this._template = template;
  }
  toDOM(view) {
    let div = document.createElement('DIV');
    render(this._template, div);
    assert(div.firstElementChild === div.lastElementChild);
    return div.firstElementChild;
  }
}

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
/**
 * Convert a ChangeSet to a diff.
 * Usage:
 * diff = changeSetToDiff(changeSet, doc.toString());
 * @param {ChangeSet} changeSet
 * @param {string} a
 * @returns {array<{value: string, added: boolean-like, removed: boolean-like}>}
 */
function changeSetToDiff(changeSet, a) {
  let gaps = [];
  changeSet.iterGaps(function(posA, posB, length) {
    gaps.push({
      start: posA,
      span: {
        value: a.substring(posA, posA + length),
        added: false,
        removed: false,
      },
    });
  });

  let changes = [];
  changeSet.iterChanges(function(fromA, toA, fromB, toB, inserted) {
    // Deletion:
    if (fromA < toA) {
      changes.push({
        start: fromA,
        span: {
          value: a.substring(fromA, toA),
          added: false,
          removed: true,
        },
      });
    }
    // Insertion:
    if (fromB < toB) {
      changes.push({
        start: fromA,
        span: {
          value: inserted.toString(),
          added: true,
          removed: false,
        },
      });
    }
  });

  let merged = new Array(gaps.length + changes.length);
  for (let gi = 0, ci = 0, mi = 0; gi < gaps.length || ci < changes.length;) {
    if (gi < gaps.length && (ci === changes.length || gaps[gi].start <= changes[ci].start)) {
      merged[mi++] = gaps[gi++].span;
    } else {
      merged[mi++] = changes[ci++].span;
    }
  }
  return merged;
}

class ChangeSetField {
  /**
   * @param {EditorState -> Value} getDefault
   */
  constructor(getDefault) {
    /** @type {StateEffectType<ChangeSet>} */
    let set = StateEffect.define();
    this.set = set;
    this.field = StateField.define({
      create(state) {
        return getDefault(state);
      },
      update(value, tr) {
        value = value.map(tr.changes, /*before=*/true);
        for (let effect of tr.effects) {
          if (effect.is(set)) {
            value = effect.value;
          }
        }
        return value;
      },
    });
    this.extension = this.field;
  }
  /**
   * Usage: view.dispatch({effects: p.setChangeSetEffect(changeSet)});
   */
  setChangeSetEffect(changeSet) {
    return this.set.of(changeSet);
  }
  /**
   * Usage: view.dispatch({effects: p.setTargetEffect(view.state, target)});
   * @param {EditorState} state
   * @param {string} target
   * @return {StateEffect<ChangeSet>}
   */
  setTargetEffect(state, target) {
    let changeSet = diffToChangeSet(diffChars(state.doc.toString(), target));
    return this.setChangeSetEffect(changeSet);
  }
  /**
   * Usage: view1.dispatch({reconfigure: {append: p.syncTargetEffect(view2)}});
   * @param {EditorView} view
   * @param {(localValue: ChangeSet, localState: EditorState, remoteUpdate: ViewUpdate)} diff
   */
  syncTargetExtension(view, diff) {
    return EditorView.updateListener.of(update => {
      if (update.docChanged) {
        let changeSet;
        if (diff) {
          changeSet = diff(view.state.field(this.field), view.state, update);
        } else {
          changeSet = diffToChangeSet(diffChars(
            view.state.doc.toString(), update.state.doc.toString()));
        }
        view.dispatch({effects: this.setChangeSet(changeSet)});
      }
    });
  }
  static withDefault(value) {
    return new ChangeSetField(_ => value);
  }
}

/**
 * View that renders a changeset to an editor.
 * The changeset is a ChangeSetField.
 */
class ChangeSetPlugin {
  constructor(view, styles, changeSetField) {
    this.view = view;
    this.styles = styles;
    this.changeSetField = changeSetField;

    this.decorations = this._getDecorations(view);
  }
  _getDecorations(view) {
    /** @type {ChangeSet} */
    let changeSet = view.state.field(this.changeSetField);

    /** @type {array<Range<Decoration>>} */
    let ranges = [];

    changeSet.iterGaps((posA, posB, length) => {
      // Padding:
      let paddingLines = 0;  // TODO
      ranges.push({
        from: posA,
        to: posA,
        value: Decoration.widget({
          widget: new TemplateWidget(html`<span class=${this.styles.padding}>${new Array(paddingLines+ 1).join('\n')}</span>`),
          side: -1,
          block: false,
        }),
      });

      // Unchanged:
      ranges.push({
        from: posA,
        to: posA + length,
        value: Decoration.mark({class: this.styles.unchanged}),
      });
    });
    changeSet.iterChanges((fromA, toA, fromB, toB, inserted) => {
      // Deletion:
      if (fromA < toA) {
        ranges.push({
          from: fromA,
          to: toA,
          value: Decoration.mark({class: this.styles.delete}),
        });
      }

      // Insertion:
      if (fromB < toB) {
        ranges.push({
          from: toA,
          to: toA,
          value: Decoration.widget({
            widget: new TemplateWidget(html`<span class=${this.styles.insert}>${inserted.toString()}</span>`),
            side: 1,
            block: false,
          }),
        });
      }
    });
    return RangeSet.of(ranges, /*sort=*/true);
  }
  update(update) {
    if (update.viewportChanged || update.docChanged ||
        update.state.field(this.changeSetField) !==
        update.prevState.field(this.changeSetField)) {
      this.decorations = this._getDecorations(update.view);
    }
  }
  set(state, value) {
    
  }

  static makeExtension(styles, changeSetField) {
    return ViewPlugin.define(view => new ChangeSetPlugin(view, styles, changeSetField), {
      decorations: v => v.decorations,
    });
  }
  static defaultExtension = (function() {
    let changeSetField = ChangeSetField.withDefault(ChangeSet.of([
      {
        from: 0,
        to: 4,
        insert: '',
      },
      {
        from: 4,
        to: 4,
        insert: 'abc\ndef',
      },
    ], /*length=*/100));
    return [
      ChangeSetPlugin.makeExtension({
        insert: 'insert',
        delete: 'delete',
        unchanged: 'unchanged',
        padding: 'padding',
      }, changeSetField),
      EditorView.styleModule.of(new StyleModule({
        '.insert': {
          'background-color': 'rgba(0, 255, 0, 0.5)',
        },
        '.delete': {
          'text-decoration': 'line-through',
          'background-color': 'rgba(255, 0, 0, 0.5)',
        },
      })),
      changeSetField,
    ];
  })();
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
  addUpdateListenerAndCall(onupdate) {
    this.addUpdateListener(onupdate);
    onupdate(this._emptyUpdate(this.left), this._emptyUpdate(this.right));
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
    this.diff.addUpdateListenerAndCall(this._update.bind(this));
    this._updated = false;
  }
  _update(left, right) {
    // Deduplicate updates:
    if (this._updated && !(left.docChanged || left.viewportChanged || right.docChanged || right.viewportChanged)) {
      return;
    }
    this._updated = true;

    render(html`
      <div style="width: 2em; height: 100%;">
      </div>
      `, this.parent);
    let diff = changeSetToDiff(this.diff.getChangeSet(), this.left.state.doc.toString());
    console.log('update', this.parent, diff);
  }
}

let left = new EditorView({
  state: EditorState.create({
    doc:
`CodeMirror 5's merge addon displays diffs.
Features and limitations:
+ 2-way and 3-way diffs
- only left or center pane is editable
+ unlocked scrolling
+ 2-way only: optionally align changed sections
+ 2-way only: optionally collapse unchanged lines`,
    extensions: [
      basicSetup,
      ChangeSetPlugin.defaultExtension,
    ],
  }),
  parent: document.querySelector('#a'),
});

let center = new EditorView({
  state: EditorState.create({
    doc:
`CodeMirror 6's merge addon displays diffs.
Features and limitations:
+ align changed sections`,
    extensions: [
      basicSetup,
      ChangeSetPlugin.defaultExtension,
    ],
  }),
  parent: document.querySelector('#b'),
});

let right = new EditorView({
  state: EditorState.create({
    doc:
`CodeMirror 6's merge addon displays diffs.
Features and limitations:
+ n-way diffs
+ align changed sections
- pad-to-align is mandatory
+ collapse unchanged lines`,
    extensions: [
      basicSetup,
      ChangeSetPlugin.defaultExtension,
    ],
  }),
  parent: document.querySelector('#c'),
});

// let mergeLeft = new MergeView({
//   left,
//   right: center,
//   parent: document.querySelector('#ab'),
// });
// let mergeRight = new MergeView({
//   left: center,
//   right,
//   parent: document.querySelector('#bc'),
// });

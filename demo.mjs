import {EditorView, EditorState, basicSetup} from '@codemirror/next/basic-setup';
import {ViewPlugin, Decoration, WidgetType} from '@codemirror/next/view';
import {ChangeSet, StateField, StateEffect} from '@codemirror/next/state';
import {StyleModule} from 'style-mod';
import {RangeSet} from '@codemirror/next/rangeset';
import {diffChars, diffWords, diffLines} from 'diff';
import {html, render} from 'lit-html';
import {diff_match_patch} from 'diff-match-patch';

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
 * A hidden changeset, diffbase, or remote to diff against.
 * To get the value:
 * changeSet = view.state.field(csf.field);
 */
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
  static _diffChars(src, dst) {
    return diffToChangeSet(diffChars(src, dst));
  }
  static _diffWords(src, dst) {
    return diffToChangeSet(diffWords(src, dst));
  }
  static _diffLines(src, dst) {
    return diffToChangeSet(diffLines(src, dst));
  }
  static _diffSemantic(src, dst) {
    let d = new diff_match_patch();
    let diffs = d.diff_main(src, dst);
    d.diff_cleanupSemantic(diffs);

    return diffToChangeSet(
      diffs.map(([type, value]) =>
        ({value, added: type === 1, removed: type === -1})));
  }
  static _defaultDiff = ChangeSetField._diffSemantic;
  /**
   * Usage: dstView.dispatch({effects: csf.setChangeSetEffect(changeSet)});
   */
  setChangeSetEffect(changeSet) {
    return this.set.of(changeSet);
  }
  /**
   * Usage: dstView.dispatch({effects: csf.setTargetEffect(srcView.state, target)});
   * @param {EditorState} state
   * @param {string} target
   * @return {StateEffect<ChangeSet>}
   */
  setTargetEffect(state, target, diff) {
    diff = diff ?? ChangeSetField._defaultDiff;
    let changeSet = diff(target, state.doc.toString());
    return this.setChangeSetEffect(changeSet);
  }
  /**
   * Usage:
   * srcView.dispatch({reconfigure: {append: csf.syncTargetExtension(dstView)}});
   * @param {EditorView} dstView the view to update
   * @param {(localValue: ChangeSet, localState: EditorState, remoteUpdate: ViewUpdate)} diff
   */
  syncTargetExtension(dstView, diff) {
    diff = diff ?? ChangeSetField._defaultDiff;
    return EditorView.updateListener.of(update => {
      if (update.docChanged) {
        let changeSet = diff(dstView.state.doc.toString(), update.state.doc.toString());
        dstView.dispatch({effects: this.setChangeSetEffect(changeSet)});
      }
    });
  }
  /**
   * Create a changeset field with an initial value.
   */
  static withDefault(value) {
    return new ChangeSetField(_ => value);
  }
}

/**
 * View that renders a changeset to an editor.
 * The changeset is a ChangeSetField.
 */
class ChangeSetDecorations {
  constructor(view, styles, changeSetField) {
    this.view = view;
    this.styles = styles;
    this.changeSetField = changeSetField.field;

    this.decorations = this._getDecorations(view);
  }
  _getDecorations(view) {
    /** @type {ChangeSet} */
    let changeSet = view.state.field(this.changeSetField);

    /** @type {array<Range<Decoration>>} */
    let ranges = [];

    changeSet.iterGaps((posA, posB, length) => {
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

  static _makeExtension(styles, changeSetField) {
    return ViewPlugin.define(view => new ChangeSetDecorations(view, styles, changeSetField), {
      decorations: v => v.decorations,
    });
  }
  static _defaultStyle = EditorView.styleModule.of(new StyleModule({
    '.insert': {
      'background-color': 'rgba(0, 255, 0, 0.5)',
    },
    '.delete': {
      'text-decoration': 'line-through',
      'background-color': 'rgba(255, 0, 0, 0.5)',
    },
  }));
  /**
   * Extension to show proposed changes.
   */
  static futureExtension(changeSetField) {
    return [
      ChangeSetDecorations._makeExtension({
        insert: 'insert',
        delete: 'delete',
        unchanged: 'unchanged',
      }, changeSetField),
      ChangeSetDecorations._defaultStyle,
      changeSetField,
    ];
  }
  /**
   * Extension to show past changes.
   */
  static pastExtension(changeSetField) {
    return [
      ChangeSetDecorations._makeExtension({
        insert: 'delete',
        delete: 'insert',
        unchanged: 'unchanged',
      }, changeSetField),
      ChangeSetDecorations._defaultStyle,
      changeSetField,
    ];
  }
}

// class AcceptChangeGutter {
//   static makeExtension(changeSetField) {
//   }
// }

/**
 * Render a diff of srcView to dstView, to dstView.
 */
function watchAndDiffBackward(srcView, dstView) {
  let csf = ChangeSetField.withDefault(ChangeSet.empty(dstView.length));
  dstView.dispatch({reconfigure: {append: ChangeSetDecorations.pastExtension(csf)}});
  dstView.dispatch({effects: csf.setTargetEffect(srcView.state, dstView.state.doc.toString())});
  srcView.dispatch({reconfigure: {append: csf.syncTargetExtension(dstView)}});
}

/**
 * Render a diff of srcView to dstView, to srcView.
 */
function watchAndDiffForward(srcView, dstView) {
  let csf = ChangeSetField.withDefault(ChangeSet.empty(srcView.length));
  srcView.dispatch({reconfigure: {append: ChangeSetDecorations.futureExtension(csf)}});
  srcView.dispatch({effects: csf.setTargetEffect(dstView.state, srcView.state.doc.toString())});
  dstView.dispatch({reconfigure: {append: csf.syncTargetExtension(srcView)}});
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
    ],
  }),
  parent: document.querySelector('#a'),
});

let center = new EditorView({
  state: EditorState.create({
    doc:
`CodeMirror 6's merge addon displays diffs.
Features and limitations:
+ unified diff`,
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
Features and limitations:
+ align changed sections
+ collapse unchanged lines`,
    extensions: [
      basicSetup,
    ],
  }),
  parent: document.querySelector('#c'),
});

watchAndDiffForward(left, center);
watchAndDiffBackward(center, right);

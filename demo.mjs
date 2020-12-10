import {EditorView, EditorState, basicSetup} from '@codemirror/next/basic-setup';
import {ViewPlugin, Decoration, WidgetType} from '@codemirror/next/view';
import {ChangeSet, StateField, StateEffect} from '@codemirror/next/state';
import {gutter, GutterMarker} from '@codemirror/next/gutter';
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

  // Diff functions:
  static diffChars(src, dst) {
    return diffToChangeSet(diffChars(src, dst));
  }
  static diffWords(src, dst) {
    return diffToChangeSet(diffWords(src, dst));
  }
  static diffLines(src, dst) {
    return diffToChangeSet(diffLines(src, dst));
  }
  static diffSemantic(src, dst) {
    let d = new diff_match_patch();
    let diffs = d.diff_main(src, dst);
    d.diff_cleanupSemantic(diffs);

    return diffToChangeSet(
      diffs.map(([type, value]) =>
        ({value, added: type === 1, removed: type === -1})));
  }
  static diffDefault = ChangeSetField.diffSemantic;

  // Effects:
  /**
   * Usage: dstView.dispatch({effects: csf.setChangeSetEffect(changeSet)});
   */
  setChangeSetEffect(changeSet) {
    return this.set.of(changeSet);
  }
  /**
   * Usage: dstView.dispatch({effects: csf.setNewTextEffect(srcView.state, target)});
   * @param {EditorState} state
   * @param {string} target
   * @return {StateEffect<ChangeSet>}
   */
  setNewTextEffect(state, target, diff) {
    diff = diff ?? ChangeSetField.diffDefault;
    let changeSet = diff(target, state.doc.toString());
    return this.setChangeSetEffect(changeSet);
  }

  // Factories:
  /**
   * Usage:
   * dstView.dispatch({reconfigure: {append: ChangeSetField.syncTargetExtension(srcView)}});
   * @param {EditorView} srcView the view to watch
   * @param {(old: string, new: string) -> ChangeSet} diff
   * @returns {{extension: Extension, changeSetField: ChangeSetField}}
   */
  static syncTargetExtension(srcView, diff) {
    diff = diff ?? ChangeSetField.diffDefault;
    let srcState = srcView.state;
    let lastDstView = null;
    let updateDstView = function updateDstView(dstView, dstState) {
      let changeSet = diff(dstState.doc.toString(), srcState.doc.toString());
      dstView.dispatch({effects: csf.setChangeSetEffect(changeSet)});
    };
    srcView.dispatch({
      reconfigure: {
        append: EditorView.updateListener.of(update => {
          if (update.docChanged) {
            srcState = update.state;
            if (lastDstView !== null) {
              updateDstView(lastDstView, lastDstView.state);
            }
          }
        }),
      },
    });
    let csf = new ChangeSetField(dstState => {
      return diff(dstState.doc.toString(), srcState.doc.toString());
    });
    return {
      changeSetField: csf,
      extension: [
        csf,
        ViewPlugin.define(dstView => {
          lastDstView = dstView;
          return true;
        }),
        EditorView.updateListener.of(update => {
          lastDstView = update.view;
          if (update.docChanged) {
            updateDstView(update.view, update.state);
          }
        }),
      ],
    };
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
            widget: new TemplateWidget(html`<span class=${this.styles.insert} aria-hidden="true">${inserted.toString()}</span>`),
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

class AcceptChangeGutterMarker extends GutterMarker {
  constructor(template) {
    super();
    this._template = template;
  }
  eq(other) {
    return this === other;
  }
  toDOM(view) {
    let div = document.createElement('DIV');
    render(this._template, div);
    assert(div.firstElementChild === div.lastElementChild);
    return div.firstElementChild;
  }
}

/**
 * View that renders "accept change" buttons.
 */
class AcceptChangeGutter {
  /**
   * @param {ChangeSetField} changeSetField the ChangeSetField to render
   * @param {string} text text for the button
   * @param {string} label aria-label for the button
   */
  static _makeExtension(changeSetField, text, label) {
    let lastView = null;
    return [
      ViewPlugin.define(view => {
        lastView = view;
        return true;
      }),
      gutter({
        markers(state) {
          /** @type {array<Range<GutterMarker>>} */
          let ranges = [];

          let doc = state.doc;
          let changeSet = state.field(changeSetField.field);
          let gutters = [];
          changeSet.iterChanges((fromA, toA, fromB, toB, inserted) => {
            // Find the line:
            let line = doc.lineAt(fromA);
            // Avoid showing the marker on the "\n" of the previous line:
            if (fromA === line.to && fromA + 1 <= doc.length && (inserted.length === 0 || inserted.sliceString(0, 1) === '\n')) {
              line = doc.lineAt(fromA + 1);
            }

            // Find the gutter:
            let g;
            if (gutters.length > 0 && gutters[gutters.length - 1].from === line.from) {
              g = gutters[gutters.length - 1];
            } else {
              g = {from: line.from, changeSpec: []};
              gutters.push(g);
            }

            g.changeSpec.push({
              from: fromA,
              to: toA,
              insert: inserted,
            });
          });

          gutters.forEach(({from, changeSpec}) => {
            ranges.push({
              from,
              to: from,
              value: new AcceptChangeGutterMarker(
                html`<button aria-label=${label} @click=${e => {
                  if (lastView === null) return;
                  let changeSet = ChangeSet.of(changeSpec, doc.length);
                  lastView.dispatch({changes: changeSet});
                }}>${text}</button>`
              ),
            });
          });

          return RangeSet.of(ranges, /*sort=*/false);
        },
      }),
    ];
  }

  /**
   * Extension to accept proposed changes.
   */
  static acceptExtension(changeSetField) {
    return AcceptChangeGutter._makeExtension(changeSetField, '✓', 'accept');
  }
  /**
   * Extension to revert past changes.
   */
  static revertExtension(changeSetField) {
    return AcceptChangeGutter._makeExtension(changeSetField, '✗', 'revert');
  }
}

/**
 * Render a diff of srcView to dstView, to dstView.
 */
function watchAndDiffBackward(srcView, dstView) {
  let {changeSetField, extension} = ChangeSetField.syncTargetExtension(srcView);
  dstView.dispatch({reconfigure: {append: extension}});
  dstView.dispatch(
    {reconfigure: {append: ChangeSetDecorations.pastExtension(changeSetField)}},
    {reconfigure: {append: AcceptChangeGutter.revertExtension(changeSetField)}},
  );
}

/**
 * Render a diff of srcView to dstView, to srcView.
 */
function watchAndDiffForward(srcView, dstView) {
  let {changeSetField, extension} = ChangeSetField.syncTargetExtension(dstView);
  srcView.dispatch({reconfigure: {append: extension}});
  srcView.dispatch(
    {reconfigure: {append: ChangeSetDecorations.futureExtension(changeSetField)}},
    {reconfigure: {append: AcceptChangeGutter.acceptExtension(changeSetField)}},
  );
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
+ mobile-first
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
+ mobile-first
+ unified diff
+ collapse unchanged lines`,
    extensions: [
      basicSetup,
    ],
  }),
  parent: document.querySelector('#c'),
});

watchAndDiffForward(left, center);
watchAndDiffBackward(center, right);

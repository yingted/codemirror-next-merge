import {EditorView} from '@codemirror/next/basic-setup';
import {ViewPlugin} from '@codemirror/next/view';
import {ChangeSet, StateField, StateEffect} from '@codemirror/next/state';
import * as diff from 'diff';
import {diff_match_patch} from 'diff-match-patch';

/**
 * A single change, either a value was added, removed, or unchanged.
 * @typedef {{value: string, added: boolean-like, removed: boolean-like}} Change
 */

/**
 * Convert a diff to a ChangeSet.
 * Usage:
 * changeSet = diffToChangeSet(Diff.diffChars('berry', 'strawberry'))
 * @param {Change[]} diff
 * @returns {ChangeSet}
 */
export function diffToChangeSet(diff) {
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

// Diff functions:
/**
 * A function that diffs src and dst and returns the changes.
 * @typedef {(string, string) -> ChangeSet} DiffFunction
 */
/** @type {DiffFunction} */
export function diffChars(src, dst) {
  return diffToChangeSet(diff.diffChars(src, dst));
}
/** @type {DiffFunction} */
export function diffWords(src, dst) {
  return diffToChangeSet(diff.diffWords(src, dst));
}
/** @type {DiffFunction} */
export function diffLines(src, dst) {
  return diffToChangeSet(diff.diffLines(src, dst));
}
/** @type {DiffFunction} */
export function diffSemantic(src, dst) {
  let d = new diff_match_patch();
  let diffs = d.diff_main(src, dst);
  d.diff_cleanupSemantic(diffs);

  return diffToChangeSet(
    diffs.map(([type, value]) =>
      ({value, added: type === 1, removed: type === -1})));
}
/** @type {DiffFunction} */
export var diffDefault = diffSemantic;

/**
 * A hidden changeset, diffbase, or remote to diff against.
 * To get the value:
 * changeSet = view.state.field(csf.field);
 */
export class ChangeSetField {
  /**
   * @param {EditorState -> Value} getDefault
   */
  constructor(getDefault) {
    /** @type {StateEffectType<ChangeSet>} */
    let set = StateEffect.define();
    this.set = set;
    /** @type {StateField<ChangeSet>} */
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
    /** @type {Command} */
    this.acceptAll = this._acceptAll.bind(this);
  }

  /**
   * @param {EditorView} target
   * @returns {boolean}
   */
  _acceptAll(target) {
    target.dispatch({changes: target.field(this.field)});
    return true;
  }

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
  setNewTextEffect(state, target, diff = diffDefault) {
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
  static syncTargetExtension(srcView, diff = diffDefault) {
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
   * @param {ChangeSet} value
   * @returns {ChangeSetField}
   */
  static withDefault(value) {
    return new ChangeSetField(_ => value);
  }
}

import {ViewPlugin} from '@codemirror/next/view';
import {acceptMarker, revertMarker, applyChunkGutter} from './apply_chunk.mjs';
import {ChangeSetField} from './changeset_field.mjs';
import {futureExtension, pastExtension} from './decorations.mjs';
import {foldGaps} from './fold_gaps.mjs';

function makeExtension(changeSetField, extension, options, future) {
  let foldMargin = options.foldMargin;
  return [
    extension,
    (future ? futureExtension : pastExtension)(changeSetField),
    applyChunkGutter(changeSetField, revertMarker),
    foldGaps(changeSetField, /*margin=*/foldMargin),
  ];
}

/**
 * Show a diff reverting the changes in the view.
 * @param {EditorView} pastView the view to revert to
 * @param {number} [options.foldMargin=3] clean lines of margin for folding
 * @returns {Extension}
 */
export function revertView(pastView, options = {}) {
  let {changeSetField, extension} = ChangeSetField.syncTargetExtension(pastView);
  return makeExtension(changeSetField, extension, options, /*future=*/false);
}

/**
 * Show a diff accepting the changes in the view.
 * @param {EditorView} futureView the view to accept
 * @param {number} [options.foldMargin=3] clean lines of margin for folding
 * @returns {Extension}
 */
export function acceptView(futureView, options = {}) {
  let {changeSetField, extension} = ChangeSetField.syncTargetExtension(futureView);
  return makeExtension(changeSetField, extension, options, /*future=*/true);
}

/**
 * Show a diff reverting the changes in the string.
 * @param {string} pastString the string to revert to
 * @param {number} [options.foldMargin=3] clean lines of margin for folding
 * @returns {Extension}
 */
export function revertString(pastString, options = {}) {
  let {changeSetField, extension} = ChangeSetField.withString(pastString);
  return makeExtension(changeSetField, extension, options, /*future=*/false);
}

/**
 * Show a diff accepting the changes in the string.
 * @param {string} futureString the string to accept
 * @param {number} [options.foldMargin=3] clean lines of margin for folding
 * @returns {Extension}
 */
export function acceptString(futureString, options = {}) {
  let {changeSetField, extension} = ChangeSetField.withString(futureString);
  return makeExtension(changeSetField, extension, options, /*future=*/true);
}

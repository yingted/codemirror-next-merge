import {ViewPlugin} from '@codemirror/next/view';
import {acceptMarker, revertMarker, applyChunkGutter} from './apply_chunk.mjs';
import {ChangeSetField} from './changeset_field.mjs';
import {futureExtension, pastExtension} from './decorations.mjs';
import {foldGaps} from './fold_gaps.mjs';

function makeExtension(changeSetField, extension, options) {
  let foldMargin = options.foldMargin;
  return [
    extension,
    pastExtension(changeSetField),
    applyChunkGutter(changeSetField, revertMarker),
    foldGaps(changeSetField, /*margin=*/foldMargin),
  ];
}

/**
 * Show a diff reverting the changes in the view.
 * @param {pastView} the view to revert to
 * @param {number} [options.foldMargin=3] clean lines of margin for folding
 * @returns {Extension}
 */
export function revertView(pastView, options = {}) {
  let {changeSetField, extension} = ChangeSetField.syncTargetExtension(pastView);
  return makeExtension(changeSetField, extension, options);
}

/**
 * Show a diff accepting the changes in the view.
 * @param {futureView} the view to accept
 * @param {number} [options.foldMargin=3] clean lines of margin for folding
 * @returns {Extension}
 */
export function acceptView(futureView, options = {}) {
  let {changeSetField, extension} = ChangeSetField.syncTargetExtension(futureView);
  return makeExtension(changeSetField, extension, options);
}

import {foldAll} from '@codemirror/next/fold';
import {acceptMarker, revertMarker, applyChunkGutter} from './apply_chunk.mjs';
export {ChangeSetField} from './changeset_field.mjs';
export {ChangeSetDecorations} from './decorations.mjs';
export {foldGaps} from './fold_gaps.mjs';

/**
 * Render a diff of srcView to dstView, to dstView.
 */
export function watchAndDiffBackward(srcView, dstView) {
  let {changeSetField, extension} = ChangeSetField.syncTargetExtension(srcView);
  dstView.dispatch({reconfigure: {append: extension}});
  dstView.dispatch(
    {reconfigure: {append: ChangeSetDecorations.pastExtension(changeSetField)}},
    {reconfigure: {append: applyChunkGutter(changeSetField, revertMarker)}},
    {reconfigure: {append: foldGaps(changeSetField, /*margin=*/1)}},
  );
  foldAll(dstView);
}

/**
 * Render a diff of srcView to dstView, to srcView.
 */
export function watchAndDiffForward(srcView, dstView) {
  let {changeSetField, extension} = ChangeSetField.syncTargetExtension(dstView);
  srcView.dispatch({reconfigure: {append: extension}});
  srcView.dispatch(
    {reconfigure: {append: ChangeSetDecorations.futureExtension(changeSetField)}},
    {reconfigure: {append: applyChunkGutter(changeSetField, acceptMarker)}},
    {reconfigure: {append: foldGaps(changeSetField, /*margin=*/1)}},
  );
  foldAll(srcView);
}

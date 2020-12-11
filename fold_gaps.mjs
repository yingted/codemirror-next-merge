import {RangeSet} from '@codemirror/next/rangeset';
import {foldService} from '@codemirror/next/language';

/**
 * Code folding service for gaps in a ChangeSet.
 * Folds any range of at least 2 empty lines.
 * @param {ChangeSetField} changeSetField the ChangeSetField to render
 * @param {number} margin how much gap around the text
 * @returns {Extension}
 */
export function foldGaps(changeSetField, margin = 3) {
  /** @type {WeakMap<ChangeSet, WeakMap<Document, RangeSet<boolean>>>} */
  let gapsWithMargins = new WeakMap();
  return [
    changeSetField,
    foldService.of(function(state, lineStart, lineEnd) {
      // Get the changeset and doc to compute the gaps for:
      let changeSet = state.field(changeSetField.field);
      let doc = state.doc;

      // Get the gaps:
      let gapsByDoc = gapsWithMargins.get(changeSet);
      if (gapsByDoc === undefined) {
        gapsByDoc = new WeakMap();
        gapsWithMargins.set(changeSet, gapsByDoc);
      }
      let gaps = gapsByDoc.get(doc);
      if (gaps === undefined) {
        /** @type {Array<Range<boolean>>} */
        let ranges = [];
        changeSet.iterGaps((posA, posB, length) => {
          // Get the first empty line:
          let firstEmptyLine = doc.lineAt(posA);
          if (posA > firstEmptyLine.from) {
            // ++firstEmptyLine
            if (firstEmptyLine.to === doc.length) return;
            firstEmptyLine = doc.lineAt(firstEmptyLine.to + 1);
          }

          // Get the last empty line:
          let lastEmptyLine = doc.lineAt(posA + length);
          if (posA + length < lastEmptyLine.to) {
            // --lastEmptyLine
            if (lastEmptyLine.from === 0) return;
            lastEmptyLine = doc.lineAt(lastEmptyLine.from - 1);
          }

          // Skip `margin` lines:
          if (firstEmptyLine.from > 0) {
            for (let i = 0; i < margin; ++i) {
              // ++firstEmptyLine
              if (firstEmptyLine.to === doc.length) return;
              firstEmptyLine = doc.lineAt(firstEmptyLine.to + 1);
            }
          }
          if (lastEmptyLine.to < doc.length) {
            for (let i = 0; i < margin; ++i) {
              // --lastEmptyLine
              if (lastEmptyLine.from === 0) return;
              lastEmptyLine = doc.lineAt(lastEmptyLine.from - 1);
            }
          }

          // Check the range is more than one line:
          if (firstEmptyLine.from >= lastEmptyLine.from) return;

          ranges.push({
            from: firstEmptyLine.from,
            to: lastEmptyLine.to,
            value: true,
          });
        });

        gaps = RangeSet.of(ranges, /*sort=*/false);
        gapsByDoc.set(doc, gaps);
      }

      // Return the gaps:
      for (let it = gaps.iter(lineStart); it.value !== null && it.from <= lineEnd; it.next()) {
        if (lineStart <= it.from) {
          return {from: it.from, to: it.to};
        }
      }
      return null;
    }),
  ];
}

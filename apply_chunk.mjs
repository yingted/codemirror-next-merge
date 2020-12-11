import {ViewPlugin} from '@codemirror/next/view';
import {ChangeSet} from '@codemirror/next/state';
import {gutter, GutterMarker} from '@codemirror/next/gutter';
import {RangeSet} from '@codemirror/next/rangeset';
import {html, render} from 'lit-html';

/**
 * A GutterMarker from a lit-html template.
 */
class TemplateGutterMarker extends GutterMarker {
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
    console.assert(div.firstElementChild === div.lastElementChild);
    return div.firstElementChild;
  }
}

/**
 * A gutter marker which applies the chunk on the current line.
 * @typedef {(view: EditorView, chunk: ChangeSet, applyChunk: () -> undefined) -> GutterMarker} ApplyChunkMarker
 */
/** @type {ApplyChunkMarker} */
export acceptMarker(view, chunk, applyChunk) {
  return new TemplateGutterMarker(html`<button aria-label="accept" @click=${applyChunk}>✓</button>`);
}
/** @type {ApplyChunkMarker} */
export revertMarker(view, chunk, applyChunk) {
  return new TemplateGutterMarker(html`<button aria-label="revert" @click=${applyChunk}>✗</button>`);
}

/**
 * Gutter with apply chunk widgets.
 * @param {ChangeSetField} changeSetField the ChangeSetField to render
 * @param {ApplyChunkMarker} applyChunkMarker
 * Render a widget to apply the current chunk.
 * Pass acceptMarker or revertMarker to get pretty standard buttons.
 * @returns {Extension}
 */
export applyChunkGutter(changeSetField, applyChunkMarker) {
  let lastView = null;
  return [
    changeSetField,
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
            value: applyChunkMarker(
              view,
              changeSet,
              function acceptChunk() {
                if (lastView === null) return;
                let changeSet = ChangeSet.of(changeSpec, doc.length);
                lastView.dispatch({changes: changeSet});
              }),
          });
        });

        return RangeSet.of(ranges, /*sort=*/false);
      },
    }),
  ];
}

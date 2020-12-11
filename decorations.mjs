import {EditorView} from '@codemirror/next/basic-setup';
import {ViewPlugin, Decoration, WidgetType} from '@codemirror/next/view';
import {ChangeSet, StateField, StateEffect} from '@codemirror/next/state';
import {StyleModule} from 'style-mod';
import {RangeSet} from '@codemirror/next/rangeset';
import {html, render} from 'lit-html';

class TemplateWidget extends WidgetType {
  constructor(template) {
    super(template);
    this._template = template;
  }
  toDOM(view) {
    let div = document.createElement('DIV');
    render(this._template, div);
    console.assert(div.firstElementChild === div.lastElementChild);
    return div.firstElementChild;
  }
}

/**
 * View that renders a changeset to an editor.
 * The changeset is a ChangeSetField.
 */
export class ChangeSetDecorations {
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

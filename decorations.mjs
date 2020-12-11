import {EditorView} from '@codemirror/next/basic-setup';
import {ViewPlugin, Decoration, WidgetType} from '@codemirror/next/view';
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
 * A widget to render a bit of text.
 * @typedef {string -> WidgetType|null} TextWidget
 */
/**
 * @typedef {{inserted: TextWidget, deleted: TextWidget, unchanged: TextWidget}} ChangeSetWidgets
 */

/**
 * View that renders a changeset to an editor.
 * The changeset is a ChangeSetField.
 */
export class ChangeSetDecorations {
  /**
   * @param {EditorView} view
   * @param {ChangeSetWidgets} widgets
   * @param {ChangeSetField} changeSetField
   */
  constructor(view, widgets, changeSetField) {
    this.widgets = widgets;
    this.changeSetField = changeSetField;

    this.decorations = this._getDecorations(view);
  }
  _getDecorations(view) {
    /** @type {ChangeSet} */
    let changeSet = view.state.field(this.changeSetField.field);
    let text = view.state.doc.toString();

    /** @type {array<Range<Decoration>>} */
    let ranges = [];

    changeSet.iterGaps((posA, posB, length) => {
      // Unchanged:
      let widget = this.widgets.unchanged(text.substring(posA, posA + length));
      if (widget !== null) {
        ranges.push({
          from: posA,
          to: posA + length,
          value: widget,
        });
      }
    });
    changeSet.iterChanges((fromA, toA, fromB, toB, inserted) => {
      // Deletion:
      if (fromA < toA) {
        let widget = this.widgets.delete(text.substring(fromA, toA));
        if (widget !== null) {
          ranges.push({
            from: fromA,
            to: toA,
            value: widget,
          });
        }
      }

      // Insertion:
      if (fromB < toB) {
        let widget = this.widgets.insert(inserted);
        if (widget !== null) {
          ranges.push({
            from: toA,
            to: toA,
            value: widget,
          });
        }
      }
    });
    return RangeSet.of(ranges, /*sort=*/true);
  }
  update(update) {
    if (update.viewportChanged || update.docChanged ||
        update.state.field(this.changeSetField.field) !==
        update.prevState.field(this.changeSetField.field)) {
      this.decorations = this._getDecorations(update.view);
    }
  }

  /**
   * Make a changeset decoration extension.
   * @param {ChangeSetWidgets} widgets
   * @param {ChangeSetField} changeSetField
   * @returns {Extension}
   */
  static makeExtension(widgets, changeSetField) {
    return ViewPlugin.define(view => new ChangeSetDecorations(view, widgets, changeSetField), {
      decorations: v => v.decorations,
    });
  }
}

// Default theme:
let defaultStyle = EditorView.styleModule.of(new StyleModule({
  '.insert': {
    'background-color': 'rgba(0, 255, 0, 0.5)',
  },
  '.delete': {
    'text-decoration': 'line-through',
    'background-color': 'rgba(255, 0, 0, 0.5)',
  },
}));

function futureOrPastExtension(changeSetField, future) {
  let unchanged = Decoration.mark({class: 'unchanged'});
  let delete_ = Decoration.mark({class: future ? 'delete' : 'insert'});
  return [
    ChangeSetDecorations.makeExtension({
      insert(inserted) { return Decoration.widget({
        widget: new TemplateWidget(html`<span class=${future ? 'insert' : 'delete'} aria-hidden="true">${inserted.toString()}</span>`),
        side: 1,
        block: false,
      }); },
      delete() { return delete_; },
      unchanged() { return unchanged; },
    }, changeSetField),
    defaultStyle,
    changeSetField,
  ];
}

/**
 * Extension to show proposed changes.
 * Screenreaders show the current document, ignoring changes.
 * @param {ChangeSetField} changeSetField
 * @returns {Extension}
 */
export function futureExtension(changeSetField) {
  return futureOrPastExtension(changeSetField, /*future=*/true);
}

/**
 * Extension to show past changes.
 * Screenreaders show the current document, ignoring changes.
 * @param {ChangeSetField} changeSetField
 * @returns {Extension}
 */
export function pastExtension(changeSetField) {
  return futureOrPastExtension(changeSetField, /*future=*/false);
}

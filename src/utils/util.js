/**
 * [parseStrByDelimiter description]
 * @method parseStrByDelimiter
 * @param  {[string]} str       = ''  [origin str]
 * @param  {[string]} delimiter = '@' [delimiter str]
 * @return {[string]}
 */
function parseStrByDelimiter(str = '', delimiter = '@') {
  const idx = str.lastIndexOf(delimiter);
  let ret;
  if (idx !== -1) {
    ret = str.substring(idx + 1);
  } else {
    ret = false;
  }
  return ret;
}

/**
 * [get window scroll offset]
 * @method getScrollOffset
 */
function getScrollOffset() {
  const offset = {};
  if (window.pageXOffset) {
    offset.x = window.pageXOffset;
  } else {
    offset.x = document.documentElement.scrollLeft;
  }
  if (window.pageYOffset) {
    offset.y = window.pageYOffset;
  } else {
    offset.y = document.documentElement.scrollTop;
  }
  return offset;
}

function getCaretOffset(element) {
  let start;
  let end;
  if (element.setSelectionRange) {
    start = element.selectionStart;
    end = element.selectionEnd;
  } else {
    element.focus();
    const range = document.selection.createRange();
    if (element.tagName.toUpperCase() === 'TEXTAREA') {
      // textarea
      const duplicate = range.duplicate();
      duplicate.moveToElementText(element);
      start = -1;
      while (duplicate.inRange(range)) {
        duplicate.moveStart('character');
        start += 1;
      }
    } else if (element.tagName.toUpperCase() === 'INPUT') {
      // input
      range.moveStart('character', -element.value.length);
      start = range.text.length;
    }
    end = start + range.text.length;
  }
  return {
    start,
    end,
  };
}

function getElementOffset(element) {
  const box = element.getBoundingClientRect();
  const doc = element.ownerDocument;
  const body = doc.body;
  const clientTop = doc.documentElement.clientTop || body.clientTop || 0;
  const clientLeft = doc.documentElement.clientLeft || body.clientLeft || 0;
  const top = box.top + (window.pageYOffset || doc.documentElement.scrollTop) - clientTop;
  const left = box.left + (window.pageXOffset || doc.documentElement.scrollLeft) - clientLeft;

  return {
    left,
    top,
  };
}

// The properties that we copy into a mirrored div.
// Note that some browsers, such as Firefox,
// do not concatenate properties, i.e. padding-top, bottom etc. -> padding,
// so we have to do every single property specifically.
const properties = [
  'direction', // RTL support
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY', // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration', // might not make a difference, but better be safe

  'letterSpacing',
  'wordSpacing',

  'tabSize',
  'MozTabSize',

];

function getCaretPosition(element) {
  let left;
  let top;
  if (document.selection) {
    element.focus();
    const range = document.selection.createRange();
    left = range.boundingLeft + element.scrollLeft;
    top = range.boundingTop + element.scrollTop;
  } else {
    const SHADOWEDITOR = '__shadow_editor__';
    const SHADOWEDITORTEXT = '__shadow_editor_text__';
    const SHADOWEDITORCARET = '__shadow_editor_caret__';
    const shadowEditor = element[SHADOWEDITOR] || document.createElement('div');
    const shadowEditorCaret = element[SHADOWEDITORCARET] || document.createElement('span');
    const shadowEditorText = element[SHADOWEDITORTEXT] || document.createElement('span');
    let focusOffset = { left: 0, top: 0 };
    if (!element[SHADOWEDITOR]) {
      // add shadpw element to element's cache
      element[SHADOWEDITOR] = shadowEditor;
      element[SHADOWEDITORCARET] = shadowEditorCaret;
      element[SHADOWEDITORTEXT] = shadowEditorText;
      // append shadow to document body
      shadowEditor.appendChild(shadowEditorText);
      shadowEditor.appendChild(shadowEditorCaret);
      document.body.appendChild(shadowEditor);
      // set shadow element's style
      const style = shadowEditor.style;
      const computed = window.getComputedStyle ?
        getComputedStyle(element) : element.currentStyle; // currentStyle for IE < 9

      if (element.nodeName !== 'INPUT') {
        // only for textarea
        style.whiteSpace = 'pre-wrap';
        style.wordWrap = 'break-word';
      } else {
        style.whiteSpace = 'nowrap';
      }

      style.position = 'absolute';
      style.overflow = 'hidden';
      style.visibility = 'hidden';
      properties.forEach((prop) => {
        style[prop] = computed[prop];
      });

      shadowEditorCaret.textContent = '|';
      shadowEditorCaret.style.cssText =
        'display:inline-block;width:0;overflow:hidden;word-wrap:break-word;word-break:break-all;';
    }
    let cursorHeight;
    if (element.nodeName !== 'INPUT') {
      let lh = shadowEditor.style.lineHeight;
      if (lh === 'normal') {
        lh = parseInt(shadowEditor.style.fontSize, 10) * 1.2;
      }
      cursorHeight = parseInt(lh, 10);
    } else {
      cursorHeight = parseInt(shadowEditor.style.height, 10)
        - parseInt(shadowEditor.style.paddingTop, 10)
        - parseInt(shadowEditor.style.paddingBottom, 10)
        - 2;
    }
    const offset = getElementOffset(element);
    shadowEditor.style.top = `${offset.top}px`;
    shadowEditor.style.left = `${offset.left}px`;
    const index = element.selectionEnd;
    const SHADOWEDITORCONTENT = element.value.substring(0, index);
    shadowEditorText.textContent = SHADOWEDITORCONTENT;

    shadowEditorCaret.style.display = 'inline-block';
    try { focusOffset = getElementOffset(shadowEditorCaret); } catch (e) {}
    // shadowEditorCaret.style.display = 'none';
    left = focusOffset.left - element.scrollLeft;
    top = focusOffset.top + cursorHeight - element.scrollTop;
    const winOffset = getScrollOffset();
    left -= winOffset.x;
    top -= winOffset.y;
  }
  return {
    left,
    top,
  };
}

function createEvent(element, type) {
  let evt;
  if ('createEvent' in document) {
    evt = document.createEvent('HTMLEvents');
    evt.initEvent(type, true, true);
    element.dispatchEvent(evt);
  } else {
    evt = document.createEventObject();
    element.fireEvent(`on${type}`, evt);
  }
  return evt;
}

export { parseStrByDelimiter, getScrollOffset, getCaretOffset, getCaretPosition, createEvent };

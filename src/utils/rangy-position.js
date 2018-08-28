/**
 * Position module for Rangy.
 * Extensions to Range and Selection objects to provide access to pixel positions relative to the viewport or document.
 *
 * Part of Rangy, a cross-browser JavaScript range and selection library
 * https://github.com/timdown/rangy
 *
 * Depends on Rangy core.
 *
 * Copyright %%build:year%%, Tim Down
 * Licensed under the MIT license.
 * Version: %%build:version%%
 * Build date: %%build:date%%
 */
// import rangy from 'rangy';
if (typeof rangy !== 'undefined') {
  rangy.createModule('Position', ['WrappedSelection'], (api, module) => {
    // var log = log4javascript.getLogger("rangy.position");
    const NUMBER = 'number';
    const UNDEF = 'undefined';
    const WrappedRange = api.WrappedRange;
    const WrappedTextRange = api.WrappedTextRange;
    const dom = api.dom;
    const util = api.util;
    const DomPosition = dom.DomPosition;

    // Feature detection

    // var caretPositionFromPointSupported = (typeof document.caretPositionFromPoint != UNDEF);

    // Since Rangy can deal with multiple documents which could be in different modes, we have to do the checks every
    // time, unless we cache a getScrollPosition function in each document. This would necessarily pollute the
    // document's global namespace, which I'm choosing to view as a greater evil than a slight performance hit.
    function getScrollPosition(win) {
      let x = 0;
      let y = 0;
      if (typeof win.pageXOffset === NUMBER && typeof win.pageYOffset === NUMBER) {
        x = win.pageXOffset;
        y = win.pageYOffset;
      } else {
        const doc = win.document;
        const docEl = doc.documentElement;
        const compatMode = doc.compatMode;
        const scrollEl = (typeof compatMode === 'string' && compatMode.indexOf('CSS') >= 0 && docEl) ? docEl : dom.getBody(doc);
        if (scrollEl && typeof scrollEl.scrollLeft === NUMBER && typeof scrollEl.scrollTop === NUMBER) {
          try {
            x = scrollEl.scrollLeft;
            y = scrollEl.scrollTop;
          } catch (ex) {}
        }
      }
      return { x, y };
    }

    function getAncestorElement(node, tagName) {
      tagName = tagName.toLowerCase();
      while (node) {
        if (node.nodeType == 1 && node.tagName.toLowerCase() == tagName) {
          return node;
        }
        node = node.parentNode;
      }
      return null;
    }

    function Rect(top, right, bottom, left) {
      this.top = top;
      this.right = right;
      this.bottom = bottom;
      this.left = left;
      this.width = right - left;
      this.height = bottom - top;
    }

    function createRelativeRect(rect, dx, dy) {
      return new Rect(rect.top + dy, rect.right + dx, rect.bottom + dy, rect.left + dx);
    }

    function adjustClientRect(rect, doc) {
      // Older IEs have an issue with a two pixel margin on the body element
      let dx = 0;
      let dy = 0;
      const docEl = doc.documentElement;
      const body = dom.getBody(doc);
      const container = (docEl.clientWidth === 0 && typeof body.clientTop === NUMBER) ? body : docEl;
      const clientLeft = container.clientLeft;
      const clientTop = container.clientTop;
      if (clientLeft) {
        dx = -clientLeft;
      }
      if (clientTop) {
        dy = -clientTop;
      }
      return createRelativeRect(rect, dx, dy);
    }

    function mergeRects(rects) {
      let tops = [],
        bottoms = [],
        lefts = [],
        rights = [];
      for (var i = 0, len = rects.length, rect; i < len; ++i) {
        rect = rects[i];
        if (rect) {
          tops.push(rect.top);
          bottoms.push(rect.bottom);
          lefts.push(rect.left);
          rights.push(rect.right);
        }
      }
      return new Rect(
        Math.min(...tops),
        Math.max(...rights),
        Math.max(...bottoms),
        Math.min(...lefts),
      );
    }

    function getTextRangePosition(doc, x, y) {
      const textRange = dom.getBody(doc).createTextRange();
      const range = new api.WrappedTextRange(textRange);
      textRange.moveToPoint(x, y);
      return new DomPosition(range.startContainer, range.startOffset);
    }

    function caretPositionFromPoint(doc, x, y) {
      const pos = doc.caretPositionFromPoint(x, y);
      return new DomPosition(pos.offsetNode, pos.offset);
    }

    function caretRangeFromPoint(doc, x, y) {
      const range = doc.caretRangeFromPoint(x, y);
      return new DomPosition(range.startContainer, range.startOffset);
    }

    function getLastRangeRect(range) {
      const rects = (range.nativeRange || range).getClientRects();
      return (rects.length > 0) ? rects[rects.length - 1] : null;
    }

    function pointIsInOrAboveRect(x, y, rect) {
      console.log('pointIsInOrAboveRect', x, y, Math.floor(rect.top), Math.floor(rect.right), Math.floor(rect.bottom), Math.floor(rect.left));
      return y < rect.bottom && x >= rect.left && x <= rect.right;
    }

    function positionFromPoint(doc, x, y, favourPrecedingPosition) {
      const el = doc.elementFromPoint(x, y);
      const range = api.createRange(doc);
      console.log('elementFromPoint is ', el);
      range.selectNodeContents(el);
      range.collapse(true);
      let node = el.firstChild,
        offset,
        rect,
        textLen;
      if (!node) {
        node = el.parentNode;
        offset = dom.getNodeIndex(el);
        if (!favourPrecedingPosition) {
          ++offset;
        }
      } else {
        // Search through the text node children of el
        main: while (node) {
          console.log(node);
          if (node.nodeType == 3) {
            // Go through the text node character by character
            for (offset = 0, textLen = node.length; offset <= textLen; ++offset) {
              range.setEnd(node, offset);
              rect = getLastRangeRect(range);
              if (rect && pointIsInOrAboveRect(x, y, rect)) {
                // We've gone past the point. Now we check which side (left or right) of the character the point is nearer to
                if (rect.right - x > x - rect.left) {
                  --offset;
                }
                break main;
              }
            }
          } else {
            // Handle elements
            range.setEndAfter(node);
            rect = getLastRangeRect(range);
            if (rect && pointIsInOrAboveRect(x, y, rect)) {
              offset = dom.getNodeIndex(node);
              node = el.parentNode;
              if (!favourPrecedingPosition) {
                ++offset;
              }
              break;
            }
          }
          node = node.nextSibling;
        }
        if (!node) {
          node = el;
          offset = el.childNodes.length;
        }
      }
      return new DomPosition(node, offset);
    }

    function createCaretPositionFromPointGetter(doc) {
      if (api.features.implementsTextRange) {
        return getTextRangePosition;
      } else if (typeof doc.caretPositionFromPoint !== UNDEF) {
        return caretPositionFromPoint;
      } else if (typeof doc.caretRangeFromPoint !== UNDEF) {
        return caretRangeFromPoint;
      } else if (typeof doc.elementFromPoint !== UNDEF && rangeSupportsGetClientRects) {
        return positionFromPoint;
      }
      throw module.createError('createCaretPositionFromPointGetter(): Browser does not provide a recognised method to create a selection from pixel coordinates');
    }

    function createRangeFromPoints(startX, startY, endX, endY, doc) {
      const positionFinder = createCaretPositionFromPointGetter(doc);
      const startPos = positionFinder(doc, startX, startY, false);
      const endPos = positionFinder(doc, endX, endY, true);
      const range = api.createRange(doc);
      doc = dom.getContentDocument(doc, module, 'createRangeFromPoints');
      console.log(startPos.node, startPos.offset, endPos.node, endPos.offset);
      range.setStartAndEnd(startPos.node, startPos.offset, endPos.node, endPos.offset);
      return range;
    }

    function moveSelectionToPoints(anchorX, anchorY, focusX, focusY, doc) {
      let startX,
        startY,
        endX,
        endY;
      // Detect backward selection for coordinates and flip start and end coordinates if necessary
      const backward = focusY < anchorY || (anchorY == focusY && focusX < anchorX);
      const sel = rangy.getSelection(doc);
      const range = createRangeFromPoints(startX, startY, endX, endY, doc);
      if (backward) {
        startX = focusX;
        startY = focusY;
        endX = anchorX;
        endY = anchorY;
      } else {
        startX = anchorX;
        startY = anchorY;
        endX = focusX;
        endY = focusY;
      }
      sel.setSingleRange(range);
      return sel;
    }

    // Test that <span> elements support getBoundingClientRect
    let span = document.createElement('span');
    const elementSupportsGetBoundingClientRect = util.isHostMethod(span, 'getBoundingClientRect');
    span = null;

    // Test for getBoundingClientRect support in Range
    var rangeSupportsGetClientRects = false,
      rangeSupportsGetBoundingClientRect = false;
    if (api.features.implementsDomRange) {
      const testRange = api.createNativeRange();
      rangeSupportsGetClientRects = util.isHostMethod(testRange, 'getClientRects');
      rangeSupportsGetBoundingClientRect = util.isHostMethod(testRange, 'getBoundingClientRect');
    }

    util.extend(api.features, {
      rangeSupportsGetBoundingClientRect,
      rangeSupportsGetClientRects,
      elementSupportsGetBoundingClientRect,
    });
    let createClientBoundaryPosGetter = function (isStart) {
      return function () {
        // var boundaryRange = this.cloneRange();
        // boundaryRange.collapse(isStart);
        // var rect = boundaryRange.getBoundingClientRect();
        const rect = this.getBoundingClientRect();
        return {
          x: rect[isStart ? 'left' : 'right'],
          y: rect[isStart ? 'top' : 'bottom'],
        };
      };
    };
    const rangeProto = api.rangePrototype;
    if (api.features.implementsTextRange && elementSupportsGetBoundingClientRect) {
      rangeProto.getBoundingClientRect = function () {
        // We need a TextRange
        const textRange = WrappedTextRange.rangeToTextRange(this);
        // Work around table problems (table cell bounding rects seem not to count if TextRange spans cells)
        const cells = this.getNodes([1], el => /^t[dh]$/i.test(el.tagName));
        let rect,
          rects = [];
        // Merge rects for each cell selected by the range into overall rect
        if (cells.length > 0) {
          let lastTable = getAncestorElement(this.startContainer, 'table');
          for (var i = 0, cell, tempTextRange, table, subRange; cell = cells[i]; ++i) {
            // Handle non-table sections of the range
            table = getAncestorElement(cell, 'table');
            if (!lastTable || table != lastTable) {
              // There is a section of the range prior to the current table, or lying between tables.
              // Merge in its rect
              subRange = this.cloneRange();
              if (lastTable) {
                subRange.setStartAfter(lastTable);
              }
              subRange.setEndBefore(table);
              rects.push(WrappedTextRange.rangeToTextRange(subRange).getBoundingClientRect());
            }
            if (this.containsNode(cell)) {
              rects.push(cell.getBoundingClientRect());
            } else {
              tempTextRange = textRange.duplicate();
              tempTextRange.moveToElementText(cell);
              if (tempTextRange.compareEndPoints('StartToStart', textRange) == -1) {
                tempTextRange.setEndPoint('StartToStart', textRange);
              } else if (tempTextRange.compareEndPoints('EndToEnd', textRange) == 1) {
                tempTextRange.setEndPoint('EndToEnd', textRange);
              }
              rects.push(tempTextRange.getBoundingClientRect());
            }
            lastTable = table;
          }

          // Merge in the rect for any content lying after the final table
          const endTable = getAncestorElement(this.endContainer, 'table');
          if (!endTable && lastTable) {
            subRange = this.cloneRange();
            subRange.setStartAfter(lastTable);
            rects.push(WrappedTextRange.rangeToTextRange(subRange).getBoundingClientRect());
          }
          rect = mergeRects(rects);
        } else {
          rect = textRange.getBoundingClientRect();
        }

        return adjustClientRect(rect, dom.getDocument(this.startContainer));
      };
    } else if (api.features.implementsDomRange) {
      const createWrappedRange = function (range) {
        return (range instanceof WrappedRange) ? range : new WrappedRange(range);
      };
      if (rangeSupportsGetBoundingClientRect) {
        rangeProto.getBoundingClientRect = function () {
          const nativeRange = createWrappedRange(this).nativeRange;
          // Test for WebKit getBoundingClientRect bug (https://bugs.webkit.org/show_bug.cgi?id=65324)
          const rect = nativeRange.getBoundingClientRect() || nativeRange.getClientRects()[0];
          return adjustClientRect(rect, dom.getDocument(this.startContainer));
        };
        if (rangeSupportsGetClientRects) {
          createClientBoundaryPosGetter = function (isStart) {
            return function () {
              let rect,
                nativeRange = createWrappedRange(this).nativeRange;
              const rects = nativeRange.getClientRects();
              if (rects.length === 0 && elementSupportsGetBoundingClientRect) {
                if (this.collapsed && this.startContainer.nodeType === 1 && this.startOffset < this.startContainer.childNodes.length) {
                  const n = this.startContainer.childNodes[this.startOffset];
                  if (n.getClientRects) {
                    console.log(n, n.getClientRects(), this.startContainer.getClientRects());
                  }
                }
              }
              if (rects.length > 0) {
                if (isStart) {
                  rect = rects[0];
                  return { x: rect.left, y: rect.top };
                }
                rect = rects[rects.length - 1];
                return { x: rect.right, y: rect.bottom };
              }
              throw module.createError(`Cannot get position for range ${this.inspect()}`);
            };
          };
        }
      } else {
        const getElementBoundingClientRect = elementSupportsGetBoundingClientRect ?
          function (el) {
            return adjustClientRect(el.getBoundingClientRect(), dom.getDocument(el));
          } :
        // This implementation is very naive. There are many browser quirks that make it extremely
        // difficult to get accurate element coordinates in all situations
          function (el) {
            let x = 0,
              y = 0,
              offsetEl = el,
              width = el.offsetWidth,
              height = el.offsetHeight;
            while (offsetEl) {
              x += offsetEl.offsetLeft;
              y += offsetEl.offsetTop;
              offsetEl = offsetEl.offsetParent;
            }
            return adjustClientRect(new Rect(y, x + width, y + height, x), dom.getDocument(el));
          };
        const getRectFromBoundaries = function (range) {
          let rect;
          const span = document.createElement('span');
          range.splitBoundaries();
          if (range.collapsed) {
            range.insertNode(span);
            rect = getElementBoundingClientRect(span);
            span.parentNode.removeChild(span);
          } else {
            // TODO: This isn't right. I'm not sure it can be made right sensibly. Consider what to do.
            // This doesn't consider all the line boxes it needs to consider.
            const workingRange = range.cloneRange();
            // Get the start rectangle
            workingRange.collapse(true);
            workingRange.insertNode(span);
            const startRect = getElementBoundingClientRect(span);
            span.parentNode.removeChild(span);

            // Get the end rectangle
            workingRange.collapseToPoint(range.endContainer, range.endOffset);
            workingRange.insertNode(span);
            const endRect = getElementBoundingClientRect(span);
            span.parentNode.removeChild(span);
            // Merge the start and end rects
            const rects = [startRect, endRect];
            // Merge in rectangles for all elements in the range
            const elements = range.getNodes([1], el => range.containsNode(el));

            for (let i = 0, len = elements.length; i < len; ++i) {
              rects.push(getElementBoundingClientRect(elements[i]));
            }
            rect = mergeRects(rects);
          }
          // Clean up
          range.normalizeBoundaries();
          return rect;
        };
        rangeProto.getBoundingClientRect = function (range) {
          return getRectFromBoundaries(createWrappedRange(range));
        };
      }
    }
    function createDocumentBoundaryPosGetter(isStart) {
      return function () {
        const pos = this[`get${isStart ? 'Start' : 'End'}ClientPos`]();
        const scrollPos = getScrollPosition(dom.getWindow(this.startContainer));
        return { x: pos.x + scrollPos.x, y: pos.y + scrollPos.y };
      };
    }

    util.extend(rangeProto, {
      getBoundingDocumentRect() {
        const scrollPos = getScrollPosition(dom.getWindow(this.startContainer));
        return createRelativeRect(this.getBoundingClientRect(), scrollPos.x, scrollPos.y);
      },
      getStartClientPos: createClientBoundaryPosGetter(true),
      getEndClientPos: createClientBoundaryPosGetter(false),
      getStartDocumentPos: createDocumentBoundaryPosGetter(true),
      getEndDocumentPos: createDocumentBoundaryPosGetter(false),
    });

    // Add Selection methods
    function compareRanges(r1, r2) {
      return r1.compareBoundaryPoints(r2.START_TO_START, r2);
    }
    function createSelectionRectGetter(isDocument) {
      return function () {
        const rangeMethodName = `getBounding${isDocument ? 'Document' : 'Client'}Rect`;
        const rects = [];
        for (let i = 0; i < this.rangeCount; ++i) {
          rects.push(this.getRangeAt(i)[rangeMethodName]());
        }
        return mergeRects(rects);
      };
    }

    function createSelectionBoundaryPosGetter(isStart, isDocument) {
      return function () {
        if (this.rangeCount === 0) {
          return null;
        }
        const posType = isDocument ? 'Document' : 'Client';
        const ranges = this.getAllRanges();
        if (ranges.length > 1) {
          // Order the ranges by position within the DOM
          ranges.sort(compareRanges);
        }
        return isStart ?
          ranges[0][`getStart${posType}Pos`]() :
          ranges[ranges.length - 1][`getEnd${posType}Pos`]();
      };
    }

    util.extend(api.selectionPrototype, {
      getBoundingClientRect: createSelectionRectGetter(false),
      getBoundingDocumentRect: createSelectionRectGetter(true),

      getStartClientPos: createSelectionBoundaryPosGetter(true, false),
      getEndClientPos: createSelectionBoundaryPosGetter(false, false),

      getStartDocumentPos: createSelectionBoundaryPosGetter(true, true),
      getEndDocumentPos: createSelectionBoundaryPosGetter(false, true),
    });
    api.positionFromPoint = function (x, y, doc) {
      doc = dom.getContentDocument(doc, module, 'positionFromPoint');
      return createCaretPositionFromPointGetter(doc)(doc, x, y);
    };
    api.createRangeFromPoints = createRangeFromPoints;
    api.moveSelectionToPoints = moveSelectionToPoints;
  });
}

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __commonJS = (callback, module) => () => {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  };
  var __exportStar = (target, module, desc) => {
    __markAsModule(target);
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    if (module && module.__esModule)
      return module;
    return __exportStar(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", {value: module, enumerable: true}), module);
  };

  // node_modules/diff/dist/diff.js
  var require_diff = __commonJS((exports, module) => {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = global || self, factory(global.Diff = {}));
    })(exports, function(exports2) {
      "use strict";
      function Diff() {
      }
      Diff.prototype = {
        diff: function diff2(oldString, newString) {
          var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          var callback = options.callback;
          if (typeof options === "function") {
            callback = options;
            options = {};
          }
          this.options = options;
          var self2 = this;
          function done(value) {
            if (callback) {
              setTimeout(function() {
                callback(void 0, value);
              }, 0);
              return true;
            } else {
              return value;
            }
          }
          oldString = this.castInput(oldString);
          newString = this.castInput(newString);
          oldString = this.removeEmpty(this.tokenize(oldString));
          newString = this.removeEmpty(this.tokenize(newString));
          var newLen = newString.length, oldLen = oldString.length;
          var editLength = 1;
          var maxEditLength = newLen + oldLen;
          var bestPath = [{
            newPos: -1,
            components: []
          }];
          var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
          if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
            return done([{
              value: this.join(newString),
              count: newString.length
            }]);
          }
          function execEditLength() {
            for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
              var basePath = void 0;
              var addPath = bestPath[diagonalPath - 1], removePath = bestPath[diagonalPath + 1], _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
              if (addPath) {
                bestPath[diagonalPath - 1] = void 0;
              }
              var canAdd = addPath && addPath.newPos + 1 < newLen, canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;
              if (!canAdd && !canRemove) {
                bestPath[diagonalPath] = void 0;
                continue;
              }
              if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
                basePath = clonePath(removePath);
                self2.pushComponent(basePath.components, void 0, true);
              } else {
                basePath = addPath;
                basePath.newPos++;
                self2.pushComponent(basePath.components, true, void 0);
              }
              _oldPos = self2.extractCommon(basePath, newString, oldString, diagonalPath);
              if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
                return done(buildValues(self2, basePath.components, newString, oldString, self2.useLongestToken));
              } else {
                bestPath[diagonalPath] = basePath;
              }
            }
            editLength++;
          }
          if (callback) {
            (function exec() {
              setTimeout(function() {
                if (editLength > maxEditLength) {
                  return callback();
                }
                if (!execEditLength()) {
                  exec();
                }
              }, 0);
            })();
          } else {
            while (editLength <= maxEditLength) {
              var ret = execEditLength();
              if (ret) {
                return ret;
              }
            }
          }
        },
        pushComponent: function pushComponent(components, added, removed) {
          var last = components[components.length - 1];
          if (last && last.added === added && last.removed === removed) {
            components[components.length - 1] = {
              count: last.count + 1,
              added,
              removed
            };
          } else {
            components.push({
              count: 1,
              added,
              removed
            });
          }
        },
        extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
          var newLen = newString.length, oldLen = oldString.length, newPos = basePath.newPos, oldPos = newPos - diagonalPath, commonCount = 0;
          while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
            newPos++;
            oldPos++;
            commonCount++;
          }
          if (commonCount) {
            basePath.components.push({
              count: commonCount
            });
          }
          basePath.newPos = newPos;
          return oldPos;
        },
        equals: function equals(left, right) {
          if (this.options.comparator) {
            return this.options.comparator(left, right);
          } else {
            return left === right || this.options.ignoreCase && left.toLowerCase() === right.toLowerCase();
          }
        },
        removeEmpty: function removeEmpty(array) {
          var ret = [];
          for (var i = 0; i < array.length; i++) {
            if (array[i]) {
              ret.push(array[i]);
            }
          }
          return ret;
        },
        castInput: function castInput(value) {
          return value;
        },
        tokenize: function tokenize(value) {
          return value.split("");
        },
        join: function join(chars) {
          return chars.join("");
        }
      };
      function buildValues(diff2, components, newString, oldString, useLongestToken) {
        var componentPos = 0, componentLen = components.length, newPos = 0, oldPos = 0;
        for (; componentPos < componentLen; componentPos++) {
          var component = components[componentPos];
          if (!component.removed) {
            if (!component.added && useLongestToken) {
              var value = newString.slice(newPos, newPos + component.count);
              value = value.map(function(value2, i) {
                var oldValue = oldString[oldPos + i];
                return oldValue.length > value2.length ? oldValue : value2;
              });
              component.value = diff2.join(value);
            } else {
              component.value = diff2.join(newString.slice(newPos, newPos + component.count));
            }
            newPos += component.count;
            if (!component.added) {
              oldPos += component.count;
            }
          } else {
            component.value = diff2.join(oldString.slice(oldPos, oldPos + component.count));
            oldPos += component.count;
            if (componentPos && components[componentPos - 1].added) {
              var tmp = components[componentPos - 1];
              components[componentPos - 1] = components[componentPos];
              components[componentPos] = tmp;
            }
          }
        }
        var lastComponent = components[componentLen - 1];
        if (componentLen > 1 && typeof lastComponent.value === "string" && (lastComponent.added || lastComponent.removed) && diff2.equals("", lastComponent.value)) {
          components[componentLen - 2].value += lastComponent.value;
          components.pop();
        }
        return components;
      }
      function clonePath(path) {
        return {
          newPos: path.newPos,
          components: path.components.slice(0)
        };
      }
      var characterDiff = new Diff();
      function diffChars3(oldStr, newStr, options) {
        return characterDiff.diff(oldStr, newStr, options);
      }
      function generateOptions(options, defaults3) {
        if (typeof options === "function") {
          defaults3.callback = options;
        } else if (options) {
          for (var name2 in options) {
            if (options.hasOwnProperty(name2)) {
              defaults3[name2] = options[name2];
            }
          }
        }
        return defaults3;
      }
      var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
      var reWhitespace = /\S/;
      var wordDiff = new Diff();
      wordDiff.equals = function(left, right) {
        if (this.options.ignoreCase) {
          left = left.toLowerCase();
          right = right.toLowerCase();
        }
        return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
      };
      wordDiff.tokenize = function(value) {
        var tokens = value.split(/([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/);
        for (var i = 0; i < tokens.length - 1; i++) {
          if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
            tokens[i] += tokens[i + 2];
            tokens.splice(i + 1, 2);
            i--;
          }
        }
        return tokens;
      };
      function diffWords3(oldStr, newStr, options) {
        options = generateOptions(options, {
          ignoreWhitespace: true
        });
        return wordDiff.diff(oldStr, newStr, options);
      }
      function diffWordsWithSpace(oldStr, newStr, options) {
        return wordDiff.diff(oldStr, newStr, options);
      }
      var lineDiff = new Diff();
      lineDiff.tokenize = function(value) {
        var retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
        if (!linesAndNewlines[linesAndNewlines.length - 1]) {
          linesAndNewlines.pop();
        }
        for (var i = 0; i < linesAndNewlines.length; i++) {
          var line = linesAndNewlines[i];
          if (i % 2 && !this.options.newlineIsToken) {
            retLines[retLines.length - 1] += line;
          } else {
            if (this.options.ignoreWhitespace) {
              line = line.trim();
            }
            retLines.push(line);
          }
        }
        return retLines;
      };
      function diffLines3(oldStr, newStr, callback) {
        return lineDiff.diff(oldStr, newStr, callback);
      }
      function diffTrimmedLines(oldStr, newStr, callback) {
        var options = generateOptions(callback, {
          ignoreWhitespace: true
        });
        return lineDiff.diff(oldStr, newStr, options);
      }
      var sentenceDiff = new Diff();
      sentenceDiff.tokenize = function(value) {
        return value.split(/(\S.+?[.!?])(?=\s+|$)/);
      };
      function diffSentences(oldStr, newStr, callback) {
        return sentenceDiff.diff(oldStr, newStr, callback);
      }
      var cssDiff = new Diff();
      cssDiff.tokenize = function(value) {
        return value.split(/([{}:;,]|\s+)/);
      };
      function diffCss(oldStr, newStr, callback) {
        return cssDiff.diff(oldStr, newStr, callback);
      }
      function _typeof(obj) {
        "@babel/helpers - typeof";
        if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
          _typeof = function(obj2) {
            return typeof obj2;
          };
        } else {
          _typeof = function(obj2) {
            return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
          };
        }
        return _typeof(obj);
      }
      function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
      }
      function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr))
          return _arrayLikeToArray(arr);
      }
      function _iterableToArray(iter) {
        if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
          return Array.from(iter);
      }
      function _unsupportedIterableToArray(o, minLen) {
        if (!o)
          return;
        if (typeof o === "string")
          return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor)
          n = o.constructor.name;
        if (n === "Map" || n === "Set")
          return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
          return _arrayLikeToArray(o, minLen);
      }
      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length)
          len = arr.length;
        for (var i = 0, arr2 = new Array(len); i < len; i++)
          arr2[i] = arr[i];
        return arr2;
      }
      function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      var objectPrototypeToString = Object.prototype.toString;
      var jsonDiff = new Diff();
      jsonDiff.useLongestToken = true;
      jsonDiff.tokenize = lineDiff.tokenize;
      jsonDiff.castInput = function(value) {
        var _this$options = this.options, undefinedReplacement = _this$options.undefinedReplacement, _this$options$stringi = _this$options.stringifyReplacer, stringifyReplacer = _this$options$stringi === void 0 ? function(k, v) {
          return typeof v === "undefined" ? undefinedReplacement : v;
        } : _this$options$stringi;
        return typeof value === "string" ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, "  ");
      };
      jsonDiff.equals = function(left, right) {
        return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, "$1"), right.replace(/,([\r\n])/g, "$1"));
      };
      function diffJson(oldObj, newObj, options) {
        return jsonDiff.diff(oldObj, newObj, options);
      }
      function canonicalize(obj, stack, replacementStack, replacer, key) {
        stack = stack || [];
        replacementStack = replacementStack || [];
        if (replacer) {
          obj = replacer(key, obj);
        }
        var i;
        for (i = 0; i < stack.length; i += 1) {
          if (stack[i] === obj) {
            return replacementStack[i];
          }
        }
        var canonicalizedObj;
        if (objectPrototypeToString.call(obj) === "[object Array]") {
          stack.push(obj);
          canonicalizedObj = new Array(obj.length);
          replacementStack.push(canonicalizedObj);
          for (i = 0; i < obj.length; i += 1) {
            canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, key);
          }
          stack.pop();
          replacementStack.pop();
          return canonicalizedObj;
        }
        if (obj && obj.toJSON) {
          obj = obj.toJSON();
        }
        if (_typeof(obj) === "object" && obj !== null) {
          stack.push(obj);
          canonicalizedObj = {};
          replacementStack.push(canonicalizedObj);
          var sortedKeys = [], _key;
          for (_key in obj) {
            if (obj.hasOwnProperty(_key)) {
              sortedKeys.push(_key);
            }
          }
          sortedKeys.sort();
          for (i = 0; i < sortedKeys.length; i += 1) {
            _key = sortedKeys[i];
            canonicalizedObj[_key] = canonicalize(obj[_key], stack, replacementStack, replacer, _key);
          }
          stack.pop();
          replacementStack.pop();
        } else {
          canonicalizedObj = obj;
        }
        return canonicalizedObj;
      }
      var arrayDiff = new Diff();
      arrayDiff.tokenize = function(value) {
        return value.slice();
      };
      arrayDiff.join = arrayDiff.removeEmpty = function(value) {
        return value;
      };
      function diffArrays(oldArr, newArr, callback) {
        return arrayDiff.diff(oldArr, newArr, callback);
      }
      function parsePatch(uniDiff) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var diffstr = uniDiff.split(/\r\n|[\n\v\f\r\x85]/), delimiters = uniDiff.match(/\r\n|[\n\v\f\r\x85]/g) || [], list = [], i = 0;
        function parseIndex() {
          var index2 = {};
          list.push(index2);
          while (i < diffstr.length) {
            var line = diffstr[i];
            if (/^(\-\-\-|\+\+\+|@@)\s/.test(line)) {
              break;
            }
            var header = /^(?:Index:|diff(?: -r \w+)+)\s+(.+?)\s*$/.exec(line);
            if (header) {
              index2.index = header[1];
            }
            i++;
          }
          parseFileHeader(index2);
          parseFileHeader(index2);
          index2.hunks = [];
          while (i < diffstr.length) {
            var _line = diffstr[i];
            if (/^(Index:|diff|\-\-\-|\+\+\+)\s/.test(_line)) {
              break;
            } else if (/^@@/.test(_line)) {
              index2.hunks.push(parseHunk());
            } else if (_line && options.strict) {
              throw new Error("Unknown line " + (i + 1) + " " + JSON.stringify(_line));
            } else {
              i++;
            }
          }
        }
        function parseFileHeader(index2) {
          var fileHeader = /^(---|\+\+\+)\s+(.*)$/.exec(diffstr[i]);
          if (fileHeader) {
            var keyPrefix = fileHeader[1] === "---" ? "old" : "new";
            var data = fileHeader[2].split("	", 2);
            var fileName = data[0].replace(/\\\\/g, "\\");
            if (/^".*"$/.test(fileName)) {
              fileName = fileName.substr(1, fileName.length - 2);
            }
            index2[keyPrefix + "FileName"] = fileName;
            index2[keyPrefix + "Header"] = (data[1] || "").trim();
            i++;
          }
        }
        function parseHunk() {
          var chunkHeaderIndex = i, chunkHeaderLine = diffstr[i++], chunkHeader = chunkHeaderLine.split(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
          var hunk = {
            oldStart: +chunkHeader[1],
            oldLines: typeof chunkHeader[2] === "undefined" ? 1 : +chunkHeader[2],
            newStart: +chunkHeader[3],
            newLines: typeof chunkHeader[4] === "undefined" ? 1 : +chunkHeader[4],
            lines: [],
            linedelimiters: []
          };
          if (hunk.oldLines === 0) {
            hunk.oldStart += 1;
          }
          if (hunk.newLines === 0) {
            hunk.newStart += 1;
          }
          var addCount = 0, removeCount = 0;
          for (; i < diffstr.length; i++) {
            if (diffstr[i].indexOf("--- ") === 0 && i + 2 < diffstr.length && diffstr[i + 1].indexOf("+++ ") === 0 && diffstr[i + 2].indexOf("@@") === 0) {
              break;
            }
            var operation = diffstr[i].length == 0 && i != diffstr.length - 1 ? " " : diffstr[i][0];
            if (operation === "+" || operation === "-" || operation === " " || operation === "\\") {
              hunk.lines.push(diffstr[i]);
              hunk.linedelimiters.push(delimiters[i] || "\n");
              if (operation === "+") {
                addCount++;
              } else if (operation === "-") {
                removeCount++;
              } else if (operation === " ") {
                addCount++;
                removeCount++;
              }
            } else {
              break;
            }
          }
          if (!addCount && hunk.newLines === 1) {
            hunk.newLines = 0;
          }
          if (!removeCount && hunk.oldLines === 1) {
            hunk.oldLines = 0;
          }
          if (options.strict) {
            if (addCount !== hunk.newLines) {
              throw new Error("Added line count did not match for hunk at line " + (chunkHeaderIndex + 1));
            }
            if (removeCount !== hunk.oldLines) {
              throw new Error("Removed line count did not match for hunk at line " + (chunkHeaderIndex + 1));
            }
          }
          return hunk;
        }
        while (i < diffstr.length) {
          parseIndex();
        }
        return list;
      }
      function distanceIterator(start, minLine, maxLine) {
        var wantForward = true, backwardExhausted = false, forwardExhausted = false, localOffset = 1;
        return function iterator() {
          if (wantForward && !forwardExhausted) {
            if (backwardExhausted) {
              localOffset++;
            } else {
              wantForward = false;
            }
            if (start + localOffset <= maxLine) {
              return localOffset;
            }
            forwardExhausted = true;
          }
          if (!backwardExhausted) {
            if (!forwardExhausted) {
              wantForward = true;
            }
            if (minLine <= start - localOffset) {
              return -localOffset++;
            }
            backwardExhausted = true;
            return iterator();
          }
        };
      }
      function applyPatch(source, uniDiff) {
        var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        if (typeof uniDiff === "string") {
          uniDiff = parsePatch(uniDiff);
        }
        if (Array.isArray(uniDiff)) {
          if (uniDiff.length > 1) {
            throw new Error("applyPatch only works with a single input.");
          }
          uniDiff = uniDiff[0];
        }
        var lines = source.split(/\r\n|[\n\v\f\r\x85]/), delimiters = source.match(/\r\n|[\n\v\f\r\x85]/g) || [], hunks = uniDiff.hunks, compareLine = options.compareLine || function(lineNumber, line2, operation2, patchContent) {
          return line2 === patchContent;
        }, errorCount = 0, fuzzFactor = options.fuzzFactor || 0, minLine = 0, offset = 0, removeEOFNL, addEOFNL;
        function hunkFits(hunk2, toPos2) {
          for (var j2 = 0; j2 < hunk2.lines.length; j2++) {
            var line2 = hunk2.lines[j2], operation2 = line2.length > 0 ? line2[0] : " ", content3 = line2.length > 0 ? line2.substr(1) : line2;
            if (operation2 === " " || operation2 === "-") {
              if (!compareLine(toPos2 + 1, lines[toPos2], operation2, content3)) {
                errorCount++;
                if (errorCount > fuzzFactor) {
                  return false;
                }
              }
              toPos2++;
            }
          }
          return true;
        }
        for (var i = 0; i < hunks.length; i++) {
          var hunk = hunks[i], maxLine = lines.length - hunk.oldLines, localOffset = 0, toPos = offset + hunk.oldStart - 1;
          var iterator = distanceIterator(toPos, minLine, maxLine);
          for (; localOffset !== void 0; localOffset = iterator()) {
            if (hunkFits(hunk, toPos + localOffset)) {
              hunk.offset = offset += localOffset;
              break;
            }
          }
          if (localOffset === void 0) {
            return false;
          }
          minLine = hunk.offset + hunk.oldStart + hunk.oldLines;
        }
        var diffOffset = 0;
        for (var _i = 0; _i < hunks.length; _i++) {
          var _hunk = hunks[_i], _toPos = _hunk.oldStart + _hunk.offset + diffOffset - 1;
          diffOffset += _hunk.newLines - _hunk.oldLines;
          for (var j = 0; j < _hunk.lines.length; j++) {
            var line = _hunk.lines[j], operation = line.length > 0 ? line[0] : " ", content2 = line.length > 0 ? line.substr(1) : line, delimiter = _hunk.linedelimiters[j];
            if (operation === " ") {
              _toPos++;
            } else if (operation === "-") {
              lines.splice(_toPos, 1);
              delimiters.splice(_toPos, 1);
            } else if (operation === "+") {
              lines.splice(_toPos, 0, content2);
              delimiters.splice(_toPos, 0, delimiter);
              _toPos++;
            } else if (operation === "\\") {
              var previousOperation = _hunk.lines[j - 1] ? _hunk.lines[j - 1][0] : null;
              if (previousOperation === "+") {
                removeEOFNL = true;
              } else if (previousOperation === "-") {
                addEOFNL = true;
              }
            }
          }
        }
        if (removeEOFNL) {
          while (!lines[lines.length - 1]) {
            lines.pop();
            delimiters.pop();
          }
        } else if (addEOFNL) {
          lines.push("");
          delimiters.push("\n");
        }
        for (var _k = 0; _k < lines.length - 1; _k++) {
          lines[_k] = lines[_k] + delimiters[_k];
        }
        return lines.join("");
      }
      function applyPatches(uniDiff, options) {
        if (typeof uniDiff === "string") {
          uniDiff = parsePatch(uniDiff);
        }
        var currentIndex = 0;
        function processIndex() {
          var index2 = uniDiff[currentIndex++];
          if (!index2) {
            return options.complete();
          }
          options.loadFile(index2, function(err, data) {
            if (err) {
              return options.complete(err);
            }
            var updatedContent = applyPatch(data, index2, options);
            options.patched(index2, updatedContent, function(err2) {
              if (err2) {
                return options.complete(err2);
              }
              processIndex();
            });
          });
        }
        processIndex();
      }
      function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
        if (!options) {
          options = {};
        }
        if (typeof options.context === "undefined") {
          options.context = 4;
        }
        var diff2 = diffLines3(oldStr, newStr, options);
        diff2.push({
          value: "",
          lines: []
        });
        function contextLines(lines) {
          return lines.map(function(entry) {
            return " " + entry;
          });
        }
        var hunks = [];
        var oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
        var _loop = function _loop2(i2) {
          var current = diff2[i2], lines = current.lines || current.value.replace(/\n$/, "").split("\n");
          current.lines = lines;
          if (current.added || current.removed) {
            var _curRange;
            if (!oldRangeStart) {
              var prev = diff2[i2 - 1];
              oldRangeStart = oldLine;
              newRangeStart = newLine;
              if (prev) {
                curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
                oldRangeStart -= curRange.length;
                newRangeStart -= curRange.length;
              }
            }
            (_curRange = curRange).push.apply(_curRange, _toConsumableArray(lines.map(function(entry) {
              return (current.added ? "+" : "-") + entry;
            })));
            if (current.added) {
              newLine += lines.length;
            } else {
              oldLine += lines.length;
            }
          } else {
            if (oldRangeStart) {
              if (lines.length <= options.context * 2 && i2 < diff2.length - 2) {
                var _curRange2;
                (_curRange2 = curRange).push.apply(_curRange2, _toConsumableArray(contextLines(lines)));
              } else {
                var _curRange3;
                var contextSize = Math.min(lines.length, options.context);
                (_curRange3 = curRange).push.apply(_curRange3, _toConsumableArray(contextLines(lines.slice(0, contextSize))));
                var hunk = {
                  oldStart: oldRangeStart,
                  oldLines: oldLine - oldRangeStart + contextSize,
                  newStart: newRangeStart,
                  newLines: newLine - newRangeStart + contextSize,
                  lines: curRange
                };
                if (i2 >= diff2.length - 2 && lines.length <= options.context) {
                  var oldEOFNewline = /\n$/.test(oldStr);
                  var newEOFNewline = /\n$/.test(newStr);
                  var noNlBeforeAdds = lines.length == 0 && curRange.length > hunk.oldLines;
                  if (!oldEOFNewline && noNlBeforeAdds && oldStr.length > 0) {
                    curRange.splice(hunk.oldLines, 0, "\\ No newline at end of file");
                  }
                  if (!oldEOFNewline && !noNlBeforeAdds || !newEOFNewline) {
                    curRange.push("\\ No newline at end of file");
                  }
                }
                hunks.push(hunk);
                oldRangeStart = 0;
                newRangeStart = 0;
                curRange = [];
              }
            }
            oldLine += lines.length;
            newLine += lines.length;
          }
        };
        for (var i = 0; i < diff2.length; i++) {
          _loop(i);
        }
        return {
          oldFileName,
          newFileName,
          oldHeader,
          newHeader,
          hunks
        };
      }
      function formatPatch(diff2) {
        var ret = [];
        if (diff2.oldFileName == diff2.newFileName) {
          ret.push("Index: " + diff2.oldFileName);
        }
        ret.push("===================================================================");
        ret.push("--- " + diff2.oldFileName + (typeof diff2.oldHeader === "undefined" ? "" : "	" + diff2.oldHeader));
        ret.push("+++ " + diff2.newFileName + (typeof diff2.newHeader === "undefined" ? "" : "	" + diff2.newHeader));
        for (var i = 0; i < diff2.hunks.length; i++) {
          var hunk = diff2.hunks[i];
          if (hunk.oldLines === 0) {
            hunk.oldStart -= 1;
          }
          if (hunk.newLines === 0) {
            hunk.newStart -= 1;
          }
          ret.push("@@ -" + hunk.oldStart + "," + hunk.oldLines + " +" + hunk.newStart + "," + hunk.newLines + " @@");
          ret.push.apply(ret, hunk.lines);
        }
        return ret.join("\n") + "\n";
      }
      function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
        return formatPatch(structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options));
      }
      function createPatch(fileName, oldStr, newStr, oldHeader, newHeader, options) {
        return createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
      }
      function arrayEqual(a, b) {
        if (a.length !== b.length) {
          return false;
        }
        return arrayStartsWith(a, b);
      }
      function arrayStartsWith(array, start) {
        if (start.length > array.length) {
          return false;
        }
        for (var i = 0; i < start.length; i++) {
          if (start[i] !== array[i]) {
            return false;
          }
        }
        return true;
      }
      function calcLineCount(hunk) {
        var _calcOldNewLineCount = calcOldNewLineCount(hunk.lines), oldLines = _calcOldNewLineCount.oldLines, newLines = _calcOldNewLineCount.newLines;
        if (oldLines !== void 0) {
          hunk.oldLines = oldLines;
        } else {
          delete hunk.oldLines;
        }
        if (newLines !== void 0) {
          hunk.newLines = newLines;
        } else {
          delete hunk.newLines;
        }
      }
      function merge(mine, theirs, base2) {
        mine = loadPatch(mine, base2);
        theirs = loadPatch(theirs, base2);
        var ret = {};
        if (mine.index || theirs.index) {
          ret.index = mine.index || theirs.index;
        }
        if (mine.newFileName || theirs.newFileName) {
          if (!fileNameChanged(mine)) {
            ret.oldFileName = theirs.oldFileName || mine.oldFileName;
            ret.newFileName = theirs.newFileName || mine.newFileName;
            ret.oldHeader = theirs.oldHeader || mine.oldHeader;
            ret.newHeader = theirs.newHeader || mine.newHeader;
          } else if (!fileNameChanged(theirs)) {
            ret.oldFileName = mine.oldFileName;
            ret.newFileName = mine.newFileName;
            ret.oldHeader = mine.oldHeader;
            ret.newHeader = mine.newHeader;
          } else {
            ret.oldFileName = selectField(ret, mine.oldFileName, theirs.oldFileName);
            ret.newFileName = selectField(ret, mine.newFileName, theirs.newFileName);
            ret.oldHeader = selectField(ret, mine.oldHeader, theirs.oldHeader);
            ret.newHeader = selectField(ret, mine.newHeader, theirs.newHeader);
          }
        }
        ret.hunks = [];
        var mineIndex = 0, theirsIndex = 0, mineOffset = 0, theirsOffset = 0;
        while (mineIndex < mine.hunks.length || theirsIndex < theirs.hunks.length) {
          var mineCurrent = mine.hunks[mineIndex] || {
            oldStart: Infinity
          }, theirsCurrent = theirs.hunks[theirsIndex] || {
            oldStart: Infinity
          };
          if (hunkBefore(mineCurrent, theirsCurrent)) {
            ret.hunks.push(cloneHunk(mineCurrent, mineOffset));
            mineIndex++;
            theirsOffset += mineCurrent.newLines - mineCurrent.oldLines;
          } else if (hunkBefore(theirsCurrent, mineCurrent)) {
            ret.hunks.push(cloneHunk(theirsCurrent, theirsOffset));
            theirsIndex++;
            mineOffset += theirsCurrent.newLines - theirsCurrent.oldLines;
          } else {
            var mergedHunk = {
              oldStart: Math.min(mineCurrent.oldStart, theirsCurrent.oldStart),
              oldLines: 0,
              newStart: Math.min(mineCurrent.newStart + mineOffset, theirsCurrent.oldStart + theirsOffset),
              newLines: 0,
              lines: []
            };
            mergeLines(mergedHunk, mineCurrent.oldStart, mineCurrent.lines, theirsCurrent.oldStart, theirsCurrent.lines);
            theirsIndex++;
            mineIndex++;
            ret.hunks.push(mergedHunk);
          }
        }
        return ret;
      }
      function loadPatch(param, base2) {
        if (typeof param === "string") {
          if (/^@@/m.test(param) || /^Index:/m.test(param)) {
            return parsePatch(param)[0];
          }
          if (!base2) {
            throw new Error("Must provide a base reference or pass in a patch");
          }
          return structuredPatch(void 0, void 0, base2, param);
        }
        return param;
      }
      function fileNameChanged(patch) {
        return patch.newFileName && patch.newFileName !== patch.oldFileName;
      }
      function selectField(index2, mine, theirs) {
        if (mine === theirs) {
          return mine;
        } else {
          index2.conflict = true;
          return {
            mine,
            theirs
          };
        }
      }
      function hunkBefore(test, check) {
        return test.oldStart < check.oldStart && test.oldStart + test.oldLines < check.oldStart;
      }
      function cloneHunk(hunk, offset) {
        return {
          oldStart: hunk.oldStart,
          oldLines: hunk.oldLines,
          newStart: hunk.newStart + offset,
          newLines: hunk.newLines,
          lines: hunk.lines
        };
      }
      function mergeLines(hunk, mineOffset, mineLines, theirOffset, theirLines) {
        var mine = {
          offset: mineOffset,
          lines: mineLines,
          index: 0
        }, their = {
          offset: theirOffset,
          lines: theirLines,
          index: 0
        };
        insertLeading(hunk, mine, their);
        insertLeading(hunk, their, mine);
        while (mine.index < mine.lines.length && their.index < their.lines.length) {
          var mineCurrent = mine.lines[mine.index], theirCurrent = their.lines[their.index];
          if ((mineCurrent[0] === "-" || mineCurrent[0] === "+") && (theirCurrent[0] === "-" || theirCurrent[0] === "+")) {
            mutualChange(hunk, mine, their);
          } else if (mineCurrent[0] === "+" && theirCurrent[0] === " ") {
            var _hunk$lines;
            (_hunk$lines = hunk.lines).push.apply(_hunk$lines, _toConsumableArray(collectChange(mine)));
          } else if (theirCurrent[0] === "+" && mineCurrent[0] === " ") {
            var _hunk$lines2;
            (_hunk$lines2 = hunk.lines).push.apply(_hunk$lines2, _toConsumableArray(collectChange(their)));
          } else if (mineCurrent[0] === "-" && theirCurrent[0] === " ") {
            removal(hunk, mine, their);
          } else if (theirCurrent[0] === "-" && mineCurrent[0] === " ") {
            removal(hunk, their, mine, true);
          } else if (mineCurrent === theirCurrent) {
            hunk.lines.push(mineCurrent);
            mine.index++;
            their.index++;
          } else {
            conflict(hunk, collectChange(mine), collectChange(their));
          }
        }
        insertTrailing(hunk, mine);
        insertTrailing(hunk, their);
        calcLineCount(hunk);
      }
      function mutualChange(hunk, mine, their) {
        var myChanges = collectChange(mine), theirChanges = collectChange(their);
        if (allRemoves(myChanges) && allRemoves(theirChanges)) {
          if (arrayStartsWith(myChanges, theirChanges) && skipRemoveSuperset(their, myChanges, myChanges.length - theirChanges.length)) {
            var _hunk$lines3;
            (_hunk$lines3 = hunk.lines).push.apply(_hunk$lines3, _toConsumableArray(myChanges));
            return;
          } else if (arrayStartsWith(theirChanges, myChanges) && skipRemoveSuperset(mine, theirChanges, theirChanges.length - myChanges.length)) {
            var _hunk$lines4;
            (_hunk$lines4 = hunk.lines).push.apply(_hunk$lines4, _toConsumableArray(theirChanges));
            return;
          }
        } else if (arrayEqual(myChanges, theirChanges)) {
          var _hunk$lines5;
          (_hunk$lines5 = hunk.lines).push.apply(_hunk$lines5, _toConsumableArray(myChanges));
          return;
        }
        conflict(hunk, myChanges, theirChanges);
      }
      function removal(hunk, mine, their, swap) {
        var myChanges = collectChange(mine), theirChanges = collectContext(their, myChanges);
        if (theirChanges.merged) {
          var _hunk$lines6;
          (_hunk$lines6 = hunk.lines).push.apply(_hunk$lines6, _toConsumableArray(theirChanges.merged));
        } else {
          conflict(hunk, swap ? theirChanges : myChanges, swap ? myChanges : theirChanges);
        }
      }
      function conflict(hunk, mine, their) {
        hunk.conflict = true;
        hunk.lines.push({
          conflict: true,
          mine,
          theirs: their
        });
      }
      function insertLeading(hunk, insert2, their) {
        while (insert2.offset < their.offset && insert2.index < insert2.lines.length) {
          var line = insert2.lines[insert2.index++];
          hunk.lines.push(line);
          insert2.offset++;
        }
      }
      function insertTrailing(hunk, insert2) {
        while (insert2.index < insert2.lines.length) {
          var line = insert2.lines[insert2.index++];
          hunk.lines.push(line);
        }
      }
      function collectChange(state24) {
        var ret = [], operation = state24.lines[state24.index][0];
        while (state24.index < state24.lines.length) {
          var line = state24.lines[state24.index];
          if (operation === "-" && line[0] === "+") {
            operation = "+";
          }
          if (operation === line[0]) {
            ret.push(line);
            state24.index++;
          } else {
            break;
          }
        }
        return ret;
      }
      function collectContext(state24, matchChanges) {
        var changes = [], merged = [], matchIndex = 0, contextChanges = false, conflicted = false;
        while (matchIndex < matchChanges.length && state24.index < state24.lines.length) {
          var change = state24.lines[state24.index], match = matchChanges[matchIndex];
          if (match[0] === "+") {
            break;
          }
          contextChanges = contextChanges || change[0] !== " ";
          merged.push(match);
          matchIndex++;
          if (change[0] === "+") {
            conflicted = true;
            while (change[0] === "+") {
              changes.push(change);
              change = state24.lines[++state24.index];
            }
          }
          if (match.substr(1) === change.substr(1)) {
            changes.push(change);
            state24.index++;
          } else {
            conflicted = true;
          }
        }
        if ((matchChanges[matchIndex] || "")[0] === "+" && contextChanges) {
          conflicted = true;
        }
        if (conflicted) {
          return changes;
        }
        while (matchIndex < matchChanges.length) {
          merged.push(matchChanges[matchIndex++]);
        }
        return {
          merged,
          changes
        };
      }
      function allRemoves(changes) {
        return changes.reduce(function(prev, change) {
          return prev && change[0] === "-";
        }, true);
      }
      function skipRemoveSuperset(state24, removeChanges, delta) {
        for (var i = 0; i < delta; i++) {
          var changeContent = removeChanges[removeChanges.length - delta + i].substr(1);
          if (state24.lines[state24.index + i] !== " " + changeContent) {
            return false;
          }
        }
        state24.index += delta;
        return true;
      }
      function calcOldNewLineCount(lines) {
        var oldLines = 0;
        var newLines = 0;
        lines.forEach(function(line) {
          if (typeof line !== "string") {
            var myCount = calcOldNewLineCount(line.mine);
            var theirCount = calcOldNewLineCount(line.theirs);
            if (oldLines !== void 0) {
              if (myCount.oldLines === theirCount.oldLines) {
                oldLines += myCount.oldLines;
              } else {
                oldLines = void 0;
              }
            }
            if (newLines !== void 0) {
              if (myCount.newLines === theirCount.newLines) {
                newLines += myCount.newLines;
              } else {
                newLines = void 0;
              }
            }
          } else {
            if (newLines !== void 0 && (line[0] === "+" || line[0] === " ")) {
              newLines++;
            }
            if (oldLines !== void 0 && (line[0] === "-" || line[0] === " ")) {
              oldLines++;
            }
          }
        });
        return {
          oldLines,
          newLines
        };
      }
      function convertChangesToDMP(changes) {
        var ret = [], change, operation;
        for (var i = 0; i < changes.length; i++) {
          change = changes[i];
          if (change.added) {
            operation = 1;
          } else if (change.removed) {
            operation = -1;
          } else {
            operation = 0;
          }
          ret.push([operation, change.value]);
        }
        return ret;
      }
      function convertChangesToXML(changes) {
        var ret = [];
        for (var i = 0; i < changes.length; i++) {
          var change = changes[i];
          if (change.added) {
            ret.push("<ins>");
          } else if (change.removed) {
            ret.push("<del>");
          }
          ret.push(escapeHTML(change.value));
          if (change.added) {
            ret.push("</ins>");
          } else if (change.removed) {
            ret.push("</del>");
          }
        }
        return ret.join("");
      }
      function escapeHTML(s) {
        var n = s;
        n = n.replace(/&/g, "&amp;");
        n = n.replace(/</g, "&lt;");
        n = n.replace(/>/g, "&gt;");
        n = n.replace(/"/g, "&quot;");
        return n;
      }
      exports2.Diff = Diff;
      exports2.applyPatch = applyPatch;
      exports2.applyPatches = applyPatches;
      exports2.canonicalize = canonicalize;
      exports2.convertChangesToDMP = convertChangesToDMP;
      exports2.convertChangesToXML = convertChangesToXML;
      exports2.createPatch = createPatch;
      exports2.createTwoFilesPatch = createTwoFilesPatch;
      exports2.diffArrays = diffArrays;
      exports2.diffChars = diffChars3;
      exports2.diffCss = diffCss;
      exports2.diffJson = diffJson;
      exports2.diffLines = diffLines3;
      exports2.diffSentences = diffSentences;
      exports2.diffTrimmedLines = diffTrimmedLines;
      exports2.diffWords = diffWords3;
      exports2.diffWordsWithSpace = diffWordsWithSpace;
      exports2.merge = merge;
      exports2.parsePatch = parsePatch;
      exports2.structuredPatch = structuredPatch;
      Object.defineProperty(exports2, "__esModule", {value: true});
    });
  });

  // node_modules/diff-match-patch/index.js
  var require_diff_match_patch = __commonJS((exports, module) => {
    var diff_match_patch3 = function() {
      this.Diff_Timeout = 1;
      this.Diff_EditCost = 4;
      this.Match_Threshold = 0.5;
      this.Match_Distance = 1e3;
      this.Patch_DeleteThreshold = 0.5;
      this.Patch_Margin = 4;
      this.Match_MaxBits = 32;
    };
    var DIFF_DELETE = -1;
    var DIFF_INSERT = 1;
    var DIFF_EQUAL = 0;
    diff_match_patch3.Diff = function(op, text9) {
      return [op, text9];
    };
    diff_match_patch3.prototype.diff_main = function(text1, text22, opt_checklines, opt_deadline) {
      if (typeof opt_deadline == "undefined") {
        if (this.Diff_Timeout <= 0) {
          opt_deadline = Number.MAX_VALUE;
        } else {
          opt_deadline = new Date().getTime() + this.Diff_Timeout * 1e3;
        }
      }
      var deadline = opt_deadline;
      if (text1 == null || text22 == null) {
        throw new Error("Null input. (diff_main)");
      }
      if (text1 == text22) {
        if (text1) {
          return [new diff_match_patch3.Diff(DIFF_EQUAL, text1)];
        }
        return [];
      }
      if (typeof opt_checklines == "undefined") {
        opt_checklines = true;
      }
      var checklines = opt_checklines;
      var commonlength = this.diff_commonPrefix(text1, text22);
      var commonprefix = text1.substring(0, commonlength);
      text1 = text1.substring(commonlength);
      text22 = text22.substring(commonlength);
      commonlength = this.diff_commonSuffix(text1, text22);
      var commonsuffix = text1.substring(text1.length - commonlength);
      text1 = text1.substring(0, text1.length - commonlength);
      text22 = text22.substring(0, text22.length - commonlength);
      var diffs = this.diff_compute_(text1, text22, checklines, deadline);
      if (commonprefix) {
        diffs.unshift(new diff_match_patch3.Diff(DIFF_EQUAL, commonprefix));
      }
      if (commonsuffix) {
        diffs.push(new diff_match_patch3.Diff(DIFF_EQUAL, commonsuffix));
      }
      this.diff_cleanupMerge(diffs);
      return diffs;
    };
    diff_match_patch3.prototype.diff_compute_ = function(text1, text22, checklines, deadline) {
      var diffs;
      if (!text1) {
        return [new diff_match_patch3.Diff(DIFF_INSERT, text22)];
      }
      if (!text22) {
        return [new diff_match_patch3.Diff(DIFF_DELETE, text1)];
      }
      var longtext = text1.length > text22.length ? text1 : text22;
      var shorttext = text1.length > text22.length ? text22 : text1;
      var i = longtext.indexOf(shorttext);
      if (i != -1) {
        diffs = [
          new diff_match_patch3.Diff(DIFF_INSERT, longtext.substring(0, i)),
          new diff_match_patch3.Diff(DIFF_EQUAL, shorttext),
          new diff_match_patch3.Diff(DIFF_INSERT, longtext.substring(i + shorttext.length))
        ];
        if (text1.length > text22.length) {
          diffs[0][0] = diffs[2][0] = DIFF_DELETE;
        }
        return diffs;
      }
      if (shorttext.length == 1) {
        return [
          new diff_match_patch3.Diff(DIFF_DELETE, text1),
          new diff_match_patch3.Diff(DIFF_INSERT, text22)
        ];
      }
      var hm = this.diff_halfMatch_(text1, text22);
      if (hm) {
        var text1_a = hm[0];
        var text1_b = hm[1];
        var text2_a = hm[2];
        var text2_b = hm[3];
        var mid_common = hm[4];
        var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
        var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
        return diffs_a.concat([new diff_match_patch3.Diff(DIFF_EQUAL, mid_common)], diffs_b);
      }
      if (checklines && text1.length > 100 && text22.length > 100) {
        return this.diff_lineMode_(text1, text22, deadline);
      }
      return this.diff_bisect_(text1, text22, deadline);
    };
    diff_match_patch3.prototype.diff_lineMode_ = function(text1, text22, deadline) {
      var a = this.diff_linesToChars_(text1, text22);
      text1 = a.chars1;
      text22 = a.chars2;
      var linearray = a.lineArray;
      var diffs = this.diff_main(text1, text22, false, deadline);
      this.diff_charsToLines_(diffs, linearray);
      this.diff_cleanupSemantic(diffs);
      diffs.push(new diff_match_patch3.Diff(DIFF_EQUAL, ""));
      var pointer = 0;
      var count_delete = 0;
      var count_insert = 0;
      var text_delete = "";
      var text_insert = "";
      while (pointer < diffs.length) {
        switch (diffs[pointer][0]) {
          case DIFF_INSERT:
            count_insert++;
            text_insert += diffs[pointer][1];
            break;
          case DIFF_DELETE:
            count_delete++;
            text_delete += diffs[pointer][1];
            break;
          case DIFF_EQUAL:
            if (count_delete >= 1 && count_insert >= 1) {
              diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert);
              pointer = pointer - count_delete - count_insert;
              var subDiff = this.diff_main(text_delete, text_insert, false, deadline);
              for (var j = subDiff.length - 1; j >= 0; j--) {
                diffs.splice(pointer, 0, subDiff[j]);
              }
              pointer = pointer + subDiff.length;
            }
            count_insert = 0;
            count_delete = 0;
            text_delete = "";
            text_insert = "";
            break;
        }
        pointer++;
      }
      diffs.pop();
      return diffs;
    };
    diff_match_patch3.prototype.diff_bisect_ = function(text1, text22, deadline) {
      var text1_length = text1.length;
      var text2_length = text22.length;
      var max_d = Math.ceil((text1_length + text2_length) / 2);
      var v_offset = max_d;
      var v_length = 2 * max_d;
      var v1 = new Array(v_length);
      var v2 = new Array(v_length);
      for (var x = 0; x < v_length; x++) {
        v1[x] = -1;
        v2[x] = -1;
      }
      v1[v_offset + 1] = 0;
      v2[v_offset + 1] = 0;
      var delta = text1_length - text2_length;
      var front = delta % 2 != 0;
      var k1start = 0;
      var k1end = 0;
      var k2start = 0;
      var k2end = 0;
      for (var d = 0; d < max_d; d++) {
        if (new Date().getTime() > deadline) {
          break;
        }
        for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
          var k1_offset = v_offset + k1;
          var x1;
          if (k1 == -d || k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1]) {
            x1 = v1[k1_offset + 1];
          } else {
            x1 = v1[k1_offset - 1] + 1;
          }
          var y1 = x1 - k1;
          while (x1 < text1_length && y1 < text2_length && text1.charAt(x1) == text22.charAt(y1)) {
            x1++;
            y1++;
          }
          v1[k1_offset] = x1;
          if (x1 > text1_length) {
            k1end += 2;
          } else if (y1 > text2_length) {
            k1start += 2;
          } else if (front) {
            var k2_offset = v_offset + delta - k1;
            if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
              var x2 = text1_length - v2[k2_offset];
              if (x1 >= x2) {
                return this.diff_bisectSplit_(text1, text22, x1, y1, deadline);
              }
            }
          }
        }
        for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
          var k2_offset = v_offset + k2;
          var x2;
          if (k2 == -d || k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1]) {
            x2 = v2[k2_offset + 1];
          } else {
            x2 = v2[k2_offset - 1] + 1;
          }
          var y2 = x2 - k2;
          while (x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) == text22.charAt(text2_length - y2 - 1)) {
            x2++;
            y2++;
          }
          v2[k2_offset] = x2;
          if (x2 > text1_length) {
            k2end += 2;
          } else if (y2 > text2_length) {
            k2start += 2;
          } else if (!front) {
            var k1_offset = v_offset + delta - k2;
            if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
              var x1 = v1[k1_offset];
              var y1 = v_offset + x1 - k1_offset;
              x2 = text1_length - x2;
              if (x1 >= x2) {
                return this.diff_bisectSplit_(text1, text22, x1, y1, deadline);
              }
            }
          }
        }
      }
      return [
        new diff_match_patch3.Diff(DIFF_DELETE, text1),
        new diff_match_patch3.Diff(DIFF_INSERT, text22)
      ];
    };
    diff_match_patch3.prototype.diff_bisectSplit_ = function(text1, text22, x, y, deadline) {
      var text1a = text1.substring(0, x);
      var text2a = text22.substring(0, y);
      var text1b = text1.substring(x);
      var text2b = text22.substring(y);
      var diffs = this.diff_main(text1a, text2a, false, deadline);
      var diffsb = this.diff_main(text1b, text2b, false, deadline);
      return diffs.concat(diffsb);
    };
    diff_match_patch3.prototype.diff_linesToChars_ = function(text1, text22) {
      var lineArray = [];
      var lineHash = {};
      lineArray[0] = "";
      function diff_linesToCharsMunge_(text9) {
        var chars = "";
        var lineStart = 0;
        var lineEnd = -1;
        var lineArrayLength = lineArray.length;
        while (lineEnd < text9.length - 1) {
          lineEnd = text9.indexOf("\n", lineStart);
          if (lineEnd == -1) {
            lineEnd = text9.length - 1;
          }
          var line = text9.substring(lineStart, lineEnd + 1);
          if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) : lineHash[line] !== void 0) {
            chars += String.fromCharCode(lineHash[line]);
          } else {
            if (lineArrayLength == maxLines) {
              line = text9.substring(lineStart);
              lineEnd = text9.length;
            }
            chars += String.fromCharCode(lineArrayLength);
            lineHash[line] = lineArrayLength;
            lineArray[lineArrayLength++] = line;
          }
          lineStart = lineEnd + 1;
        }
        return chars;
      }
      var maxLines = 4e4;
      var chars1 = diff_linesToCharsMunge_(text1);
      maxLines = 65535;
      var chars2 = diff_linesToCharsMunge_(text22);
      return {chars1, chars2, lineArray};
    };
    diff_match_patch3.prototype.diff_charsToLines_ = function(diffs, lineArray) {
      for (var i = 0; i < diffs.length; i++) {
        var chars = diffs[i][1];
        var text9 = [];
        for (var j = 0; j < chars.length; j++) {
          text9[j] = lineArray[chars.charCodeAt(j)];
        }
        diffs[i][1] = text9.join("");
      }
    };
    diff_match_patch3.prototype.diff_commonPrefix = function(text1, text22) {
      if (!text1 || !text22 || text1.charAt(0) != text22.charAt(0)) {
        return 0;
      }
      var pointermin = 0;
      var pointermax = Math.min(text1.length, text22.length);
      var pointermid = pointermax;
      var pointerstart = 0;
      while (pointermin < pointermid) {
        if (text1.substring(pointerstart, pointermid) == text22.substring(pointerstart, pointermid)) {
          pointermin = pointermid;
          pointerstart = pointermin;
        } else {
          pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }
      return pointermid;
    };
    diff_match_patch3.prototype.diff_commonSuffix = function(text1, text22) {
      if (!text1 || !text22 || text1.charAt(text1.length - 1) != text22.charAt(text22.length - 1)) {
        return 0;
      }
      var pointermin = 0;
      var pointermax = Math.min(text1.length, text22.length);
      var pointermid = pointermax;
      var pointerend = 0;
      while (pointermin < pointermid) {
        if (text1.substring(text1.length - pointermid, text1.length - pointerend) == text22.substring(text22.length - pointermid, text22.length - pointerend)) {
          pointermin = pointermid;
          pointerend = pointermin;
        } else {
          pointermax = pointermid;
        }
        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
      }
      return pointermid;
    };
    diff_match_patch3.prototype.diff_commonOverlap_ = function(text1, text22) {
      var text1_length = text1.length;
      var text2_length = text22.length;
      if (text1_length == 0 || text2_length == 0) {
        return 0;
      }
      if (text1_length > text2_length) {
        text1 = text1.substring(text1_length - text2_length);
      } else if (text1_length < text2_length) {
        text22 = text22.substring(0, text1_length);
      }
      var text_length = Math.min(text1_length, text2_length);
      if (text1 == text22) {
        return text_length;
      }
      var best = 0;
      var length = 1;
      while (true) {
        var pattern = text1.substring(text_length - length);
        var found = text22.indexOf(pattern);
        if (found == -1) {
          return best;
        }
        length += found;
        if (found == 0 || text1.substring(text_length - length) == text22.substring(0, length)) {
          best = length;
          length++;
        }
      }
    };
    diff_match_patch3.prototype.diff_halfMatch_ = function(text1, text22) {
      if (this.Diff_Timeout <= 0) {
        return null;
      }
      var longtext = text1.length > text22.length ? text1 : text22;
      var shorttext = text1.length > text22.length ? text22 : text1;
      if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
        return null;
      }
      var dmp = this;
      function diff_halfMatchI_(longtext2, shorttext2, i) {
        var seed = longtext2.substring(i, i + Math.floor(longtext2.length / 4));
        var j = -1;
        var best_common = "";
        var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
        while ((j = shorttext2.indexOf(seed, j + 1)) != -1) {
          var prefixLength = dmp.diff_commonPrefix(longtext2.substring(i), shorttext2.substring(j));
          var suffixLength = dmp.diff_commonSuffix(longtext2.substring(0, i), shorttext2.substring(0, j));
          if (best_common.length < suffixLength + prefixLength) {
            best_common = shorttext2.substring(j - suffixLength, j) + shorttext2.substring(j, j + prefixLength);
            best_longtext_a = longtext2.substring(0, i - suffixLength);
            best_longtext_b = longtext2.substring(i + prefixLength);
            best_shorttext_a = shorttext2.substring(0, j - suffixLength);
            best_shorttext_b = shorttext2.substring(j + prefixLength);
          }
        }
        if (best_common.length * 2 >= longtext2.length) {
          return [
            best_longtext_a,
            best_longtext_b,
            best_shorttext_a,
            best_shorttext_b,
            best_common
          ];
        } else {
          return null;
        }
      }
      var hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
      var hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
      var hm;
      if (!hm1 && !hm2) {
        return null;
      } else if (!hm2) {
        hm = hm1;
      } else if (!hm1) {
        hm = hm2;
      } else {
        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
      }
      var text1_a, text1_b, text2_a, text2_b;
      if (text1.length > text22.length) {
        text1_a = hm[0];
        text1_b = hm[1];
        text2_a = hm[2];
        text2_b = hm[3];
      } else {
        text2_a = hm[0];
        text2_b = hm[1];
        text1_a = hm[2];
        text1_b = hm[3];
      }
      var mid_common = hm[4];
      return [text1_a, text1_b, text2_a, text2_b, mid_common];
    };
    diff_match_patch3.prototype.diff_cleanupSemantic = function(diffs) {
      var changes = false;
      var equalities = [];
      var equalitiesLength = 0;
      var lastEquality = null;
      var pointer = 0;
      var length_insertions1 = 0;
      var length_deletions1 = 0;
      var length_insertions2 = 0;
      var length_deletions2 = 0;
      while (pointer < diffs.length) {
        if (diffs[pointer][0] == DIFF_EQUAL) {
          equalities[equalitiesLength++] = pointer;
          length_insertions1 = length_insertions2;
          length_deletions1 = length_deletions2;
          length_insertions2 = 0;
          length_deletions2 = 0;
          lastEquality = diffs[pointer][1];
        } else {
          if (diffs[pointer][0] == DIFF_INSERT) {
            length_insertions2 += diffs[pointer][1].length;
          } else {
            length_deletions2 += diffs[pointer][1].length;
          }
          if (lastEquality && lastEquality.length <= Math.max(length_insertions1, length_deletions1) && lastEquality.length <= Math.max(length_insertions2, length_deletions2)) {
            diffs.splice(equalities[equalitiesLength - 1], 0, new diff_match_patch3.Diff(DIFF_DELETE, lastEquality));
            diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
            equalitiesLength--;
            equalitiesLength--;
            pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
            length_insertions1 = 0;
            length_deletions1 = 0;
            length_insertions2 = 0;
            length_deletions2 = 0;
            lastEquality = null;
            changes = true;
          }
        }
        pointer++;
      }
      if (changes) {
        this.diff_cleanupMerge(diffs);
      }
      this.diff_cleanupSemanticLossless(diffs);
      pointer = 1;
      while (pointer < diffs.length) {
        if (diffs[pointer - 1][0] == DIFF_DELETE && diffs[pointer][0] == DIFF_INSERT) {
          var deletion = diffs[pointer - 1][1];
          var insertion = diffs[pointer][1];
          var overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
          var overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
          if (overlap_length1 >= overlap_length2) {
            if (overlap_length1 >= deletion.length / 2 || overlap_length1 >= insertion.length / 2) {
              diffs.splice(pointer, 0, new diff_match_patch3.Diff(DIFF_EQUAL, insertion.substring(0, overlap_length1)));
              diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlap_length1);
              diffs[pointer + 1][1] = insertion.substring(overlap_length1);
              pointer++;
            }
          } else {
            if (overlap_length2 >= deletion.length / 2 || overlap_length2 >= insertion.length / 2) {
              diffs.splice(pointer, 0, new diff_match_patch3.Diff(DIFF_EQUAL, deletion.substring(0, overlap_length2)));
              diffs[pointer - 1][0] = DIFF_INSERT;
              diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlap_length2);
              diffs[pointer + 1][0] = DIFF_DELETE;
              diffs[pointer + 1][1] = deletion.substring(overlap_length2);
              pointer++;
            }
          }
          pointer++;
        }
        pointer++;
      }
    };
    diff_match_patch3.prototype.diff_cleanupSemanticLossless = function(diffs) {
      function diff_cleanupSemanticScore_(one, two) {
        if (!one || !two) {
          return 6;
        }
        var char1 = one.charAt(one.length - 1);
        var char2 = two.charAt(0);
        var nonAlphaNumeric1 = char1.match(diff_match_patch3.nonAlphaNumericRegex_);
        var nonAlphaNumeric2 = char2.match(diff_match_patch3.nonAlphaNumericRegex_);
        var whitespace1 = nonAlphaNumeric1 && char1.match(diff_match_patch3.whitespaceRegex_);
        var whitespace2 = nonAlphaNumeric2 && char2.match(diff_match_patch3.whitespaceRegex_);
        var lineBreak1 = whitespace1 && char1.match(diff_match_patch3.linebreakRegex_);
        var lineBreak2 = whitespace2 && char2.match(diff_match_patch3.linebreakRegex_);
        var blankLine1 = lineBreak1 && one.match(diff_match_patch3.blanklineEndRegex_);
        var blankLine2 = lineBreak2 && two.match(diff_match_patch3.blanklineStartRegex_);
        if (blankLine1 || blankLine2) {
          return 5;
        } else if (lineBreak1 || lineBreak2) {
          return 4;
        } else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
          return 3;
        } else if (whitespace1 || whitespace2) {
          return 2;
        } else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
          return 1;
        }
        return 0;
      }
      var pointer = 1;
      while (pointer < diffs.length - 1) {
        if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
          var equality1 = diffs[pointer - 1][1];
          var edit = diffs[pointer][1];
          var equality2 = diffs[pointer + 1][1];
          var commonOffset = this.diff_commonSuffix(equality1, edit);
          if (commonOffset) {
            var commonString = edit.substring(edit.length - commonOffset);
            equality1 = equality1.substring(0, equality1.length - commonOffset);
            edit = commonString + edit.substring(0, edit.length - commonOffset);
            equality2 = commonString + equality2;
          }
          var bestEquality1 = equality1;
          var bestEdit = edit;
          var bestEquality2 = equality2;
          var bestScore = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
          while (edit.charAt(0) === equality2.charAt(0)) {
            equality1 += edit.charAt(0);
            edit = edit.substring(1) + equality2.charAt(0);
            equality2 = equality2.substring(1);
            var score = diff_cleanupSemanticScore_(equality1, edit) + diff_cleanupSemanticScore_(edit, equality2);
            if (score >= bestScore) {
              bestScore = score;
              bestEquality1 = equality1;
              bestEdit = edit;
              bestEquality2 = equality2;
            }
          }
          if (diffs[pointer - 1][1] != bestEquality1) {
            if (bestEquality1) {
              diffs[pointer - 1][1] = bestEquality1;
            } else {
              diffs.splice(pointer - 1, 1);
              pointer--;
            }
            diffs[pointer][1] = bestEdit;
            if (bestEquality2) {
              diffs[pointer + 1][1] = bestEquality2;
            } else {
              diffs.splice(pointer + 1, 1);
              pointer--;
            }
          }
        }
        pointer++;
      }
    };
    diff_match_patch3.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
    diff_match_patch3.whitespaceRegex_ = /\s/;
    diff_match_patch3.linebreakRegex_ = /[\r\n]/;
    diff_match_patch3.blanklineEndRegex_ = /\n\r?\n$/;
    diff_match_patch3.blanklineStartRegex_ = /^\r?\n\r?\n/;
    diff_match_patch3.prototype.diff_cleanupEfficiency = function(diffs) {
      var changes = false;
      var equalities = [];
      var equalitiesLength = 0;
      var lastEquality = null;
      var pointer = 0;
      var pre_ins = false;
      var pre_del = false;
      var post_ins = false;
      var post_del = false;
      while (pointer < diffs.length) {
        if (diffs[pointer][0] == DIFF_EQUAL) {
          if (diffs[pointer][1].length < this.Diff_EditCost && (post_ins || post_del)) {
            equalities[equalitiesLength++] = pointer;
            pre_ins = post_ins;
            pre_del = post_del;
            lastEquality = diffs[pointer][1];
          } else {
            equalitiesLength = 0;
            lastEquality = null;
          }
          post_ins = post_del = false;
        } else {
          if (diffs[pointer][0] == DIFF_DELETE) {
            post_del = true;
          } else {
            post_ins = true;
          }
          if (lastEquality && (pre_ins && pre_del && post_ins && post_del || lastEquality.length < this.Diff_EditCost / 2 && pre_ins + pre_del + post_ins + post_del == 3)) {
            diffs.splice(equalities[equalitiesLength - 1], 0, new diff_match_patch3.Diff(DIFF_DELETE, lastEquality));
            diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
            equalitiesLength--;
            lastEquality = null;
            if (pre_ins && pre_del) {
              post_ins = post_del = true;
              equalitiesLength = 0;
            } else {
              equalitiesLength--;
              pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
              post_ins = post_del = false;
            }
            changes = true;
          }
        }
        pointer++;
      }
      if (changes) {
        this.diff_cleanupMerge(diffs);
      }
    };
    diff_match_patch3.prototype.diff_cleanupMerge = function(diffs) {
      diffs.push(new diff_match_patch3.Diff(DIFF_EQUAL, ""));
      var pointer = 0;
      var count_delete = 0;
      var count_insert = 0;
      var text_delete = "";
      var text_insert = "";
      var commonlength;
      while (pointer < diffs.length) {
        switch (diffs[pointer][0]) {
          case DIFF_INSERT:
            count_insert++;
            text_insert += diffs[pointer][1];
            pointer++;
            break;
          case DIFF_DELETE:
            count_delete++;
            text_delete += diffs[pointer][1];
            pointer++;
            break;
          case DIFF_EQUAL:
            if (count_delete + count_insert > 1) {
              if (count_delete !== 0 && count_insert !== 0) {
                commonlength = this.diff_commonPrefix(text_insert, text_delete);
                if (commonlength !== 0) {
                  if (pointer - count_delete - count_insert > 0 && diffs[pointer - count_delete - count_insert - 1][0] == DIFF_EQUAL) {
                    diffs[pointer - count_delete - count_insert - 1][1] += text_insert.substring(0, commonlength);
                  } else {
                    diffs.splice(0, 0, new diff_match_patch3.Diff(DIFF_EQUAL, text_insert.substring(0, commonlength)));
                    pointer++;
                  }
                  text_insert = text_insert.substring(commonlength);
                  text_delete = text_delete.substring(commonlength);
                }
                commonlength = this.diff_commonSuffix(text_insert, text_delete);
                if (commonlength !== 0) {
                  diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
                  text_insert = text_insert.substring(0, text_insert.length - commonlength);
                  text_delete = text_delete.substring(0, text_delete.length - commonlength);
                }
              }
              pointer -= count_delete + count_insert;
              diffs.splice(pointer, count_delete + count_insert);
              if (text_delete.length) {
                diffs.splice(pointer, 0, new diff_match_patch3.Diff(DIFF_DELETE, text_delete));
                pointer++;
              }
              if (text_insert.length) {
                diffs.splice(pointer, 0, new diff_match_patch3.Diff(DIFF_INSERT, text_insert));
                pointer++;
              }
              pointer++;
            } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
              diffs[pointer - 1][1] += diffs[pointer][1];
              diffs.splice(pointer, 1);
            } else {
              pointer++;
            }
            count_insert = 0;
            count_delete = 0;
            text_delete = "";
            text_insert = "";
            break;
        }
      }
      if (diffs[diffs.length - 1][1] === "") {
        diffs.pop();
      }
      var changes = false;
      pointer = 1;
      while (pointer < diffs.length - 1) {
        if (diffs[pointer - 1][0] == DIFF_EQUAL && diffs[pointer + 1][0] == DIFF_EQUAL) {
          if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
            diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
            diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
            diffs.splice(pointer - 1, 1);
            changes = true;
          } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1]) {
            diffs[pointer - 1][1] += diffs[pointer + 1][1];
            diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
            diffs.splice(pointer + 1, 1);
            changes = true;
          }
        }
        pointer++;
      }
      if (changes) {
        this.diff_cleanupMerge(diffs);
      }
    };
    diff_match_patch3.prototype.diff_xIndex = function(diffs, loc) {
      var chars1 = 0;
      var chars2 = 0;
      var last_chars1 = 0;
      var last_chars2 = 0;
      var x;
      for (x = 0; x < diffs.length; x++) {
        if (diffs[x][0] !== DIFF_INSERT) {
          chars1 += diffs[x][1].length;
        }
        if (diffs[x][0] !== DIFF_DELETE) {
          chars2 += diffs[x][1].length;
        }
        if (chars1 > loc) {
          break;
        }
        last_chars1 = chars1;
        last_chars2 = chars2;
      }
      if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
        return last_chars2;
      }
      return last_chars2 + (loc - last_chars1);
    };
    diff_match_patch3.prototype.diff_prettyHtml = function(diffs) {
      var html2 = [];
      var pattern_amp = /&/g;
      var pattern_lt = /</g;
      var pattern_gt = />/g;
      var pattern_para = /\n/g;
      for (var x = 0; x < diffs.length; x++) {
        var op = diffs[x][0];
        var data = diffs[x][1];
        var text9 = data.replace(pattern_amp, "&amp;").replace(pattern_lt, "&lt;").replace(pattern_gt, "&gt;").replace(pattern_para, "&para;<br>");
        switch (op) {
          case DIFF_INSERT:
            html2[x] = '<ins style="background:#e6ffe6;">' + text9 + "</ins>";
            break;
          case DIFF_DELETE:
            html2[x] = '<del style="background:#ffe6e6;">' + text9 + "</del>";
            break;
          case DIFF_EQUAL:
            html2[x] = "<span>" + text9 + "</span>";
            break;
        }
      }
      return html2.join("");
    };
    diff_match_patch3.prototype.diff_text1 = function(diffs) {
      var text9 = [];
      for (var x = 0; x < diffs.length; x++) {
        if (diffs[x][0] !== DIFF_INSERT) {
          text9[x] = diffs[x][1];
        }
      }
      return text9.join("");
    };
    diff_match_patch3.prototype.diff_text2 = function(diffs) {
      var text9 = [];
      for (var x = 0; x < diffs.length; x++) {
        if (diffs[x][0] !== DIFF_DELETE) {
          text9[x] = diffs[x][1];
        }
      }
      return text9.join("");
    };
    diff_match_patch3.prototype.diff_levenshtein = function(diffs) {
      var levenshtein = 0;
      var insertions = 0;
      var deletions = 0;
      for (var x = 0; x < diffs.length; x++) {
        var op = diffs[x][0];
        var data = diffs[x][1];
        switch (op) {
          case DIFF_INSERT:
            insertions += data.length;
            break;
          case DIFF_DELETE:
            deletions += data.length;
            break;
          case DIFF_EQUAL:
            levenshtein += Math.max(insertions, deletions);
            insertions = 0;
            deletions = 0;
            break;
        }
      }
      levenshtein += Math.max(insertions, deletions);
      return levenshtein;
    };
    diff_match_patch3.prototype.diff_toDelta = function(diffs) {
      var text9 = [];
      for (var x = 0; x < diffs.length; x++) {
        switch (diffs[x][0]) {
          case DIFF_INSERT:
            text9[x] = "+" + encodeURI(diffs[x][1]);
            break;
          case DIFF_DELETE:
            text9[x] = "-" + diffs[x][1].length;
            break;
          case DIFF_EQUAL:
            text9[x] = "=" + diffs[x][1].length;
            break;
        }
      }
      return text9.join("	").replace(/%20/g, " ");
    };
    diff_match_patch3.prototype.diff_fromDelta = function(text1, delta) {
      var diffs = [];
      var diffsLength = 0;
      var pointer = 0;
      var tokens = delta.split(/\t/g);
      for (var x = 0; x < tokens.length; x++) {
        var param = tokens[x].substring(1);
        switch (tokens[x].charAt(0)) {
          case "+":
            try {
              diffs[diffsLength++] = new diff_match_patch3.Diff(DIFF_INSERT, decodeURI(param));
            } catch (ex) {
              throw new Error("Illegal escape in diff_fromDelta: " + param);
            }
            break;
          case "-":
          case "=":
            var n = parseInt(param, 10);
            if (isNaN(n) || n < 0) {
              throw new Error("Invalid number in diff_fromDelta: " + param);
            }
            var text9 = text1.substring(pointer, pointer += n);
            if (tokens[x].charAt(0) == "=") {
              diffs[diffsLength++] = new diff_match_patch3.Diff(DIFF_EQUAL, text9);
            } else {
              diffs[diffsLength++] = new diff_match_patch3.Diff(DIFF_DELETE, text9);
            }
            break;
          default:
            if (tokens[x]) {
              throw new Error("Invalid diff operation in diff_fromDelta: " + tokens[x]);
            }
        }
      }
      if (pointer != text1.length) {
        throw new Error("Delta length (" + pointer + ") does not equal source text length (" + text1.length + ").");
      }
      return diffs;
    };
    diff_match_patch3.prototype.match_main = function(text9, pattern, loc) {
      if (text9 == null || pattern == null || loc == null) {
        throw new Error("Null input. (match_main)");
      }
      loc = Math.max(0, Math.min(loc, text9.length));
      if (text9 == pattern) {
        return 0;
      } else if (!text9.length) {
        return -1;
      } else if (text9.substring(loc, loc + pattern.length) == pattern) {
        return loc;
      } else {
        return this.match_bitap_(text9, pattern, loc);
      }
    };
    diff_match_patch3.prototype.match_bitap_ = function(text9, pattern, loc) {
      if (pattern.length > this.Match_MaxBits) {
        throw new Error("Pattern too long for this browser.");
      }
      var s = this.match_alphabet_(pattern);
      var dmp = this;
      function match_bitapScore_(e, x) {
        var accuracy = e / pattern.length;
        var proximity = Math.abs(loc - x);
        if (!dmp.Match_Distance) {
          return proximity ? 1 : accuracy;
        }
        return accuracy + proximity / dmp.Match_Distance;
      }
      var score_threshold = this.Match_Threshold;
      var best_loc = text9.indexOf(pattern, loc);
      if (best_loc != -1) {
        score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
        best_loc = text9.lastIndexOf(pattern, loc + pattern.length);
        if (best_loc != -1) {
          score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
        }
      }
      var matchmask = 1 << pattern.length - 1;
      best_loc = -1;
      var bin_min, bin_mid;
      var bin_max = pattern.length + text9.length;
      var last_rd;
      for (var d = 0; d < pattern.length; d++) {
        bin_min = 0;
        bin_mid = bin_max;
        while (bin_min < bin_mid) {
          if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
            bin_min = bin_mid;
          } else {
            bin_max = bin_mid;
          }
          bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
        }
        bin_max = bin_mid;
        var start = Math.max(1, loc - bin_mid + 1);
        var finish = Math.min(loc + bin_mid, text9.length) + pattern.length;
        var rd = Array(finish + 2);
        rd[finish + 1] = (1 << d) - 1;
        for (var j = finish; j >= start; j--) {
          var charMatch = s[text9.charAt(j - 1)];
          if (d === 0) {
            rd[j] = (rd[j + 1] << 1 | 1) & charMatch;
          } else {
            rd[j] = (rd[j + 1] << 1 | 1) & charMatch | ((last_rd[j + 1] | last_rd[j]) << 1 | 1) | last_rd[j + 1];
          }
          if (rd[j] & matchmask) {
            var score = match_bitapScore_(d, j - 1);
            if (score <= score_threshold) {
              score_threshold = score;
              best_loc = j - 1;
              if (best_loc > loc) {
                start = Math.max(1, 2 * loc - best_loc);
              } else {
                break;
              }
            }
          }
        }
        if (match_bitapScore_(d + 1, loc) > score_threshold) {
          break;
        }
        last_rd = rd;
      }
      return best_loc;
    };
    diff_match_patch3.prototype.match_alphabet_ = function(pattern) {
      var s = {};
      for (var i = 0; i < pattern.length; i++) {
        s[pattern.charAt(i)] = 0;
      }
      for (var i = 0; i < pattern.length; i++) {
        s[pattern.charAt(i)] |= 1 << pattern.length - i - 1;
      }
      return s;
    };
    diff_match_patch3.prototype.patch_addContext_ = function(patch, text9) {
      if (text9.length == 0) {
        return;
      }
      if (patch.start2 === null) {
        throw Error("patch not initialized");
      }
      var pattern = text9.substring(patch.start2, patch.start2 + patch.length1);
      var padding = 0;
      while (text9.indexOf(pattern) != text9.lastIndexOf(pattern) && pattern.length < this.Match_MaxBits - this.Patch_Margin - this.Patch_Margin) {
        padding += this.Patch_Margin;
        pattern = text9.substring(patch.start2 - padding, patch.start2 + patch.length1 + padding);
      }
      padding += this.Patch_Margin;
      var prefix = text9.substring(patch.start2 - padding, patch.start2);
      if (prefix) {
        patch.diffs.unshift(new diff_match_patch3.Diff(DIFF_EQUAL, prefix));
      }
      var suffix = text9.substring(patch.start2 + patch.length1, patch.start2 + patch.length1 + padding);
      if (suffix) {
        patch.diffs.push(new diff_match_patch3.Diff(DIFF_EQUAL, suffix));
      }
      patch.start1 -= prefix.length;
      patch.start2 -= prefix.length;
      patch.length1 += prefix.length + suffix.length;
      patch.length2 += prefix.length + suffix.length;
    };
    diff_match_patch3.prototype.patch_make = function(a, opt_b, opt_c) {
      var text1, diffs;
      if (typeof a == "string" && typeof opt_b == "string" && typeof opt_c == "undefined") {
        text1 = a;
        diffs = this.diff_main(text1, opt_b, true);
        if (diffs.length > 2) {
          this.diff_cleanupSemantic(diffs);
          this.diff_cleanupEfficiency(diffs);
        }
      } else if (a && typeof a == "object" && typeof opt_b == "undefined" && typeof opt_c == "undefined") {
        diffs = a;
        text1 = this.diff_text1(diffs);
      } else if (typeof a == "string" && opt_b && typeof opt_b == "object" && typeof opt_c == "undefined") {
        text1 = a;
        diffs = opt_b;
      } else if (typeof a == "string" && typeof opt_b == "string" && opt_c && typeof opt_c == "object") {
        text1 = a;
        diffs = opt_c;
      } else {
        throw new Error("Unknown call format to patch_make.");
      }
      if (diffs.length === 0) {
        return [];
      }
      var patches = [];
      var patch = new diff_match_patch3.patch_obj();
      var patchDiffLength = 0;
      var char_count1 = 0;
      var char_count2 = 0;
      var prepatch_text = text1;
      var postpatch_text = text1;
      for (var x = 0; x < diffs.length; x++) {
        var diff_type = diffs[x][0];
        var diff_text = diffs[x][1];
        if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
          patch.start1 = char_count1;
          patch.start2 = char_count2;
        }
        switch (diff_type) {
          case DIFF_INSERT:
            patch.diffs[patchDiffLength++] = diffs[x];
            patch.length2 += diff_text.length;
            postpatch_text = postpatch_text.substring(0, char_count2) + diff_text + postpatch_text.substring(char_count2);
            break;
          case DIFF_DELETE:
            patch.length1 += diff_text.length;
            patch.diffs[patchDiffLength++] = diffs[x];
            postpatch_text = postpatch_text.substring(0, char_count2) + postpatch_text.substring(char_count2 + diff_text.length);
            break;
          case DIFF_EQUAL:
            if (diff_text.length <= 2 * this.Patch_Margin && patchDiffLength && diffs.length != x + 1) {
              patch.diffs[patchDiffLength++] = diffs[x];
              patch.length1 += diff_text.length;
              patch.length2 += diff_text.length;
            } else if (diff_text.length >= 2 * this.Patch_Margin) {
              if (patchDiffLength) {
                this.patch_addContext_(patch, prepatch_text);
                patches.push(patch);
                patch = new diff_match_patch3.patch_obj();
                patchDiffLength = 0;
                prepatch_text = postpatch_text;
                char_count1 = char_count2;
              }
            }
            break;
        }
        if (diff_type !== DIFF_INSERT) {
          char_count1 += diff_text.length;
        }
        if (diff_type !== DIFF_DELETE) {
          char_count2 += diff_text.length;
        }
      }
      if (patchDiffLength) {
        this.patch_addContext_(patch, prepatch_text);
        patches.push(patch);
      }
      return patches;
    };
    diff_match_patch3.prototype.patch_deepCopy = function(patches) {
      var patchesCopy = [];
      for (var x = 0; x < patches.length; x++) {
        var patch = patches[x];
        var patchCopy = new diff_match_patch3.patch_obj();
        patchCopy.diffs = [];
        for (var y = 0; y < patch.diffs.length; y++) {
          patchCopy.diffs[y] = new diff_match_patch3.Diff(patch.diffs[y][0], patch.diffs[y][1]);
        }
        patchCopy.start1 = patch.start1;
        patchCopy.start2 = patch.start2;
        patchCopy.length1 = patch.length1;
        patchCopy.length2 = patch.length2;
        patchesCopy[x] = patchCopy;
      }
      return patchesCopy;
    };
    diff_match_patch3.prototype.patch_apply = function(patches, text9) {
      if (patches.length == 0) {
        return [text9, []];
      }
      patches = this.patch_deepCopy(patches);
      var nullPadding = this.patch_addPadding(patches);
      text9 = nullPadding + text9 + nullPadding;
      this.patch_splitMax(patches);
      var delta = 0;
      var results = [];
      for (var x = 0; x < patches.length; x++) {
        var expected_loc = patches[x].start2 + delta;
        var text1 = this.diff_text1(patches[x].diffs);
        var start_loc;
        var end_loc = -1;
        if (text1.length > this.Match_MaxBits) {
          start_loc = this.match_main(text9, text1.substring(0, this.Match_MaxBits), expected_loc);
          if (start_loc != -1) {
            end_loc = this.match_main(text9, text1.substring(text1.length - this.Match_MaxBits), expected_loc + text1.length - this.Match_MaxBits);
            if (end_loc == -1 || start_loc >= end_loc) {
              start_loc = -1;
            }
          }
        } else {
          start_loc = this.match_main(text9, text1, expected_loc);
        }
        if (start_loc == -1) {
          results[x] = false;
          delta -= patches[x].length2 - patches[x].length1;
        } else {
          results[x] = true;
          delta = start_loc - expected_loc;
          var text22;
          if (end_loc == -1) {
            text22 = text9.substring(start_loc, start_loc + text1.length);
          } else {
            text22 = text9.substring(start_loc, end_loc + this.Match_MaxBits);
          }
          if (text1 == text22) {
            text9 = text9.substring(0, start_loc) + this.diff_text2(patches[x].diffs) + text9.substring(start_loc + text1.length);
          } else {
            var diffs = this.diff_main(text1, text22, false);
            if (text1.length > this.Match_MaxBits && this.diff_levenshtein(diffs) / text1.length > this.Patch_DeleteThreshold) {
              results[x] = false;
            } else {
              this.diff_cleanupSemanticLossless(diffs);
              var index1 = 0;
              var index2;
              for (var y = 0; y < patches[x].diffs.length; y++) {
                var mod = patches[x].diffs[y];
                if (mod[0] !== DIFF_EQUAL) {
                  index2 = this.diff_xIndex(diffs, index1);
                }
                if (mod[0] === DIFF_INSERT) {
                  text9 = text9.substring(0, start_loc + index2) + mod[1] + text9.substring(start_loc + index2);
                } else if (mod[0] === DIFF_DELETE) {
                  text9 = text9.substring(0, start_loc + index2) + text9.substring(start_loc + this.diff_xIndex(diffs, index1 + mod[1].length));
                }
                if (mod[0] !== DIFF_DELETE) {
                  index1 += mod[1].length;
                }
              }
            }
          }
        }
      }
      text9 = text9.substring(nullPadding.length, text9.length - nullPadding.length);
      return [text9, results];
    };
    diff_match_patch3.prototype.patch_addPadding = function(patches) {
      var paddingLength = this.Patch_Margin;
      var nullPadding = "";
      for (var x = 1; x <= paddingLength; x++) {
        nullPadding += String.fromCharCode(x);
      }
      for (var x = 0; x < patches.length; x++) {
        patches[x].start1 += paddingLength;
        patches[x].start2 += paddingLength;
      }
      var patch = patches[0];
      var diffs = patch.diffs;
      if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
        diffs.unshift(new diff_match_patch3.Diff(DIFF_EQUAL, nullPadding));
        patch.start1 -= paddingLength;
        patch.start2 -= paddingLength;
        patch.length1 += paddingLength;
        patch.length2 += paddingLength;
      } else if (paddingLength > diffs[0][1].length) {
        var extraLength = paddingLength - diffs[0][1].length;
        diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
        patch.start1 -= extraLength;
        patch.start2 -= extraLength;
        patch.length1 += extraLength;
        patch.length2 += extraLength;
      }
      patch = patches[patches.length - 1];
      diffs = patch.diffs;
      if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
        diffs.push(new diff_match_patch3.Diff(DIFF_EQUAL, nullPadding));
        patch.length1 += paddingLength;
        patch.length2 += paddingLength;
      } else if (paddingLength > diffs[diffs.length - 1][1].length) {
        var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
        diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
        patch.length1 += extraLength;
        patch.length2 += extraLength;
      }
      return nullPadding;
    };
    diff_match_patch3.prototype.patch_splitMax = function(patches) {
      var patch_size = this.Match_MaxBits;
      for (var x = 0; x < patches.length; x++) {
        if (patches[x].length1 <= patch_size) {
          continue;
        }
        var bigpatch = patches[x];
        patches.splice(x--, 1);
        var start1 = bigpatch.start1;
        var start2 = bigpatch.start2;
        var precontext = "";
        while (bigpatch.diffs.length !== 0) {
          var patch = new diff_match_patch3.patch_obj();
          var empty = true;
          patch.start1 = start1 - precontext.length;
          patch.start2 = start2 - precontext.length;
          if (precontext !== "") {
            patch.length1 = patch.length2 = precontext.length;
            patch.diffs.push(new diff_match_patch3.Diff(DIFF_EQUAL, precontext));
          }
          while (bigpatch.diffs.length !== 0 && patch.length1 < patch_size - this.Patch_Margin) {
            var diff_type = bigpatch.diffs[0][0];
            var diff_text = bigpatch.diffs[0][1];
            if (diff_type === DIFF_INSERT) {
              patch.length2 += diff_text.length;
              start2 += diff_text.length;
              patch.diffs.push(bigpatch.diffs.shift());
              empty = false;
            } else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 && patch.diffs[0][0] == DIFF_EQUAL && diff_text.length > 2 * patch_size) {
              patch.length1 += diff_text.length;
              start1 += diff_text.length;
              empty = false;
              patch.diffs.push(new diff_match_patch3.Diff(diff_type, diff_text));
              bigpatch.diffs.shift();
            } else {
              diff_text = diff_text.substring(0, patch_size - patch.length1 - this.Patch_Margin);
              patch.length1 += diff_text.length;
              start1 += diff_text.length;
              if (diff_type === DIFF_EQUAL) {
                patch.length2 += diff_text.length;
                start2 += diff_text.length;
              } else {
                empty = false;
              }
              patch.diffs.push(new diff_match_patch3.Diff(diff_type, diff_text));
              if (diff_text == bigpatch.diffs[0][1]) {
                bigpatch.diffs.shift();
              } else {
                bigpatch.diffs[0][1] = bigpatch.diffs[0][1].substring(diff_text.length);
              }
            }
          }
          precontext = this.diff_text2(patch.diffs);
          precontext = precontext.substring(precontext.length - this.Patch_Margin);
          var postcontext = this.diff_text1(bigpatch.diffs).substring(0, this.Patch_Margin);
          if (postcontext !== "") {
            patch.length1 += postcontext.length;
            patch.length2 += postcontext.length;
            if (patch.diffs.length !== 0 && patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
              patch.diffs[patch.diffs.length - 1][1] += postcontext;
            } else {
              patch.diffs.push(new diff_match_patch3.Diff(DIFF_EQUAL, postcontext));
            }
          }
          if (!empty) {
            patches.splice(++x, 0, patch);
          }
        }
      }
    };
    diff_match_patch3.prototype.patch_toText = function(patches) {
      var text9 = [];
      for (var x = 0; x < patches.length; x++) {
        text9[x] = patches[x];
      }
      return text9.join("");
    };
    diff_match_patch3.prototype.patch_fromText = function(textline) {
      var patches = [];
      if (!textline) {
        return patches;
      }
      var text9 = textline.split("\n");
      var textPointer = 0;
      var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
      while (textPointer < text9.length) {
        var m = text9[textPointer].match(patchHeader);
        if (!m) {
          throw new Error("Invalid patch string: " + text9[textPointer]);
        }
        var patch = new diff_match_patch3.patch_obj();
        patches.push(patch);
        patch.start1 = parseInt(m[1], 10);
        if (m[2] === "") {
          patch.start1--;
          patch.length1 = 1;
        } else if (m[2] == "0") {
          patch.length1 = 0;
        } else {
          patch.start1--;
          patch.length1 = parseInt(m[2], 10);
        }
        patch.start2 = parseInt(m[3], 10);
        if (m[4] === "") {
          patch.start2--;
          patch.length2 = 1;
        } else if (m[4] == "0") {
          patch.length2 = 0;
        } else {
          patch.start2--;
          patch.length2 = parseInt(m[4], 10);
        }
        textPointer++;
        while (textPointer < text9.length) {
          var sign = text9[textPointer].charAt(0);
          try {
            var line = decodeURI(text9[textPointer].substring(1));
          } catch (ex) {
            throw new Error("Illegal escape in patch_fromText: " + line);
          }
          if (sign == "-") {
            patch.diffs.push(new diff_match_patch3.Diff(DIFF_DELETE, line));
          } else if (sign == "+") {
            patch.diffs.push(new diff_match_patch3.Diff(DIFF_INSERT, line));
          } else if (sign == " ") {
            patch.diffs.push(new diff_match_patch3.Diff(DIFF_EQUAL, line));
          } else if (sign == "@") {
            break;
          } else if (sign === "") {
          } else {
            throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
          }
          textPointer++;
        }
      }
      return patches;
    };
    diff_match_patch3.patch_obj = function() {
      this.diffs = [];
      this.start1 = null;
      this.start2 = null;
      this.length1 = 0;
      this.length2 = 0;
    };
    diff_match_patch3.patch_obj.prototype.toString = function() {
      var coords1, coords2;
      if (this.length1 === 0) {
        coords1 = this.start1 + ",0";
      } else if (this.length1 == 1) {
        coords1 = this.start1 + 1;
      } else {
        coords1 = this.start1 + 1 + "," + this.length1;
      }
      if (this.length2 === 0) {
        coords2 = this.start2 + ",0";
      } else if (this.length2 == 1) {
        coords2 = this.start2 + 1;
      } else {
        coords2 = this.start2 + 1 + "," + this.length2;
      }
      var text9 = ["@@ -" + coords1 + " +" + coords2 + " @@\n"];
      var op;
      for (var x = 0; x < this.diffs.length; x++) {
        switch (this.diffs[x][0]) {
          case DIFF_INSERT:
            op = "+";
            break;
          case DIFF_DELETE:
            op = "-";
            break;
          case DIFF_EQUAL:
            op = " ";
            break;
        }
        text9[x + 1] = op + encodeURI(this.diffs[x][1]) + "\n";
      }
      return text9.join("").replace(/%20/g, " ");
    };
    module.exports = diff_match_patch3;
    module.exports["diff_match_patch"] = diff_match_patch3;
    module.exports["DIFF_DELETE"] = DIFF_DELETE;
    module.exports["DIFF_INSERT"] = DIFF_INSERT;
    module.exports["DIFF_EQUAL"] = DIFF_EQUAL;
  });

  // node_modules/@codemirror/next/text/dist/index.js
  var extend = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((s) => s ? parseInt(s, 36) : 1);
  for (let i = 1; i < extend.length; i++)
    extend[i] += extend[i - 1];
  function isExtendingChar(code) {
    for (let i = 1; i < extend.length; i += 2)
      if (extend[i] > code)
        return extend[i - 1] <= code;
    return false;
  }
  function isRegionalIndicator(code) {
    return code >= 127462 && code <= 127487;
  }
  var ZWJ = 8205;
  function nextClusterBreak(str, pos) {
    if (pos == str.length)
      return pos;
    if (pos && surrogateLow(str.charCodeAt(pos)) && surrogateHigh(str.charCodeAt(pos - 1)))
      pos--;
    let prev = codePointAt(str, pos);
    pos += codePointSize(prev);
    while (pos < str.length) {
      let next = codePointAt(str, pos);
      if (prev == ZWJ || next == ZWJ || isExtendingChar(next)) {
        pos += codePointSize(next);
        prev = next;
      } else if (isRegionalIndicator(next)) {
        let countBefore = 0, i = pos - 2;
        while (i >= 0 && isRegionalIndicator(codePointAt(str, i))) {
          countBefore++;
          i -= 2;
        }
        if (countBefore % 2 == 0)
          break;
        else
          pos += 2;
      } else {
        break;
      }
    }
    return pos;
  }
  function prevClusterBreak(str, pos) {
    while (pos > 0) {
      let found = nextClusterBreak(str, pos - 2);
      if (found < pos)
        return found;
      pos--;
    }
    return 0;
  }
  function surrogateLow(ch) {
    return ch >= 56320 && ch < 57344;
  }
  function surrogateHigh(ch) {
    return ch >= 55296 && ch < 56320;
  }
  function codePointAt(str, pos) {
    let code0 = str.charCodeAt(pos);
    if (!surrogateHigh(code0) || pos + 1 == str.length)
      return code0;
    let code1 = str.charCodeAt(pos + 1);
    if (!surrogateLow(code1))
      return code0;
    return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
  }
  function fromCodePoint(code) {
    if (code <= 65535)
      return String.fromCharCode(code);
    code -= 65536;
    return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
  }
  function codePointSize(code) {
    return code < 65536 ? 1 : 2;
  }
  function countColumn(string2, n, tabSize) {
    for (let i = 0; i < string2.length; ) {
      if (string2.charCodeAt(i) == 9) {
        n += tabSize - n % tabSize;
        i++;
      } else {
        n++;
        i = nextClusterBreak(string2, i);
      }
    }
    return n;
  }
  function findColumn(string2, n, col, tabSize) {
    for (let i = 0; i < string2.length; ) {
      if (n >= col)
        return {offset: i, leftOver: 0};
      n += string2.charCodeAt(i) == 9 ? tabSize - n % tabSize : 1;
      i = nextClusterBreak(string2, i);
    }
    return {offset: string2.length, leftOver: col - n};
  }
  var Text = class {
    constructor() {
    }
    lineAt(pos) {
      if (pos < 0 || pos > this.length)
        throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
      for (let line of lineCache) {
        if (line.doc == this && line.from <= pos && line.to >= pos)
          return line;
      }
      return cacheLine(this.lineInner(pos, false, 1, 0).finish(this));
    }
    line(n) {
      if (n < 1 || n > this.lines)
        throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
      for (let line of lineCache) {
        if (line.doc == this && line.number == n)
          return line;
      }
      return cacheLine(this.lineInner(n, true, 1, 0).finish(this));
    }
    replace(from, to, text9) {
      let parts5 = [];
      this.decompose(0, from, parts5);
      parts5.push(text9);
      this.decompose(to, this.length, parts5);
      return TextNode.from(parts5, this.length - (to - from) + text9.length);
    }
    append(text9) {
      return this.length == 0 ? text9 : text9.length == 0 ? this : TextNode.from([this, text9], this.length + text9.length);
    }
    slice(from, to = this.length) {
      let parts5 = [];
      this.decompose(from, to, parts5);
      return TextNode.from(parts5, to - from);
    }
    eq(other) {
      return this == other || eqContent(this, other);
    }
    iter(dir = 1) {
      return new RawTextCursor(this, dir);
    }
    iterRange(from, to = this.length) {
      return new PartialTextCursor(this, from, to);
    }
    iterLines(from = 0) {
      return new LineCursor(this, from);
    }
    toString() {
      return this.sliceString(0);
    }
    toJSON() {
      let lines = [];
      for (let iter = this.iterLines(); !iter.next().done; )
        lines.push(iter.value);
      return lines;
    }
    static of(text9) {
      if (text9.length == 0)
        throw new RangeError("A document must have at least one line");
      if (text9.length == 1 && !text9[0] && Text.empty)
        return Text.empty;
      let length = textLength(text9);
      return length < 1024 ? new TextLeaf(text9, length) : TextNode.from(TextLeaf.split(text9, []), length);
    }
  };
  if (typeof Symbol != "undefined")
    Text.prototype[Symbol.iterator] = function() {
      return this.iter();
    };
  var lineCache = [];
  var lineCachePos = -1;
  var lineCacheSize = 10;
  function cacheLine(line) {
    return lineCache[lineCachePos = (lineCachePos + 1) % lineCacheSize] = line;
  }
  var TextLeaf = class extends Text {
    constructor(text9, length = textLength(text9)) {
      super();
      this.text = text9;
      this.length = length;
    }
    get lines() {
      return this.text.length;
    }
    get children() {
      return null;
    }
    lineInner(target, isLine, line, offset) {
      for (let i = 0; ; i++) {
        let string2 = this.text[i], end = offset + string2.length;
        if ((isLine ? line : end) >= target)
          return new Line(offset, end, line, string2);
        offset = end + 1;
        line++;
      }
    }
    decompose(from, to, target) {
      target.push(new TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from)));
    }
    lastLineLength() {
      return this.text[this.text.length - 1].length;
    }
    firstLineLength() {
      return this.text[0].length;
    }
    replace(from, to, text9) {
      let newLen = this.length + text9.length - (to - from);
      if (newLen >= 1024 || !(text9 instanceof TextLeaf))
        return super.replace(from, to, text9);
      return new TextLeaf(appendText(this.text, appendText(text9.text, sliceText(this.text, 0, from)), to), newLen);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
      let result = "";
      for (let pos = 0, i = 0; pos <= to && i < this.text.length; i++) {
        let line = this.text[i], end = pos + line.length;
        if (pos > from && i)
          result += lineSep;
        if (from < end && to > pos)
          result += line.slice(Math.max(0, from - pos), to - pos);
        pos = end + 1;
      }
      return result;
    }
    flatten(target) {
      target[target.length - 1] += this.text[0];
      for (let i = 1; i < this.text.length; i++)
        target.push(this.text[i]);
    }
    static split(text9, target) {
      let part3 = [], length = -1;
      for (let line of text9) {
        for (; ; ) {
          let newLength = length + line.length + 1;
          if (newLength < 512) {
            length = newLength;
            part3.push(line);
            break;
          }
          let cut = 512 - length - 1, after = line.charCodeAt(cut);
          if (after >= 56320 && after < 57344)
            cut++;
          part3.push(line.slice(0, cut));
          target.push(new TextLeaf(part3, 512));
          line = line.slice(cut);
          length = -1;
          part3 = [];
        }
      }
      if (length != -1)
        target.push(new TextLeaf(part3, length));
      return target;
    }
  };
  var TextNode = class extends Text {
    constructor(children, length) {
      super();
      this.children = children;
      this.length = length;
      this.lines = 1;
      for (let child of children)
        this.lines += child.lines - 1;
    }
    lineInner(target, isLine, line, offset) {
      for (let i = 0; ; i++) {
        let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
        if ((isLine ? endLine : end) >= target) {
          let inner = child.lineInner(target, isLine, line, offset), add;
          if (inner.from == offset && (add = this.lineLengthTo(i))) {
            inner.from -= add;
            inner.content = null;
          }
          if (inner.to == end && (add = this.lineLengthFrom(i + 1))) {
            inner.to += add;
            inner.content = null;
          }
          return inner;
        }
        offset = end;
        line = endLine;
      }
    }
    decompose(from, to, target) {
      for (let i = 0, pos = 0; pos < to && i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (from < end && to > pos) {
          if (pos >= from && end <= to)
            target.push(child);
          else
            child.decompose(from - pos, to - pos, target);
        }
        pos = end;
      }
    }
    lineLengthTo(to) {
      let length = 0;
      for (let i = to - 1; i >= 0; i--) {
        let child = this.children[i];
        if (child.lines > 1)
          return length + child.lastLineLength();
        length += child.length;
      }
      return length;
    }
    lastLineLength() {
      return this.lineLengthTo(this.children.length);
    }
    lineLengthFrom(from) {
      let length = 0;
      for (let i = from; i < this.children.length; i++) {
        let child = this.children[i];
        if (child.lines > 1)
          return length + child.firstLineLength();
        length += child.length;
      }
      return length;
    }
    firstLineLength() {
      return this.lineLengthFrom(0);
    }
    replace(from, to, text9) {
      if (text9.length < 512 && to - from < 512) {
        let lengthDiff = text9.length - (to - from);
        for (let i = 0, pos = 0; i < this.children.length; i++) {
          let child = this.children[i], end = pos + child.length;
          if (from >= pos && to <= end && child.length + lengthDiff < this.length + lengthDiff >> 3 - 1 && child.length + lengthDiff > 0) {
            let copy = this.children.slice();
            copy[i] = child.replace(from - pos, to - pos, text9);
            return new TextNode(copy, this.length + lengthDiff);
          }
          pos = end;
        }
      }
      return super.replace(from, to, text9);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
      let result = "";
      for (let i = 0, pos = 0; pos < to && i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (from < end && to > pos) {
          let part3 = child.sliceString(from - pos, to - pos, lineSep);
          if (from >= pos && to <= end)
            return part3;
          result += part3;
        }
        pos = end;
      }
      return result;
    }
    flatten(target) {
      for (let child of this.children)
        child.flatten(target);
    }
    static from(children, length) {
      if (!children.every((ch) => ch instanceof Text))
        throw new Error("NOP");
      if (length < 1024) {
        let text9 = [""];
        for (let child of children)
          child.flatten(text9);
        return new TextLeaf(text9, length);
      }
      let chunkLength = Math.max(512, length >> 3), maxLength = chunkLength << 1, minLength = chunkLength >> 1;
      let chunked = [], currentLength = 0, currentChunk = [];
      function add(child) {
        let childLength = child.length, last;
        if (!childLength)
          return;
        if (childLength > maxLength && child instanceof TextNode) {
          for (let node of child.children)
            add(node);
        } else if (childLength > minLength && (currentLength > minLength || currentLength == 0)) {
          flush();
          chunked.push(child);
        } else if (child instanceof TextLeaf && currentLength > 0 && (last = currentChunk[currentChunk.length - 1]) instanceof TextLeaf && child.length + last.length <= 512) {
          currentLength += childLength;
          currentChunk[currentChunk.length - 1] = new TextLeaf(appendText(child.text, last.text.slice()), child.length + last.length);
        } else {
          if (currentLength + childLength > chunkLength)
            flush();
          currentLength += childLength;
          currentChunk.push(child);
        }
      }
      function flush() {
        if (currentLength == 0)
          return;
        chunked.push(currentChunk.length == 1 ? currentChunk[0] : TextNode.from(currentChunk, currentLength));
        currentLength = 0;
        currentChunk.length = 0;
      }
      for (let child of children)
        add(child);
      flush();
      return chunked.length == 1 ? chunked[0] : new TextNode(chunked, length);
    }
  };
  Text.empty = Text.of([""]);
  function textLength(text9) {
    let length = -1;
    for (let line of text9)
      length += line.length + 1;
    return length;
  }
  function appendText(text9, target, from = 0, to = 1e9) {
    for (let pos = 0, i = 0, first = true; i < text9.length && pos <= to; i++) {
      let line = text9[i], end = pos + line.length;
      if (end >= from) {
        if (end > to)
          line = line.slice(0, to - pos);
        if (pos < from)
          line = line.slice(from - pos);
        if (first) {
          target[target.length - 1] += line;
          first = false;
        } else
          target.push(line);
      }
      pos = end + 1;
    }
    return target;
  }
  function sliceText(text9, from, to) {
    return appendText(text9, [""], from, to);
  }
  function eqContent(a, b) {
    if (a.length != b.length || a.lines != b.lines)
      return false;
    let iterA = new RawTextCursor(a), iterB = new RawTextCursor(b);
    for (let offA = 0, offB = 0; ; ) {
      if (iterA.lineBreak != iterB.lineBreak || iterA.done != iterB.done) {
        return false;
      } else if (iterA.done) {
        return true;
      } else if (iterA.lineBreak) {
        iterA.next();
        iterB.next();
        offA = offB = 0;
      } else {
        let strA = iterA.value.slice(offA), strB = iterB.value.slice(offB);
        if (strA.length == strB.length) {
          if (strA != strB)
            return false;
          iterA.next();
          iterB.next();
          offA = offB = 0;
        } else if (strA.length > strB.length) {
          if (strA.slice(0, strB.length) != strB)
            return false;
          offA += strB.length;
          iterB.next();
          offB = 0;
        } else {
          if (strB.slice(0, strA.length) != strA)
            return false;
          offB += strA.length;
          iterA.next();
          offA = 0;
        }
      }
    }
  }
  var RawTextCursor = class {
    constructor(text9, dir = 1) {
      this.dir = dir;
      this.done = false;
      this.lineBreak = false;
      this.value = "";
      this.nodes = [text9];
      this.offsets = [dir > 0 ? 0 : text9 instanceof TextLeaf ? text9.text.length : text9.children.length];
    }
    next(skip = 0) {
      for (; ; ) {
        let last = this.nodes.length - 1;
        if (last < 0) {
          this.done = true;
          this.value = "";
          this.lineBreak = false;
          return this;
        }
        let top2 = this.nodes[last];
        let offset = this.offsets[last];
        if (top2 instanceof TextLeaf) {
          if (offset != (this.dir > 0 ? 0 : top2.text.length) && !this.lineBreak) {
            this.lineBreak = true;
            if (skip == 0) {
              this.value = "\n";
              return this;
            }
            skip--;
            continue;
          }
          let next = top2.text[offset - (this.dir < 0 ? 1 : 0)];
          this.offsets[last] = offset += this.dir;
          if (offset == (this.dir > 0 ? top2.text.length : 0)) {
            this.nodes.pop();
            this.offsets.pop();
          }
          this.lineBreak = false;
          if (next.length > Math.max(0, skip)) {
            this.value = skip == 0 ? next : this.dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
            return this;
          }
          skip -= next.length;
        } else if (offset == (this.dir > 0 ? top2.children.length : 0)) {
          this.nodes.pop();
          this.offsets.pop();
        } else {
          let next = top2.children[this.dir > 0 ? offset : offset - 1], len = next.length;
          this.offsets[last] = offset + this.dir;
          if (skip > len) {
            skip -= len;
          } else {
            this.nodes.push(next);
            this.offsets.push(this.dir > 0 ? 0 : next instanceof TextLeaf ? next.text.length : next.children.length);
          }
        }
      }
    }
  };
  var PartialTextCursor = class {
    constructor(text9, start, end) {
      this.value = "";
      this.cursor = new RawTextCursor(text9, start > end ? -1 : 1);
      if (start > end) {
        this.skip = text9.length - start;
        this.limit = start - end;
      } else {
        this.skip = start;
        this.limit = end - start;
      }
    }
    next() {
      if (this.limit <= 0) {
        this.limit = -1;
      } else {
        let {value, lineBreak, done} = this.cursor.next(this.skip);
        this.skip = 0;
        this.value = value;
        let len = lineBreak ? 1 : value.length;
        if (len > this.limit)
          this.value = this.cursor.dir > 0 ? value.slice(0, this.limit) : value.slice(len - this.limit);
        if (done || this.value.length == 0)
          this.limit = -1;
        else
          this.limit -= this.value.length;
      }
      return this;
    }
    get lineBreak() {
      return this.cursor.lineBreak;
    }
    get done() {
      return this.limit < 0;
    }
  };
  var LineCursor = class {
    constructor(text9, from = 0) {
      this.value = "";
      this.done = false;
      this.cursor = text9.iter();
      this.skip = from;
    }
    next(skip = 0) {
      if (this.cursor.done) {
        this.done = true;
        this.value = "";
        return this;
      }
      skip += this.skip;
      this.skip = 0;
      for (this.value = ""; ; ) {
        let {value, lineBreak, done} = this.cursor.next(skip);
        skip = 0;
        if (done || lineBreak)
          return this;
        this.value += value;
      }
    }
    get lineBreak() {
      return false;
    }
  };
  var Line = class {
    constructor(from, to, number2, content2) {
      this.from = from;
      this.to = to;
      this.number = number2;
      this.content = content2;
    }
    get length() {
      return this.to - this.from;
    }
    slice(from = 0, to = this.length) {
      if (from == to)
        return "";
      if (typeof this.content == "string")
        return this.content.slice(from, to);
      if (!this.content)
        this.content = new LineContent(this.doc, this.from);
      let result = this.content.slice(from, to);
      if (from == 0 && to == this.length)
        this.content = result;
      return result;
    }
    finish(text9) {
      this.doc = text9;
      return this;
    }
    findClusterBreak(start, forward) {
      if (start < 0 || start > this.length)
        throw new RangeError("Invalid position given to Line.findClusterBreak");
      let contextStart, context;
      if (this.content == "string") {
        contextStart = this.from;
        context = this.content;
      } else {
        contextStart = Math.max(0, start - 256);
        context = this.slice(contextStart, Math.min(this.length, contextStart + 512));
      }
      return (forward ? nextClusterBreak : prevClusterBreak)(context, start - contextStart) + contextStart;
    }
  };
  var LineContent = class {
    constructor(doc2, start) {
      this.doc = doc2;
      this.start = start;
      this.cursor = null;
      this.strings = null;
    }
    slice(from, to) {
      if (!this.cursor) {
        this.cursor = this.doc.iter();
        this.strings = [this.cursor.next(this.start).value];
      }
      for (let result = "", pos = 0, i = 0; ; i++) {
        if (i == this.strings.length) {
          let next = this.cursor.next().value;
          if (!next)
            return result;
          this.strings.push(next);
        }
        let string2 = this.strings[i], start = pos;
        pos += string2.length;
        if (pos <= from)
          continue;
        result += string2.slice(Math.max(0, from - start), Math.min(string2.length, to - start));
        if (pos >= to)
          return result;
      }
    }
  };

  // node_modules/@codemirror/next/state/dist/index.js
  var DefaultSplit = /\r\n?|\n/;
  var MapMode;
  (function(MapMode2) {
    MapMode2[MapMode2["Simple"] = 0] = "Simple";
    MapMode2[MapMode2["TrackDel"] = 1] = "TrackDel";
    MapMode2[MapMode2["TrackBefore"] = 2] = "TrackBefore";
    MapMode2[MapMode2["TrackAfter"] = 3] = "TrackAfter";
  })(MapMode || (MapMode = {}));
  var ChangeDesc = class {
    constructor(sections) {
      this.sections = sections;
    }
    get length() {
      let result = 0;
      for (let i = 0; i < this.sections.length; i += 2)
        result += this.sections[i];
      return result;
    }
    get newLength() {
      let result = 0;
      for (let i = 0; i < this.sections.length; i += 2) {
        let ins = this.sections[i + 1];
        result += ins < 0 ? this.sections[i] : ins;
      }
      return result;
    }
    get empty() {
      return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
    }
    iterGaps(f) {
      for (let i = 0, posA = 0, posB = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        if (ins < 0) {
          f(posA, posB, len);
          posB += len;
        } else {
          posB += ins;
        }
        posA += len;
      }
    }
    iterChangedRanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    get invertedDesc() {
      let sections = [];
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        if (ins < 0)
          sections.push(len, ins);
        else
          sections.push(ins, len);
      }
      return new ChangeDesc(sections);
    }
    composeDesc(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other);
    }
    mapDesc(other, before = false) {
      return other.empty ? this : mapSet(this, other, before);
    }
    mapPos(pos, assoc = -1, mode = MapMode.Simple) {
      let posA = 0, posB = 0;
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
        if (ins < 0) {
          if (endA > pos)
            return posB + (pos - posA);
          posB += len;
        } else {
          if (mode != MapMode.Simple && endA >= pos && (mode == MapMode.TrackDel && posA < pos && endA > pos || mode == MapMode.TrackBefore && posA < pos || mode == MapMode.TrackAfter && endA > pos))
            return null;
          if (endA > pos || endA == pos && assoc < 0 && !len)
            return pos == posA || assoc < 0 ? posB : posB + ins;
          posB += ins;
        }
        posA = endA;
      }
      if (pos > posA)
        throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
      return posB;
    }
    touchesRange(from, to = from) {
      for (let i = 0, pos = 0; i < this.sections.length && pos <= to; ) {
        let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
        if (ins >= 0 && pos <= to && end >= from)
          return pos < from && end > to ? "cover" : true;
        pos = end;
      }
      return false;
    }
    toString() {
      let result = "";
      for (let i = 0; i < this.sections.length; ) {
        let len = this.sections[i++], ins = this.sections[i++];
        result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
      }
      return result;
    }
  };
  var ChangeSet = class extends ChangeDesc {
    constructor(sections, inserted) {
      super(sections);
      this.inserted = inserted;
    }
    apply(doc2) {
      if (this.length != doc2.length)
        throw new RangeError("Applying change set to a document with the wrong length");
      iterChanges(this, (fromA, toA, fromB, _toB, text9) => doc2 = doc2.replace(fromB, fromB + (toA - fromA), text9), false);
      return doc2;
    }
    mapDesc(other, before = false) {
      return mapSet(this, other, before, true);
    }
    invert(doc2) {
      let sections = this.sections.slice(), inserted = [];
      for (let i = 0, pos = 0; i < sections.length; i += 2) {
        let len = sections[i], ins = sections[i + 1];
        if (ins >= 0) {
          sections[i] = ins;
          sections[i + 1] = len;
          let index2 = i >> 1;
          while (inserted.length < index2)
            inserted.push(Text.empty);
          inserted.push(len ? doc2.slice(pos, pos + len) : Text.empty);
        }
        pos += len;
      }
      return new ChangeSet(sections, inserted);
    }
    compose(other) {
      return this.empty ? other : other.empty ? this : composeSets(this, other, true);
    }
    map(other, before = false) {
      return other.empty ? this : mapSet(this, other, before, true);
    }
    iterChanges(f, individual = false) {
      iterChanges(this, f, individual);
    }
    get desc() {
      return new ChangeDesc(this.sections);
    }
    filter(ranges) {
      let resultSections = [], resultInserted = [], filteredSections = [];
      let iter = new SectionIter(this);
      done:
        for (let i = 0, pos = 0; ; ) {
          let next = i == ranges.length ? 1e9 : ranges[i++];
          while (pos < next || pos == next && iter.len == 0) {
            if (iter.done)
              break done;
            let len = Math.min(iter.len, next - pos);
            addSection(filteredSections, len, -1);
            let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
            addSection(resultSections, len, ins);
            if (ins > 0)
              addInsert(resultInserted, resultSections, iter.text);
            iter.forward(len);
            pos += len;
          }
          let end = ranges[i++];
          while (pos < end) {
            if (iter.done)
              break done;
            let len = Math.min(iter.len, end - pos);
            addSection(resultSections, len, -1);
            addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
            iter.forward(len);
            pos += len;
          }
        }
      return {
        changes: new ChangeSet(resultSections, resultInserted),
        filtered: new ChangeDesc(filteredSections)
      };
    }
    toJSON() {
      let parts5 = [];
      for (let i = 0; i < this.sections.length; i += 2) {
        let len = this.sections[i], ins = this.sections[i + 1];
        if (ins < 0)
          parts5.push(len);
        else if (ins == 0)
          parts5.push([len]);
        else
          parts5.push([len, this.inserted[i >> 1].toJSON()]);
      }
      return parts5;
    }
    static of(changes, length, lineSep) {
      let sections = [], inserted = [], pos = 0;
      let total = null;
      function flush(force = false) {
        if (!force && !sections.length)
          return;
        if (pos < length)
          addSection(sections, length - pos, -1);
        let set = new ChangeSet(sections, inserted);
        total = total ? total.compose(set.map(total)) : set;
        sections = [];
        inserted = [];
        pos = 0;
      }
      function process(spec) {
        if (Array.isArray(spec)) {
          for (let sub of spec)
            process(sub);
        } else if (spec instanceof ChangeSet) {
          if (spec.length != length)
            throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
          flush();
          total = total ? total.compose(spec.map(total)) : spec;
        } else {
          let {from, to = from, insert: insert2} = spec;
          if (from > to || from < 0 || to > length)
            throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
          let insText = !insert2 ? Text.empty : typeof insert2 == "string" ? Text.of(insert2.split(lineSep || DefaultSplit)) : insert2;
          let insLen = insText.length;
          if (from == to && insLen == 0)
            return;
          if (from < pos)
            flush();
          if (from > pos)
            addSection(sections, from - pos, -1);
          addSection(sections, to - from, insLen);
          addInsert(inserted, sections, insText);
          pos = to;
        }
      }
      process(changes);
      flush(!total);
      return total;
    }
    static empty(length) {
      return new ChangeSet(length ? [length, -1] : [], []);
    }
    static fromJSON(json) {
      let sections = [], inserted = [];
      for (let i = 0; i < json.length; i++) {
        let part3 = json[i];
        if (typeof part3 == "number") {
          sections.push(part3, -1);
        } else if (part3.length == 1) {
          sections.push(part3[0], 0);
        } else {
          while (inserted.length < i)
            inserted.push(Text.empty);
          inserted[i] = Text.of(part3[1]);
          sections.push(part3[0], inserted[i].length);
        }
      }
      return new ChangeSet(sections, inserted);
    }
  };
  function addSection(sections, len, ins, forceJoin = false) {
    if (len == 0 && ins <= 0)
      return;
    let last = sections.length - 2;
    if (last >= 0 && ins <= 0 && ins == sections[last + 1])
      sections[last] += len;
    else if (len == 0 && sections[last] == 0)
      sections[last + 1] += ins;
    else if (forceJoin) {
      sections[last] += len;
      sections[last + 1] += ins;
    } else
      sections.push(len, ins);
  }
  function addInsert(values, sections, value) {
    if (value.length == 0)
      return;
    let index2 = sections.length - 2 >> 1;
    if (index2 < values.length) {
      values[values.length - 1] = values[values.length - 1].append(value);
    } else {
      while (values.length < index2)
        values.push(Text.empty);
      values.push(value);
    }
  }
  function iterChanges(desc, f, individual) {
    let inserted = desc.inserted;
    for (let posA = 0, posB = 0, i = 0; i < desc.sections.length; ) {
      let len = desc.sections[i++], ins = desc.sections[i++];
      if (ins < 0) {
        posA += len;
        posB += len;
      } else {
        let endA = posA, endB = posB, text9 = Text.empty;
        for (; ; ) {
          endA += len;
          endB += ins;
          if (ins && inserted)
            text9 = text9.append(inserted[i - 2 >> 1]);
          if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
            break;
          len = desc.sections[i++];
          ins = desc.sections[i++];
        }
        f(posA, endA, posB, endB, text9);
        posA = endA;
        posB = endB;
      }
    }
  }
  function mapSet(setA, setB, before, mkSet = false) {
    let sections = [], insert2 = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let posA = 0, posB = 0; ; ) {
      if (a.ins == -1) {
        posA += a.len;
        a.next();
      } else if (b.ins == -1 && posB < posA) {
        let skip = Math.min(b.len, posA - posB);
        b.forward(skip);
        addSection(sections, skip, -1);
        posB += skip;
      } else if (b.ins >= 0 && (a.done || posB < posA || posB == posA && (b.len < a.len || b.len == a.len && !before))) {
        addSection(sections, b.ins, -1);
        while (posA > posB && !a.done && posA + a.len < posB + b.len) {
          posA += a.len;
          a.next();
        }
        posB += b.len;
        b.next();
      } else if (a.ins >= 0) {
        let len = 0, end = posA + a.len;
        for (; ; ) {
          if (b.ins >= 0 && posB > posA && posB + b.len < end) {
            len += b.ins;
            posB += b.len;
            b.next();
          } else if (b.ins == -1 && posB < end) {
            let skip = Math.min(b.len, end - posB);
            len += skip;
            b.forward(skip);
            posB += skip;
          } else {
            break;
          }
        }
        addSection(sections, len, a.ins);
        if (insert2)
          addInsert(insert2, sections, a.text);
        posA = end;
        a.next();
      } else if (a.done && b.done) {
        return insert2 ? new ChangeSet(sections, insert2) : new ChangeDesc(sections);
      } else {
        throw new Error("Mismatched change set lengths");
      }
    }
  }
  function composeSets(setA, setB, mkSet = false) {
    let sections = [];
    let insert2 = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let open = false; ; ) {
      if (a.done && b.done) {
        return insert2 ? new ChangeSet(sections, insert2) : new ChangeDesc(sections);
      } else if (a.ins == 0) {
        addSection(sections, a.len, 0, open);
        a.next();
      } else if (b.len == 0 && !b.done) {
        addSection(sections, 0, b.ins, open);
        if (insert2)
          addInsert(insert2, sections, b.text);
        b.next();
      } else if (a.done || b.done) {
        throw new Error("Mismatched change set lengths");
      } else {
        let len = Math.min(a.len2, b.len), sectionLen = sections.length;
        if (a.ins == -1) {
          let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
          addSection(sections, len, insB, open);
          if (insert2 && insB)
            addInsert(insert2, sections, b.text);
        } else if (b.ins == -1) {
          addSection(sections, a.off ? 0 : a.len, len, open);
          if (insert2)
            addInsert(insert2, sections, a.textBit(len));
        } else {
          addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
          if (insert2 && !b.off)
            addInsert(insert2, sections, b.text);
        }
        open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
        a.forward2(len);
        b.forward(len);
      }
    }
  }
  var SectionIter = class {
    constructor(set) {
      this.set = set;
      this.i = 0;
      this.next();
    }
    next() {
      let {sections} = this.set;
      if (this.i < sections.length) {
        this.len = sections[this.i++];
        this.ins = sections[this.i++];
      } else {
        this.len = 0;
        this.ins = -2;
      }
      this.off = 0;
    }
    get done() {
      return this.ins == -2;
    }
    get len2() {
      return this.ins < 0 ? this.len : this.ins;
    }
    get text() {
      let {inserted} = this.set, index2 = this.i - 2 >> 1;
      return index2 >= inserted.length ? Text.empty : inserted[index2];
    }
    textBit(len) {
      let {inserted} = this.set, index2 = this.i - 2 >> 1;
      return index2 >= inserted.length && !len ? Text.empty : inserted[index2].slice(this.off, len == null ? void 0 : this.off + len);
    }
    forward(len) {
      if (len == this.len)
        this.next();
      else {
        this.len -= len;
        this.off += len;
      }
    }
    forward2(len) {
      if (this.ins == -1)
        this.forward(len);
      else if (len == this.ins)
        this.next();
      else {
        this.ins -= len;
        this.off += len;
      }
    }
  };
  var SelectionRange = class {
    constructor(from, to, flags) {
      this.from = from;
      this.to = to;
      this.flags = flags;
    }
    get anchor() {
      return this.flags & 16 ? this.to : this.from;
    }
    get head() {
      return this.flags & 16 ? this.from : this.to;
    }
    get empty() {
      return this.from == this.to;
    }
    get assoc() {
      return this.flags & 4 ? -1 : this.flags & 8 ? 1 : 0;
    }
    get bidiLevel() {
      let level = this.flags & 3;
      return level == 3 ? null : level;
    }
    get goalColumn() {
      let value = this.flags >> 5;
      return value == 33554431 ? void 0 : value;
    }
    map(mapping) {
      let from = mapping.mapPos(this.from), to = mapping.mapPos(this.to);
      return from == this.from && to == this.to ? this : new SelectionRange(from, to, this.flags);
    }
    extend(from, to = from) {
      if (from <= this.anchor && to >= this.anchor)
        return EditorSelection.range(from, to);
      let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
      return EditorSelection.range(this.anchor, head);
    }
    eq(other) {
      return this.anchor == other.anchor && this.head == other.head;
    }
    toJSON() {
      return {anchor: this.anchor, head: this.head};
    }
    static fromJSON(json) {
      if (!json || typeof json.anchor != "number" || typeof json.head != "number")
        throw new RangeError("Invalid JSON representation for SelectionRange");
      return EditorSelection.range(json.anchor, json.head);
    }
  };
  var EditorSelection = class {
    constructor(ranges, primaryIndex = 0) {
      this.ranges = ranges;
      this.primaryIndex = primaryIndex;
    }
    map(mapping) {
      if (mapping.empty)
        return this;
      return EditorSelection.create(this.ranges.map((r) => r.map(mapping)), this.primaryIndex);
    }
    eq(other) {
      if (this.ranges.length != other.ranges.length || this.primaryIndex != other.primaryIndex)
        return false;
      for (let i = 0; i < this.ranges.length; i++)
        if (!this.ranges[i].eq(other.ranges[i]))
          return false;
      return true;
    }
    get primary() {
      return this.ranges[this.primaryIndex];
    }
    asSingle() {
      return this.ranges.length == 1 ? this : new EditorSelection([this.primary]);
    }
    addRange(range, primary = true) {
      return EditorSelection.create([range].concat(this.ranges), primary ? 0 : this.primaryIndex + 1);
    }
    replaceRange(range, which = this.primaryIndex) {
      let ranges = this.ranges.slice();
      ranges[which] = range;
      return EditorSelection.create(ranges, this.primaryIndex);
    }
    toJSON() {
      return {ranges: this.ranges.map((r) => r.toJSON()), primaryIndex: this.primaryIndex};
    }
    static fromJSON(json) {
      if (!json || !Array.isArray(json.ranges) || typeof json.primaryIndex != "number" || json.primaryIndex >= json.ranges.length)
        throw new RangeError("Invalid JSON representation for EditorSelection");
      return new EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.primaryIndex);
    }
    static single(anchor, head = anchor) {
      return new EditorSelection([EditorSelection.range(anchor, head)], 0);
    }
    static create(ranges, primaryIndex = 0) {
      if (ranges.length == 0)
        throw new RangeError("A selection needs at least one range");
      for (let pos = 0, i = 0; i < ranges.length; i++) {
        let range = ranges[i];
        if (range.empty ? range.from <= pos : range.from < pos)
          return normalized(ranges.slice(), primaryIndex);
        pos = range.to;
      }
      return new EditorSelection(ranges, primaryIndex);
    }
    static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
      return new SelectionRange(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 4 : 8) | (bidiLevel == null ? 3 : Math.min(2, bidiLevel)) | (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5);
    }
    static range(anchor, head, goalColumn) {
      let goal = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5;
      return head < anchor ? new SelectionRange(head, anchor, 16 | goal) : new SelectionRange(anchor, head, goal);
    }
  };
  function normalized(ranges, primaryIndex = 0) {
    let primary = ranges[primaryIndex];
    ranges.sort((a, b) => a.from - b.from);
    primaryIndex = ranges.indexOf(primary);
    for (let i = 1; i < ranges.length; i++) {
      let range = ranges[i], prev = ranges[i - 1];
      if (range.empty ? range.from <= prev.to : range.from < prev.to) {
        let from = prev.from, to = Math.max(range.to, prev.to);
        if (i <= primaryIndex)
          primaryIndex--;
        ranges.splice(--i, 2, range.anchor > range.head ? EditorSelection.range(to, from) : EditorSelection.range(from, to));
      }
    }
    return new EditorSelection(ranges, primaryIndex);
  }
  function checkSelection(selection, docLength) {
    for (let range of selection.ranges)
      if (range.to > docLength)
        throw new RangeError("Selection points outside of document");
  }
  var nextID = 0;
  var Facet = class {
    constructor(combine, compareInput, compare2, isStatic) {
      this.combine = combine;
      this.compareInput = compareInput;
      this.compare = compare2;
      this.isStatic = isStatic;
      this.id = nextID++;
      this.default = combine([]);
    }
    static define(config2 = {}) {
      return new Facet(config2.combine || ((a) => a), config2.compareInput || ((a, b) => a === b), config2.compare || (!config2.combine ? sameArray : (a, b) => a === b), !!config2.static);
    }
    of(value) {
      return new FacetProvider([], this, 0, value);
    }
    compute(deps, get) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 1, get);
    }
    computeN(deps, get) {
      if (this.isStatic)
        throw new Error("Can't compute a static facet");
      return new FacetProvider(deps, this, 2, get);
    }
    from(get, prec) {
      return (field) => maybePrec(prec, this.compute([field], (state24) => get(state24.field(field))));
    }
    nFrom(get, prec) {
      return (field) => maybePrec(prec, this.computeN([field], (state24) => get(state24.field(field))));
    }
  };
  function sameArray(a, b) {
    return a == b || a.length == b.length && a.every((e, i) => e === b[i]);
  }
  var FacetProvider = class {
    constructor(dependencies, facet, type, value) {
      this.dependencies = dependencies;
      this.facet = facet;
      this.type = type;
      this.value = value;
      this.id = nextID++;
    }
    dynamicSlot(addresses) {
      var _a;
      let getter = this.value;
      let compare2 = this.facet.compareInput;
      let idx = addresses[this.id] >> 1, multi = this.type == 2;
      let depDoc = false, depSel = false, depAddrs = [];
      for (let dep of this.dependencies) {
        if (dep == "doc")
          depDoc = true;
        else if (dep == "selection")
          depSel = true;
        else if ((((_a = addresses[dep.id]) !== null && _a !== void 0 ? _a : 1) & 1) == 0)
          depAddrs.push(addresses[dep.id]);
      }
      return (state24, tr) => {
        if (!tr || tr.reconfigure) {
          state24.values[idx] = getter(state24);
          return 1;
        } else {
          let depChanged = depDoc && tr.docChanged || depSel && (tr.docChanged || tr.selection) || depAddrs.some((addr) => (ensureAddr(state24, addr) & 1) > 0);
          if (!depChanged)
            return 0;
          let newVal = getter(state24), oldVal = tr.startState.values[idx];
          if (multi ? compareArray(newVal, oldVal, compare2) : compare2(newVal, oldVal))
            return 0;
          state24.values[idx] = newVal;
          return 1;
        }
      };
    }
  };
  function compareArray(a, b, compare2) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (!compare2(a[i], b[i]))
        return false;
    return true;
  }
  function dynamicFacetSlot(addresses, facet, providers) {
    let providerAddrs = providers.map((p) => addresses[p.id]);
    let providerTypes = providers.map((p) => p.type);
    let dynamic = providerAddrs.filter((p) => !(p & 1));
    let idx = addresses[facet.id] >> 1;
    return (state24, tr) => {
      let oldAddr = !tr ? null : tr.reconfigure ? tr.startState.config.address[facet.id] : idx << 1;
      let changed = oldAddr == null;
      for (let dynAddr of dynamic) {
        if (ensureAddr(state24, dynAddr) & 1)
          changed = true;
      }
      if (!changed)
        return 0;
      let values = [];
      for (let i = 0; i < providerAddrs.length; i++) {
        let value = getAddr(state24, providerAddrs[i]);
        if (providerTypes[i] == 2)
          for (let val of value)
            values.push(val);
        else
          values.push(value);
      }
      let newVal = facet.combine(values);
      if (oldAddr != null && facet.compare(newVal, getAddr(tr.startState, oldAddr)))
        return 0;
      state24.values[idx] = newVal;
      return 1;
    };
  }
  function maybeIndex(state24, id) {
    let found = state24.config.address[id];
    return found == null ? null : found >> 1;
  }
  var StateField = class {
    constructor(id, createF, updateF, compareF, facets) {
      this.id = id;
      this.createF = createF;
      this.updateF = updateF;
      this.compareF = compareF;
      this.facets = facets;
    }
    static define(config2) {
      let facets = [];
      let field = new StateField(nextID++, config2.create, config2.update, config2.compare || ((a, b) => a === b), facets);
      if (config2.provide)
        for (let p of config2.provide) {
          if (p instanceof Facet)
            facets.push(p.compute([field], (state24) => state24.field(field)));
          else
            facets.push(p(field));
        }
      return field;
    }
    slot(addresses) {
      let idx = addresses[this.id] >> 1;
      return (state24, tr) => {
        if (!tr) {
          state24.values[idx] = this.createF(state24);
          return 1;
        }
        let oldVal, changed = 0;
        if (tr.reconfigure) {
          let oldIdx = maybeIndex(tr.startState, this.id);
          oldVal = oldIdx == null ? this.createF(tr.startState) : tr.startState.values[oldIdx];
          changed = 1;
        } else {
          oldVal = tr.startState.values[idx];
        }
        let value = this.updateF(oldVal, tr);
        if (!changed && !this.compareF(oldVal, value))
          changed = 1;
        if (changed)
          state24.values[idx] = value;
        return changed;
      };
    }
  };
  var Prec = {fallback: 3, default: 2, extend: 1, override: 0};
  function precedence(extension, value) {
    if (!Prec.hasOwnProperty(value))
      throw new RangeError(`Invalid precedence: ${value}`);
    return new PrecExtension(extension, Prec[value]);
  }
  function maybePrec(prec, ext) {
    return prec ? precedence(ext, prec) : ext;
  }
  var PrecExtension = class {
    constructor(e, prec) {
      this.e = e;
      this.prec = prec;
    }
  };
  var TaggedExtension = class {
    constructor(tag, extension) {
      this.tag = tag;
      this.extension = extension;
    }
  };
  var Configuration = class {
    constructor(source, replacements, dynamicSlots, address, staticValues) {
      this.source = source;
      this.replacements = replacements;
      this.dynamicSlots = dynamicSlots;
      this.address = address;
      this.staticValues = staticValues;
      this.statusTemplate = [];
      while (this.statusTemplate.length < dynamicSlots.length)
        this.statusTemplate.push(0);
    }
    staticFacet(facet) {
      let addr = this.address[facet.id];
      return addr == null ? facet.default : this.staticValues[addr >> 1];
    }
    static resolve(extension, replacements = Object.create(null), oldState) {
      let fields = [];
      let facets = Object.create(null);
      for (let ext of flatten(extension, replacements)) {
        if (ext instanceof StateField)
          fields.push(ext);
        else
          (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
      }
      let address = Object.create(null);
      let staticValues = [];
      let dynamicSlots = [];
      for (let field of fields) {
        address[field.id] = dynamicSlots.length << 1;
        dynamicSlots.push((a) => field.slot(a));
      }
      for (let id in facets) {
        let providers = facets[id], facet = providers[0].facet;
        if (providers.every((p) => p.type == 0)) {
          address[facet.id] = staticValues.length << 1 | 1;
          let value = facet.combine(providers.map((p) => p.value));
          let oldAddr = oldState ? oldState.config.address[facet.id] : null;
          if (oldAddr != null) {
            let oldVal = getAddr(oldState, oldAddr);
            if (facet.compare(value, oldVal))
              value = oldVal;
          }
          staticValues.push(value);
        } else {
          for (let p of providers) {
            if (p.type == 0) {
              address[p.id] = staticValues.length << 1 | 1;
              staticValues.push(p.value);
            } else {
              address[p.id] = dynamicSlots.length << 1;
              dynamicSlots.push((a) => p.dynamicSlot(a));
            }
          }
          address[facet.id] = dynamicSlots.length << 1;
          dynamicSlots.push((a) => dynamicFacetSlot(a, facet, providers));
        }
      }
      return new Configuration(extension, replacements, dynamicSlots.map((f) => f(address)), address, staticValues);
    }
  };
  function allKeys(obj) {
    return (Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(obj) : []).concat(Object.keys(obj));
  }
  function flatten(extension, replacements) {
    let result = [[], [], [], []];
    let seen = new Map();
    let tagsSeen = Object.create(null);
    function inner(ext, prec) {
      let known = seen.get(ext);
      if (known != null) {
        if (known >= prec)
          return;
        let found = result[known].indexOf(ext);
        if (found > -1)
          result[known].splice(found, 1);
      }
      seen.set(ext, prec);
      if (Array.isArray(ext)) {
        for (let e of ext)
          inner(e, prec);
      } else if (ext instanceof TaggedExtension) {
        if (ext.tag in tagsSeen)
          throw new RangeError(`Duplicate use of tag '${String(ext.tag)}' in extensions`);
        tagsSeen[ext.tag] = true;
        inner(replacements[ext.tag] || ext.extension, prec);
      } else if (ext.extension) {
        inner(ext.extension, prec);
      } else if (ext instanceof PrecExtension) {
        inner(ext.e, ext.prec);
      } else {
        result[prec].push(ext);
        if (ext instanceof StateField)
          inner(ext.facets, prec);
      }
    }
    inner(extension, Prec.default);
    for (let key of allKeys(replacements))
      if (!(key in tagsSeen) && key != "full" && replacements[key]) {
        tagsSeen[key] = true;
        inner(replacements[key], Prec.default);
      }
    return result.reduce((a, b) => a.concat(b));
  }
  function ensureAddr(state24, addr) {
    if (addr & 1)
      return 2;
    let idx = addr >> 1;
    let status = state24.status[idx];
    if (status == 4)
      throw new Error("Cyclic dependency between fields and/or facets");
    if (status & 2)
      return status;
    state24.status[idx] = 4;
    let changed = state24.config.dynamicSlots[idx](state24, state24.applying);
    return state24.status[idx] = 2 | changed;
  }
  function getAddr(state24, addr) {
    return addr & 1 ? state24.config.staticValues[addr >> 1] : state24.values[addr >> 1];
  }
  var languageData = Facet.define();
  var allowMultipleSelections = Facet.define({
    combine: (values) => values.some((v) => v),
    static: true
  });
  var lineSeparator = Facet.define({
    combine: (values) => values.length ? values[0] : void 0,
    static: true
  });
  var changeFilter = Facet.define();
  var transactionFilter = Facet.define();
  var transactionExtender = Facet.define();
  var Annotation = class {
    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
    static define() {
      return new AnnotationType();
    }
  };
  var AnnotationType = class {
    of(value) {
      return new Annotation(this, value);
    }
  };
  var StateEffect = class {
    constructor(type, value) {
      this.type = type;
      this.value = value;
    }
    map(mapping) {
      let mapped = this.type.map(this.value, mapping);
      return mapped === void 0 ? void 0 : mapped == this.value ? this : new StateEffect(this.type, mapped);
    }
    is(type) {
      return this.type == type;
    }
    static define(spec = {}) {
      return new StateEffectType(spec.map || ((v) => v));
    }
    static mapEffects(effects, mapping) {
      if (!effects.length)
        return effects;
      let result = [];
      for (let effect of effects) {
        let mapped = effect.map(mapping);
        if (mapped)
          result.push(mapped);
      }
      return result;
    }
  };
  var StateEffectType = class {
    constructor(map) {
      this.map = map;
    }
    of(value) {
      return new StateEffect(this, value);
    }
  };
  var Transaction = class {
    constructor(startState, changes, selection, effects, annotations, reconfigure, scrollIntoView2) {
      this.startState = startState;
      this.changes = changes;
      this.selection = selection;
      this.effects = effects;
      this.annotations = annotations;
      this.reconfigure = reconfigure;
      this.scrollIntoView = scrollIntoView2;
      this._doc = null;
      this._state = null;
      if (selection)
        checkSelection(selection, changes.newLength);
      if (!annotations.some((a) => a.type == Transaction.time))
        this.annotations = annotations.concat(Transaction.time.of(Date.now()));
    }
    get newDoc() {
      return this._doc || (this._doc = this.changes.apply(this.startState.doc));
    }
    get newSelection() {
      return this.selection || this.startState.selection.map(this.changes);
    }
    get state() {
      if (!this._state)
        this.startState.applyTransaction(this);
      return this._state;
    }
    annotation(type) {
      for (let ann of this.annotations)
        if (ann.type == type)
          return ann.value;
      return void 0;
    }
    get docChanged() {
      return !this.changes.empty;
    }
  };
  Transaction.time = Annotation.define();
  Transaction.userEvent = Annotation.define();
  Transaction.addToHistory = Annotation.define();
  function joinRanges(a, b) {
    let result = [];
    for (let iA = 0, iB = 0; ; ) {
      let from, to;
      if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
        from = a[iA++];
        to = a[iA++];
      } else if (iB < b.length) {
        from = b[iB++];
        to = b[iB++];
      } else
        return result;
      if (!result.length || result[result.length - 1] < from)
        result.push(from, to);
      else if (result[result.length - 1] < to)
        result[result.length - 1] = to;
    }
  }
  function mergeTransaction(a, b, sequential) {
    var _a;
    let mapForA, mapForB, changes;
    if (sequential) {
      mapForA = b.changes;
      mapForB = ChangeSet.empty(b.changes.length);
      changes = a.changes.compose(b.changes);
    } else {
      mapForA = b.changes.map(a.changes);
      mapForB = a.changes.mapDesc(b.changes, true);
      changes = a.changes.compose(mapForA);
    }
    return {
      changes,
      selection: b.selection ? b.selection.map(mapForB) : (_a = a.selection) === null || _a === void 0 ? void 0 : _a.map(mapForA),
      effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
      annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
      scrollIntoView: a.scrollIntoView || b.scrollIntoView,
      reconfigure: !b.reconfigure ? a.reconfigure : b.reconfigure.full || !a.reconfigure ? b.reconfigure : Object.assign({}, a.reconfigure, b.reconfigure)
    };
  }
  function resolveTransactionInner(state24, spec, docSize) {
    let reconf = spec.reconfigure;
    if (reconf && reconf.append) {
      reconf = Object.assign({}, reconf);
      let tag = typeof Symbol == "undefined" ? "__append" + Math.floor(Math.random() * 4294967295) : Symbol("appendConf");
      reconf[tag] = reconf.append;
      reconf.append = void 0;
    }
    let sel = spec.selection;
    return {
      changes: spec.changes instanceof ChangeSet ? spec.changes : ChangeSet.of(spec.changes || [], docSize, state24.facet(lineSeparator)),
      selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
      effects: asArray(spec.effects),
      annotations: asArray(spec.annotations),
      scrollIntoView: !!spec.scrollIntoView,
      reconfigure: reconf
    };
  }
  function resolveTransaction(state24, specs, filter) {
    let s = resolveTransactionInner(state24, specs.length ? specs[0] : {}, state24.doc.length);
    if (specs.length && specs[0].filter === false)
      filter = false;
    for (let i = 1; i < specs.length; i++) {
      if (specs[i].filter === false)
        filter = false;
      let seq = !!specs[i].sequential;
      s = mergeTransaction(s, resolveTransactionInner(state24, specs[i], seq ? s.changes.newLength : state24.doc.length), seq);
    }
    let tr = new Transaction(state24, s.changes, s.selection, s.effects, s.annotations, s.reconfigure, s.scrollIntoView);
    return extendTransaction(filter ? filterTransaction(tr) : tr);
  }
  function filterTransaction(tr) {
    let state24 = tr.startState;
    let result = true;
    for (let filter of state24.facet(changeFilter)) {
      let value = filter(tr);
      if (value === false) {
        result = false;
        break;
      }
      if (Array.isArray(value))
        result = result === true ? value : joinRanges(result, value);
    }
    if (result !== true) {
      let changes, back;
      if (result === false) {
        back = tr.changes.invertedDesc;
        changes = ChangeSet.empty(state24.doc.length);
      } else {
        let filtered = tr.changes.filter(result);
        changes = filtered.changes;
        back = filtered.filtered.invertedDesc;
      }
      tr = new Transaction(state24, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.reconfigure, tr.scrollIntoView);
    }
    let filters = state24.facet(transactionFilter);
    for (let i = filters.length - 1; i >= 0; i--) {
      let filtered = filters[i](tr);
      if (filtered instanceof Transaction)
        tr = filtered;
      else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
        tr = filtered[0];
      else
        tr = resolveTransaction(state24, asArray(filtered), false);
    }
    return tr;
  }
  function extendTransaction(tr) {
    let state24 = tr.startState, extenders = state24.facet(transactionExtender), spec = tr;
    for (let i = extenders.length - 1; i >= 0; i--) {
      let extension = extenders[i](tr);
      if (extension && Object.keys(extension).length)
        spec = mergeTransaction(tr, resolveTransactionInner(state24, extension, tr.changes.newLength), true);
    }
    return spec == tr ? tr : new Transaction(state24, tr.changes, tr.selection, spec.effects, spec.annotations, spec.reconfigure, spec.scrollIntoView);
  }
  var none = [];
  function asArray(value) {
    return value == null ? none : Array.isArray(value) ? value : [value];
  }
  var CharCategory;
  (function(CharCategory2) {
    CharCategory2[CharCategory2["Word"] = 0] = "Word";
    CharCategory2[CharCategory2["Space"] = 1] = "Space";
    CharCategory2[CharCategory2["Other"] = 2] = "Other";
  })(CharCategory || (CharCategory = {}));
  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  var wordChar;
  try {
    wordChar = new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
  } catch (_) {
  }
  function hasWordChar(str) {
    if (wordChar)
      return wordChar.test(str);
    for (let i = 0; i < str.length; i++) {
      let ch = str[i];
      if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
        return true;
    }
    return false;
  }
  function makeCategorizer(wordChars) {
    return (char) => {
      if (!/\S/.test(char))
        return CharCategory.Space;
      if (hasWordChar(char))
        return CharCategory.Word;
      for (let i = 0; i < wordChars.length; i++)
        if (char.indexOf(wordChars[i]) > -1)
          return CharCategory.Word;
      return CharCategory.Other;
    };
  }
  var EditorState = class {
    constructor(config2, doc2, selection, tr = null) {
      this.config = config2;
      this.doc = doc2;
      this.selection = selection;
      this.applying = null;
      this.status = config2.statusTemplate.slice();
      if (tr && !tr.reconfigure) {
        this.values = tr.startState.values.slice();
      } else {
        this.values = config2.dynamicSlots.map((_) => null);
        if (tr)
          for (let id in config2.address) {
            let cur2 = config2.address[id], prev = tr.startState.config.address[id];
            if (prev != null && (cur2 & 1) == 0)
              this.values[cur2 >> 1] = getAddr(tr.startState, prev);
          }
      }
      this.applying = tr;
      if (tr)
        tr._state = this;
      for (let i = 0; i < this.config.dynamicSlots.length; i++)
        ensureAddr(this, i << 1);
      this.applying = null;
    }
    field(field, require2 = true) {
      let addr = this.config.address[field.id];
      if (addr == null) {
        if (require2)
          throw new RangeError("Field is not present in this state");
        return void 0;
      }
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    update(...specs) {
      return resolveTransaction(this, specs, true);
    }
    applyTransaction(tr) {
      let conf = this.config;
      if (tr.reconfigure)
        conf = Configuration.resolve(tr.reconfigure.full || conf.source, Object.assign(conf.replacements, tr.reconfigure, {full: void 0}), this);
      new EditorState(conf, tr.newDoc, tr.newSelection, tr);
    }
    replaceSelection(text9) {
      if (typeof text9 == "string")
        text9 = this.toText(text9);
      return this.changeByRange((range) => ({
        changes: {from: range.from, to: range.to, insert: text9},
        range: EditorSelection.cursor(range.from + text9.length)
      }));
    }
    changeByRange(f) {
      let sel = this.selection;
      let result1 = f(sel.ranges[0]);
      let changes = this.changes(result1.changes), ranges = [result1.range];
      let effects = asArray(result1.effects);
      for (let i = 1; i < sel.ranges.length; i++) {
        let result = f(sel.ranges[i]);
        let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
        for (let j = 0; j < i; j++)
          ranges[j] = ranges[j].map(newMapped);
        let mapBy = changes.mapDesc(newChanges, true);
        ranges.push(result.range.map(mapBy));
        changes = changes.compose(newMapped);
        effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
      }
      return {
        changes,
        selection: EditorSelection.create(ranges, sel.primaryIndex),
        effects
      };
    }
    changes(spec = []) {
      if (spec instanceof ChangeSet)
        return spec;
      return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
    }
    toText(string2) {
      return Text.of(string2.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
    }
    sliceDoc(from = 0, to = this.doc.length) {
      return this.doc.sliceString(from, to, this.lineBreak);
    }
    facet(facet) {
      let addr = this.config.address[facet.id];
      if (addr == null)
        return facet.default;
      ensureAddr(this, addr);
      return getAddr(this, addr);
    }
    toJSON() {
      return {
        doc: this.sliceDoc(),
        selection: this.selection.toJSON()
      };
    }
    static fromJSON(json, config2 = {}) {
      if (!json || typeof json.doc != "string")
        throw new RangeError("Invalid JSON representation for EditorState");
      return EditorState.create({
        doc: json.doc,
        selection: EditorSelection.fromJSON(json.selection),
        extensions: config2.extensions
      });
    }
    static create(config2 = {}) {
      let configuration = Configuration.resolve(config2.extensions || []);
      let doc2 = config2.doc instanceof Text ? config2.doc : Text.of((config2.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
      let selection = !config2.selection ? EditorSelection.single(0) : config2.selection instanceof EditorSelection ? config2.selection : EditorSelection.single(config2.selection.anchor, config2.selection.head);
      checkSelection(selection, doc2.length);
      if (!configuration.staticFacet(allowMultipleSelections))
        selection = selection.asSingle();
      return new EditorState(configuration, doc2, selection);
    }
    get tabSize() {
      return this.facet(EditorState.tabSize);
    }
    get lineBreak() {
      return this.facet(EditorState.lineSeparator) || "\n";
    }
    phrase(phrase) {
      for (let map of this.facet(EditorState.phrases))
        if (Object.prototype.hasOwnProperty.call(map, phrase))
          return map[phrase];
      return phrase;
    }
    languageDataAt(name2, pos) {
      let values = [];
      for (let provider of this.facet(languageData)) {
        for (let result of provider(this, pos)) {
          if (Object.prototype.hasOwnProperty.call(result, name2))
            values.push(result[name2]);
        }
      }
      return values;
    }
    charCategorizer(at) {
      return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
    }
  };
  EditorState.allowMultipleSelections = allowMultipleSelections;
  EditorState.tabSize = Facet.define({
    combine: (values) => values.length ? values[0] : 4
  });
  EditorState.lineSeparator = lineSeparator;
  EditorState.phrases = Facet.define();
  EditorState.languageData = languageData;
  EditorState.changeFilter = changeFilter;
  EditorState.transactionFilter = transactionFilter;
  EditorState.transactionExtender = transactionExtender;
  function combineConfig(configs, defaults3, combine = {}) {
    let result = {};
    for (let config2 of configs)
      for (let key of Object.keys(config2)) {
        let value = config2[key], current = result[key];
        if (current === void 0)
          result[key] = value;
        else if (current === value || value === void 0)
          ;
        else if (Object.hasOwnProperty.call(combine, key))
          result[key] = combine[key](current, value);
        else
          throw new Error("Config merge conflict for field " + key);
      }
    for (let key in defaults3)
      if (result[key] === void 0)
        result[key] = defaults3[key];
    return result;
  }

  // node_modules/style-mod/src/style-mod.js
  var C = "\u037C";
  var COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
  var SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
  var top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
  var StyleModule = class {
    constructor(spec, options) {
      this.rules = [];
      let {process, extend: extend2} = options || {};
      function processSelector(selector) {
        if (/^@/.test(selector))
          return [selector];
        let selectors = selector.split(",");
        return process ? selectors.map(process) : selectors;
      }
      function render3(selectors, spec2, target) {
        let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]);
        if (isAt && spec2 == null)
          return target.push(selectors[0] + ";");
        for (let prop in spec2) {
          let value = spec2[prop];
          if (/&/.test(prop)) {
            render3(selectors.map((s) => extend2 ? extend2(prop, s) : prop.replace(/&/, s)), value, target);
          } else if (value && typeof value == "object") {
            if (!isAt)
              throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
            render3(isAt[1] == "keyframes" ? [prop] : processSelector(prop), value, local);
          } else if (value != null) {
            local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()) + ": " + value + ";");
          }
        }
        if (local.length || isAt && isAt[1] == "keyframes")
          target.push(selectors.join(",") + " {" + local.join(" ") + "}");
      }
      for (let prop in spec)
        render3(processSelector(prop), spec[prop], this.rules);
    }
    getRules() {
      return this.rules.join("\n");
    }
    static newName() {
      let id = top[COUNT] || 1;
      top[COUNT] = id + 1;
      return C + id.toString(36);
    }
    static mount(root, modules) {
      (root[SET] || new StyleSet(root)).mount(Array.isArray(modules) ? modules : [modules]);
    }
  };
  var adoptedSet = null;
  var StyleSet = class {
    constructor(root) {
      if (root.adoptedStyleSheets && typeof CSSStyleSheet != "undefined") {
        if (adoptedSet) {
          root.adoptedStyleSheets = [adoptedSet.sheet].concat(root.adoptedStyleSheets);
          return root[SET] = adoptedSet;
        }
        this.sheet = new CSSStyleSheet();
        root.adoptedStyleSheets = [this.sheet].concat(root.adoptedStyleSheets);
        adoptedSet = this;
      } else {
        this.styleTag = (root.ownerDocument || root).createElement("style");
        let target = root.head || root;
        target.insertBefore(this.styleTag, target.firstChild);
      }
      this.modules = [];
      root[SET] = this;
    }
    mount(modules) {
      let sheet = this.sheet;
      let pos = 0, j = 0;
      for (let i = 0; i < modules.length; i++) {
        let mod = modules[i], index2 = this.modules.indexOf(mod);
        if (index2 < j && index2 > -1) {
          this.modules.splice(index2, 1);
          j--;
          index2 = -1;
        }
        if (index2 == -1) {
          this.modules.splice(j++, 0, mod);
          if (sheet)
            for (let k = 0; k < mod.rules.length; k++)
              sheet.insertRule(mod.rules[k], pos++);
        } else {
          while (j < index2)
            pos += this.modules[j++].rules.length;
          pos += mod.rules.length;
          j++;
        }
      }
      if (!sheet) {
        let text9 = "";
        for (let i = 0; i < this.modules.length; i++)
          text9 += this.modules[i].getRules() + "\n";
        this.styleTag.textContent = text9;
      }
    }
  };

  // node_modules/@codemirror/next/rangeset/dist/index.js
  var RangeValue = class {
    eq(other) {
      return this == other;
    }
    range(from, to = from) {
      return new Range(from, to, this);
    }
  };
  RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
  RangeValue.prototype.point = false;
  RangeValue.prototype.mapMode = MapMode.TrackDel;
  var Range = class {
    constructor(from, to, value) {
      this.from = from;
      this.to = to;
      this.value = value;
    }
  };
  function cmpRange(a, b) {
    return a.from - b.from || a.value.startSide - b.value.startSide;
  }
  var ChunkSize = 250;
  var BigPointSize = 500;
  var Far = 1e9;
  var Chunk = class {
    constructor(from, to, value, maxPoint) {
      this.from = from;
      this.to = to;
      this.value = value;
      this.maxPoint = maxPoint;
    }
    get length() {
      return this.to[this.to.length - 1];
    }
    findIndex(pos, end, side = end * Far, startAt = 0) {
      if (pos <= 0)
        return startAt;
      let arr = end < 0 ? this.to : this.from;
      for (let lo = startAt, hi = arr.length; ; ) {
        if (lo == hi)
          return lo;
        let mid = lo + hi >> 1;
        let diff2 = arr[mid] - pos || (end < 0 ? this.value[mid].startSide : this.value[mid].endSide) - side;
        if (mid == lo)
          return diff2 >= 0 ? lo : hi;
        if (diff2 >= 0)
          hi = mid;
        else
          lo = mid + 1;
      }
    }
    between(offset, from, to, f) {
      for (let i = this.findIndex(from, -1), e = this.findIndex(to, 1, void 0, i); i < e; i++)
        if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
          return false;
    }
    map(offset, changes) {
      let value = [], from = [], to = [], newPos = -1, maxPoint = -1;
      for (let i = 0; i < this.value.length; i++) {
        let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
        if (curFrom == curTo) {
          let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
          if (mapped == null)
            continue;
          newFrom = newTo = mapped;
        } else {
          newFrom = changes.mapPos(curFrom, val.startSide);
          newTo = changes.mapPos(curTo, val.endSide);
          if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
            continue;
        }
        if ((newTo - newFrom || val.endSide - val.startSide) < 0)
          continue;
        if (newPos < 0)
          newPos = newFrom;
        if (val.point)
          maxPoint = Math.max(maxPoint, newTo - newFrom);
        value.push(val);
        from.push(newFrom - newPos);
        to.push(newTo - newPos);
      }
      return {mapped: value.length ? new Chunk(from, to, value, maxPoint) : null, pos: newPos};
    }
  };
  var RangeSet = class {
    constructor(chunkPos, chunk, nextLayer = RangeSet.empty, maxPoint) {
      this.chunkPos = chunkPos;
      this.chunk = chunk;
      this.nextLayer = nextLayer;
      this.maxPoint = maxPoint;
    }
    get length() {
      let last = this.chunk.length - 1;
      return last < 0 ? 0 : Math.max(this.chunkEnd(last), this.nextLayer.length);
    }
    get size() {
      if (this == RangeSet.empty)
        return 0;
      let size = this.nextLayer.size;
      for (let chunk of this.chunk)
        size += chunk.value.length;
      return size;
    }
    chunkEnd(index2) {
      return this.chunkPos[index2] + this.chunk[index2].length;
    }
    update(updateSpec) {
      let {add = [], sort = false, filter, filterFrom = 0, filterTo = this.length} = updateSpec;
      if (add.length == 0 && !filter)
        return this;
      if (sort)
        add.slice().sort(cmpRange);
      if (this == RangeSet.empty)
        return add.length ? RangeSet.of(add) : this;
      let cur2 = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
      let builder = new RangeSetBuilder();
      while (cur2.value || i < add.length) {
        if (i < add.length && (cur2.from - add[i].from || cur2.startSide - add[i].value.startSide) >= 0) {
          let range = add[i++];
          if (!builder.addInner(range.from, range.to, range.value))
            spill.push(range);
        } else if (cur2.rangeIndex == 1 && cur2.chunkIndex < this.chunk.length && (i == add.length || this.chunkEnd(cur2.chunkIndex) < add[i].from) && (!filter || filterFrom > this.chunkEnd(cur2.chunkIndex) || filterTo < this.chunkPos[cur2.chunkIndex]) && builder.addChunk(this.chunkPos[cur2.chunkIndex], this.chunk[cur2.chunkIndex])) {
          cur2.nextChunk();
        } else {
          if (!filter || filterFrom > cur2.to || filterTo < cur2.from || filter(cur2.from, cur2.to, cur2.value)) {
            if (!builder.addInner(cur2.from, cur2.to, cur2.value))
              spill.push(new Range(cur2.from, cur2.to, cur2.value));
          }
          cur2.next();
        }
      }
      return builder.finishInner(this.nextLayer == RangeSet.empty && !spill.length ? RangeSet.empty : this.nextLayer.update({add: spill, filter, filterFrom, filterTo}));
    }
    map(changes) {
      if (changes.length == 0 || this == RangeSet.empty)
        return this;
      let chunks = [], chunkPos = [], maxPoint = -1;
      for (let i = 0; i < this.chunk.length; i++) {
        let start = this.chunkPos[i], chunk = this.chunk[i];
        let touch = changes.touchesRange(start, start + chunk.length);
        if (touch === false) {
          maxPoint = Math.max(maxPoint, chunk.maxPoint);
          chunks.push(chunk);
          chunkPos.push(changes.mapPos(start));
        } else if (touch === true) {
          let {mapped, pos} = chunk.map(start, changes);
          if (mapped) {
            maxPoint = Math.max(maxPoint, mapped.maxPoint);
            chunks.push(mapped);
            chunkPos.push(pos);
          }
        }
      }
      let next = this.nextLayer.map(changes);
      return chunks.length == 0 ? next : new RangeSet(chunkPos, chunks, next, maxPoint);
    }
    between(from, to, f) {
      if (this == RangeSet.empty)
        return;
      for (let i = 0; i < this.chunk.length; i++) {
        let start = this.chunkPos[i], chunk = this.chunk[i];
        if (to >= start && from <= start + chunk.length && chunk.between(start, from - start, to - start, f) === false)
          return;
      }
      this.nextLayer.between(from, to, f);
    }
    iter(from = 0) {
      return HeapCursor.from([this]).goto(from);
    }
    static iter(sets, from = 0) {
      return HeapCursor.from(sets).goto(from);
    }
    static compare(oldSets, newSets, textDiff, comparator) {
      var _a;
      let minPoint = (_a = comparator.minPointSize) !== null && _a !== void 0 ? _a : -1;
      let a = oldSets.filter((set) => set.maxPoint >= BigPointSize || set != RangeSet.empty && newSets.indexOf(set) < 0 && set.maxPoint >= minPoint);
      let b = newSets.filter((set) => set.maxPoint >= BigPointSize || set != RangeSet.empty && oldSets.indexOf(set) < 0 && set.maxPoint >= minPoint);
      let sharedChunks = findSharedChunks(a, b);
      let sideA = new SpanCursor(a, sharedChunks, minPoint);
      let sideB = new SpanCursor(b, sharedChunks, minPoint);
      textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
      if (textDiff.empty && textDiff.length == 0)
        compare(sideA, 0, sideB, 0, 0, comparator);
    }
    static spans(sets, from, to, iterator) {
      var _a;
      let cursor = new SpanCursor(sets, null, (_a = iterator.minPointSize) !== null && _a !== void 0 ? _a : -1).goto(from), pos = from;
      let open = cursor.openStart;
      for (; ; ) {
        let curTo = Math.min(cursor.to, to);
        if (cursor.point) {
          iterator.point(pos, curTo, cursor.point, cursor.activeForPoint(cursor.to), open);
          open = cursor.openEnd(curTo) + (cursor.to > curTo ? 1 : 0);
        } else if (curTo > pos) {
          iterator.span(pos, curTo, cursor.active, open);
          open = cursor.openEnd(curTo);
        }
        if (cursor.to > to)
          break;
        pos = cursor.to;
        cursor.next();
      }
      return open;
    }
    static of(ranges, sort = false) {
      let build = new RangeSetBuilder();
      for (let range of ranges instanceof Range ? [ranges] : sort ? ranges.slice().sort(cmpRange) : ranges)
        build.add(range.from, range.to, range.value);
      return build.finish();
    }
  };
  RangeSet.empty = new RangeSet([], [], null, -1);
  RangeSet.empty.nextLayer = RangeSet.empty;
  var RangeSetBuilder = class {
    constructor() {
      this.chunks = [];
      this.chunkPos = [];
      this.chunkStart = -1;
      this.last = null;
      this.lastFrom = -Far;
      this.lastTo = -Far;
      this.from = [];
      this.to = [];
      this.value = [];
      this.maxPoint = -1;
      this.setMaxPoint = -1;
      this.nextLayer = null;
    }
    finishChunk(newArrays) {
      this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
      this.chunkPos.push(this.chunkStart);
      this.chunkStart = -1;
      this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
      this.maxPoint = -1;
      if (newArrays) {
        this.from = [];
        this.to = [];
        this.value = [];
      }
    }
    add(from, to, value) {
      if (!this.addInner(from, to, value))
        (this.nextLayer || (this.nextLayer = new RangeSetBuilder())).add(from, to, value);
    }
    addInner(from, to, value) {
      let diff2 = from - this.lastTo || value.startSide - this.last.endSide;
      if (diff2 <= 0 && (from - this.lastFrom || value.startSide - this.last.startSide) < 0)
        throw new Error("Ranges must be added sorted by `from` position and `startSide`");
      if (diff2 < 0)
        return false;
      if (this.from.length == ChunkSize)
        this.finishChunk(true);
      if (this.chunkStart < 0)
        this.chunkStart = from;
      this.from.push(from - this.chunkStart);
      this.to.push(to - this.chunkStart);
      this.last = value;
      this.lastFrom = from;
      this.lastTo = to;
      this.value.push(value);
      if (value.point)
        this.maxPoint = Math.max(this.maxPoint, to - from);
      return true;
    }
    addChunk(from, chunk) {
      if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
        return false;
      if (this.from.length)
        this.finishChunk(true);
      this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
      this.chunks.push(chunk);
      this.chunkPos.push(from);
      let last = chunk.value.length - 1;
      this.last = chunk.value[last];
      this.lastFrom = chunk.from[last] + from;
      this.lastTo = chunk.to[last] + from;
      return true;
    }
    finish() {
      return this.finishInner(RangeSet.empty);
    }
    finishInner(next) {
      if (this.from.length)
        this.finishChunk(false);
      if (this.chunks.length == 0)
        return next;
      let result = new RangeSet(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
      this.from = null;
      return result;
    }
  };
  function findSharedChunks(a, b) {
    let inA = new Map();
    for (let set of a)
      for (let i = 0; i < set.chunk.length; i++)
        if (set.chunk[i].maxPoint < BigPointSize)
          inA.set(set.chunk[i], set.chunkPos[i]);
    let shared = new Set();
    for (let set of b)
      for (let i = 0; i < set.chunk.length; i++)
        if (inA.get(set.chunk[i]) == set.chunkPos[i])
          shared.add(set.chunk[i]);
    return shared;
  }
  var LayerCursor = class {
    constructor(layer, skip, minPoint, rank = 0) {
      this.layer = layer;
      this.skip = skip;
      this.minPoint = minPoint;
      this.rank = rank;
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    get endSide() {
      return this.value ? this.value.endSide : 0;
    }
    goto(pos, side = -Far) {
      this.chunkIndex = this.rangeIndex = 0;
      this.gotoInner(pos, side, false);
      return this;
    }
    gotoInner(pos, side, forward) {
      while (this.chunkIndex < this.layer.chunk.length) {
        let next = this.layer.chunk[this.chunkIndex];
        if (!(this.skip && this.skip.has(next) || this.layer.chunkEnd(this.chunkIndex) < pos || next.maxPoint < this.minPoint))
          break;
        this.chunkIndex++;
        forward = false;
      }
      let rangeIndex = this.chunkIndex == this.layer.chunk.length ? 0 : this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], -1, side);
      if (!forward || this.rangeIndex < rangeIndex)
        this.rangeIndex = rangeIndex;
      this.next();
    }
    forward(pos, side) {
      if ((this.to - pos || this.endSide - side) < 0)
        this.gotoInner(pos, side, true);
    }
    next() {
      for (; ; ) {
        if (this.chunkIndex == this.layer.chunk.length) {
          this.from = this.to = Far;
          this.value = null;
          break;
        } else {
          let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
          let from = chunkPos + chunk.from[this.rangeIndex];
          this.from = from;
          this.to = chunkPos + chunk.to[this.rangeIndex];
          this.value = chunk.value[this.rangeIndex];
          if (++this.rangeIndex == chunk.value.length) {
            this.chunkIndex++;
            if (this.skip) {
              while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
                this.chunkIndex++;
            }
            this.rangeIndex = 0;
          }
          if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
            break;
        }
      }
    }
    nextChunk() {
      this.chunkIndex++;
      this.rangeIndex = 0;
      this.next();
    }
    compare(other) {
      return this.from - other.from || this.startSide - other.startSide || this.to - other.to || this.endSide - other.endSide;
    }
  };
  var HeapCursor = class {
    constructor(heap) {
      this.heap = heap;
    }
    static from(sets, skip = null, minPoint = -1) {
      let heap = [];
      for (let i = 0; i < sets.length; i++) {
        for (let cur2 = sets[i]; cur2 != RangeSet.empty; cur2 = cur2.nextLayer) {
          if (cur2.maxPoint >= minPoint)
            heap.push(new LayerCursor(cur2, skip, minPoint, i));
        }
      }
      return heap.length == 1 ? heap[0] : new HeapCursor(heap);
    }
    get startSide() {
      return this.value ? this.value.startSide : 0;
    }
    goto(pos, side = -Far) {
      for (let cur2 of this.heap)
        cur2.goto(pos, side);
      for (let i = this.heap.length >> 1; i >= 0; i--)
        heapBubble(this.heap, i);
      this.next();
      return this;
    }
    forward(pos, side) {
      for (let cur2 of this.heap)
        cur2.forward(pos, side);
      for (let i = this.heap.length >> 1; i >= 0; i--)
        heapBubble(this.heap, i);
      if ((this.to - pos || this.value.endSide - side) < 0)
        this.next();
    }
    next() {
      if (this.heap.length == 0) {
        this.from = this.to = Far;
        this.value = null;
        this.rank = -1;
      } else {
        let top2 = this.heap[0];
        this.from = top2.from;
        this.to = top2.to;
        this.value = top2.value;
        this.rank = top2.rank;
        if (top2.value)
          top2.next();
        heapBubble(this.heap, 0);
      }
    }
  };
  function heapBubble(heap, index2) {
    for (let cur2 = heap[index2]; ; ) {
      let childIndex = (index2 << 1) + 1;
      if (childIndex >= heap.length)
        break;
      let child = heap[childIndex];
      if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
        child = heap[childIndex + 1];
        childIndex++;
      }
      if (cur2.compare(child) < 0)
        break;
      heap[childIndex] = cur2;
      heap[index2] = child;
      index2 = childIndex;
    }
  }
  var SpanCursor = class {
    constructor(sets, skip, minPoint) {
      this.minPoint = minPoint;
      this.active = [];
      this.activeTo = [];
      this.activeRank = [];
      this.minActive = -1;
      this.point = null;
      this.pointFrom = 0;
      this.pointRank = 0;
      this.to = -Far;
      this.endSide = 0;
      this.openStart = -1;
      this.cursor = HeapCursor.from(sets, skip, minPoint);
    }
    goto(pos, side = -Far) {
      this.cursor.goto(pos, side);
      this.active.length = this.activeTo.length = this.activeRank.length = 0;
      this.minActive = -1;
      this.to = pos;
      this.endSide = side;
      this.openStart = -1;
      this.next();
      return this;
    }
    forward(pos, side) {
      while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
        this.removeActive(this.minActive);
      this.cursor.forward(pos, side);
    }
    removeActive(index2) {
      remove(this.active, index2);
      remove(this.activeTo, index2);
      remove(this.activeRank, index2);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    addActive(trackOpen) {
      let i = 0, {value, to, rank} = this.cursor;
      while (i < this.activeRank.length && this.activeRank[i] <= rank)
        i++;
      insert(this.active, i, value);
      insert(this.activeTo, i, to);
      insert(this.activeRank, i, rank);
      if (trackOpen)
        insert(trackOpen, i, this.cursor.from);
      this.minActive = findMinIndex(this.active, this.activeTo);
    }
    next() {
      let from = this.to;
      this.point = null;
      let trackOpen = this.openStart < 0 ? [] : null, trackExtra = 0;
      for (; ; ) {
        let a = this.minActive;
        if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
          if (this.activeTo[a] > from) {
            this.to = this.activeTo[a];
            this.endSide = this.active[a].endSide;
            break;
          }
          this.removeActive(a);
          if (trackOpen)
            remove(trackOpen, a);
        } else if (!this.cursor.value) {
          this.to = this.endSide = Far;
          break;
        } else if (this.cursor.from > from) {
          this.to = this.cursor.from;
          this.endSide = this.cursor.startSide;
          break;
        } else {
          let nextVal = this.cursor.value;
          if (!nextVal.point) {
            this.addActive(trackOpen);
            this.cursor.next();
          } else {
            this.point = nextVal;
            this.pointFrom = this.cursor.from;
            this.pointRank = this.cursor.rank;
            this.to = this.cursor.to;
            this.endSide = nextVal.endSide;
            if (this.cursor.from < from)
              trackExtra = 1;
            this.cursor.next();
            if (this.to > from)
              this.forward(this.to, this.endSide);
            break;
          }
        }
      }
      if (trackOpen) {
        let openStart = 0;
        while (openStart < trackOpen.length && trackOpen[openStart] < from)
          openStart++;
        this.openStart = openStart + trackExtra;
      }
    }
    activeForPoint(to) {
      if (!this.active.length)
        return this.active;
      let active = [];
      for (let i = 0; i < this.active.length; i++) {
        if (this.activeRank[i] > this.pointRank)
          break;
        if (this.activeTo[i] > to || this.activeTo[i] == to && this.active[i].endSide > this.point.endSide)
          active.push(this.active[i]);
      }
      return active;
    }
    openEnd(to) {
      let open = 0;
      while (open < this.activeTo.length && this.activeTo[open] > to)
        open++;
      return open;
    }
  };
  function compare(a, startA, b, startB, length, comparator) {
    a.goto(startA);
    b.goto(startB);
    let endB = startB + length;
    let pos = startB, dPos = startB - startA;
    for (; ; ) {
      let diff2 = a.to + dPos - b.to || a.endSide - b.endSide;
      let end = diff2 < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
      if (a.point || b.point) {
        if (!(a.point && b.point && (a.point == b.point || a.point.eq(b.point))))
          comparator.comparePoint(pos, clipEnd, a.point, b.point);
      } else {
        if (clipEnd > pos && !sameValues(a.active, b.active))
          comparator.compareRange(pos, clipEnd, a.active, b.active);
      }
      if (end > endB)
        break;
      pos = end;
      if (diff2 <= 0)
        a.next();
      if (diff2 >= 0)
        b.next();
    }
  }
  function sameValues(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (a[i] != b[i] && !a[i].eq(b[i]))
        return false;
    return true;
  }
  function remove(array, index2) {
    for (let i = index2, e = array.length - 1; i < e; i++)
      array[i] = array[i + 1];
    array.pop();
  }
  function insert(array, index2, value) {
    for (let i = array.length - 1; i >= index2; i--)
      array[i + 1] = array[i];
    array[index2] = value;
  }
  function findMinIndex(value, array) {
    let found = -1, foundPos = Far;
    for (let i = 0; i < array.length; i++)
      if ((array[i] - foundPos || value[i].endSide - value[found].endSide) < 0) {
        found = i;
        foundPos = array[i];
      }
    return found;
  }

  // node_modules/w3c-keyname/index.es.js
  var base = {
    8: "Backspace",
    9: "Tab",
    10: "Enter",
    12: "NumLock",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    44: "PrintScreen",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Meta",
    92: "Meta",
    106: "*",
    107: "+",
    108: ",",
    109: "-",
    110: ".",
    111: "/",
    144: "NumLock",
    145: "ScrollLock",
    160: "Shift",
    161: "Shift",
    162: "Control",
    163: "Control",
    164: "Alt",
    165: "Alt",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    229: "q"
  };
  var shift = {
    48: ")",
    49: "!",
    50: "@",
    51: "#",
    52: "$",
    53: "%",
    54: "^",
    55: "&",
    56: "*",
    57: "(",
    59: ":",
    61: "+",
    173: "_",
    186: ":",
    187: "+",
    188: "<",
    189: "_",
    190: ">",
    191: "?",
    192: "~",
    219: "{",
    220: "|",
    221: "}",
    222: '"',
    229: "Q"
  };
  var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
  var safari = typeof navigator != "undefined" && /Apple Computer/.test(navigator.vendor);
  var gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
  var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
  var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
  var brokenModifierNames = chrome && (mac || +chrome[1] < 57) || gecko && mac;
  for (var i = 0; i < 10; i++)
    base[48 + i] = base[96 + i] = String(i);
  for (var i = 1; i <= 24; i++)
    base[i + 111] = "F" + i;
  for (var i = 65; i <= 90; i++) {
    base[i] = String.fromCharCode(i + 32);
    shift[i] = String.fromCharCode(i);
  }
  for (var code in base)
    if (!shift.hasOwnProperty(code))
      shift[code] = base[code];
  function keyName(event) {
    var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) || (safari || ie) && event.shiftKey && event.key && event.key.length == 1;
    var name2 = !ignoreKey && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
    if (name2 == "Esc")
      name2 = "Escape";
    if (name2 == "Del")
      name2 = "Delete";
    if (name2 == "Left")
      name2 = "ArrowLeft";
    if (name2 == "Up")
      name2 = "ArrowUp";
    if (name2 == "Right")
      name2 = "ArrowRight";
    if (name2 == "Down")
      name2 = "ArrowDown";
    return name2;
  }

  // node_modules/@codemirror/next/view/dist/index.js
  var [nav, doc] = typeof navigator != "undefined" ? [navigator, document] : [{userAgent: "", vendor: "", platform: ""}, {documentElement: {style: {}}}];
  var ie_edge = /Edge\/(\d+)/.exec(nav.userAgent);
  var ie_upto10 = /MSIE \d/.test(nav.userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
  var ie2 = !!(ie_upto10 || ie_11up || ie_edge);
  var gecko2 = !ie2 && /gecko\/(\d+)/i.test(nav.userAgent);
  var chrome2 = !ie2 && /Chrome\/(\d+)/.exec(nav.userAgent);
  var webkit = "webkitFontSmoothing" in doc.documentElement.style;
  var browser = {
    mac: /Mac/.test(nav.platform),
    ie: ie2,
    ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
    gecko: gecko2,
    gecko_version: gecko2 ? +(/Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
    chrome: !!chrome2,
    chrome_version: chrome2 ? +chrome2[1] : 0,
    ios: !ie2 && /AppleWebKit/.test(nav.userAgent) && /Mobile\/\w+/.test(nav.userAgent),
    android: /Android\b/.test(nav.userAgent),
    webkit,
    safari: /Apple Computer/.test(nav.vendor),
    webkit_version: webkit ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
    tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
  };
  function getSelection(root) {
    return root.getSelection ? root.getSelection() : document.getSelection();
  }
  function selectionCollapsed(domSel) {
    let collapsed = domSel.isCollapsed;
    if (collapsed && browser.chrome && domSel.rangeCount && !domSel.getRangeAt(0).collapsed)
      collapsed = false;
    return collapsed;
  }
  function hasSelection(dom6, selection) {
    if (!selection.anchorNode)
      return false;
    try {
      return dom6.contains(selection.anchorNode.nodeType == 3 ? selection.anchorNode.parentNode : selection.anchorNode);
    } catch (_) {
      return false;
    }
  }
  function clientRectsFor(dom6) {
    if (dom6.nodeType == 3) {
      let range = tempRange();
      range.setEnd(dom6, dom6.nodeValue.length);
      range.setStart(dom6, 0);
      return range.getClientRects();
    } else if (dom6.nodeType == 1) {
      return dom6.getClientRects();
    } else {
      return [];
    }
  }
  function isEquivalentPosition(node, off, targetNode, targetOff) {
    return targetNode ? scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1) : false;
  }
  function domIndex(node) {
    for (var index2 = 0; ; index2++) {
      node = node.previousSibling;
      if (!node)
        return index2;
    }
  }
  function scanFor(node, off, targetNode, targetOff, dir) {
    for (; ; ) {
      if (node == targetNode && off == targetOff)
        return true;
      if (off == (dir < 0 ? 0 : maxOffset(node))) {
        if (node.nodeName == "DIV")
          return false;
        let parent = node.parentNode;
        if (!parent || parent.nodeType != 1)
          return false;
        off = domIndex(node) + (dir < 0 ? 0 : 1);
        node = parent;
      } else if (node.nodeType == 1) {
        node = node.childNodes[off + (dir < 0 ? -1 : 0)];
        off = dir < 0 ? maxOffset(node) : 0;
      } else {
        return false;
      }
    }
  }
  function maxOffset(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
  }
  function flattenRect(rect, left) {
    let x = left ? rect.left : rect.right;
    return {left: x, right: x, top: rect.top, bottom: rect.bottom};
  }
  function windowRect(win) {
    return {
      left: 0,
      right: win.innerWidth,
      top: 0,
      bottom: win.innerHeight
    };
  }
  var ScrollSpace = 5;
  function scrollRectIntoView(dom6, rect) {
    let doc2 = dom6.ownerDocument, win = doc2.defaultView;
    for (let cur2 = dom6.parentNode; cur2; ) {
      if (cur2.nodeType == 1) {
        let bounding, top2 = cur2 == document.body;
        if (top2) {
          bounding = windowRect(win);
        } else {
          if (cur2.scrollHeight <= cur2.clientHeight && cur2.scrollWidth <= cur2.clientWidth) {
            cur2 = cur2.parentNode;
            continue;
          }
          let rect2 = cur2.getBoundingClientRect();
          bounding = {
            left: rect2.left,
            right: rect2.left + cur2.clientWidth,
            top: rect2.top,
            bottom: rect2.top + cur2.clientHeight
          };
        }
        let moveX = 0, moveY = 0;
        if (rect.top < bounding.top)
          moveY = -(bounding.top - rect.top + ScrollSpace);
        else if (rect.bottom > bounding.bottom)
          moveY = rect.bottom - bounding.bottom + ScrollSpace;
        if (rect.left < bounding.left)
          moveX = -(bounding.left - rect.left + ScrollSpace);
        else if (rect.right > bounding.right)
          moveX = rect.right - bounding.right + ScrollSpace;
        if (moveX || moveY) {
          if (top2) {
            win.scrollBy(moveX, moveY);
          } else {
            if (moveY) {
              let start = cur2.scrollTop;
              cur2.scrollTop += moveY;
              moveY = cur2.scrollTop - start;
            }
            if (moveX) {
              let start = cur2.scrollLeft;
              cur2.scrollLeft += moveX;
              moveX = cur2.scrollLeft - start;
            }
            rect = {
              left: rect.left - moveX,
              top: rect.top - moveY,
              right: rect.right - moveX,
              bottom: rect.bottom - moveY
            };
          }
        }
        if (top2)
          break;
        cur2 = cur2.parentNode;
      } else if (cur2.nodeType == 11) {
        cur2 = cur2.host;
      } else {
        break;
      }
    }
  }
  var DOMSelection = class {
    constructor() {
      this.anchorNode = null;
      this.anchorOffset = 0;
      this.focusNode = null;
      this.focusOffset = 0;
    }
    eq(domSel) {
      return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
    }
    set(domSel) {
      this.anchorNode = domSel.anchorNode;
      this.anchorOffset = domSel.anchorOffset;
      this.focusNode = domSel.focusNode;
      this.focusOffset = domSel.focusOffset;
    }
  };
  var preventScrollSupported = null;
  function focusPreventScroll(dom6) {
    if (dom6.setActive)
      return dom6.setActive();
    if (preventScrollSupported)
      return dom6.focus(preventScrollSupported);
    let stack = [];
    for (let cur2 = dom6; cur2; cur2 = cur2.parentNode) {
      stack.push(cur2, cur2.scrollTop, cur2.scrollLeft);
      if (cur2 == cur2.ownerDocument)
        break;
    }
    dom6.focus(preventScrollSupported == null ? {
      get preventScroll() {
        preventScrollSupported = {preventScroll: true};
        return true;
      }
    } : void 0);
    if (!preventScrollSupported) {
      preventScrollSupported = false;
      for (let i = 0; i < stack.length; ) {
        let elt2 = stack[i++], top2 = stack[i++], left = stack[i++];
        if (elt2.scrollTop != top2)
          elt2.scrollTop = top2;
        if (elt2.scrollLeft != left)
          elt2.scrollLeft = left;
      }
    }
  }
  var scratchRange;
  function tempRange() {
    return scratchRange || (scratchRange = document.createRange());
  }
  var DOMPos = class {
    constructor(node, offset, precise = true) {
      this.node = node;
      this.offset = offset;
      this.precise = precise;
    }
    static before(dom6, precise) {
      return new DOMPos(dom6.parentNode, domIndex(dom6), precise);
    }
    static after(dom6, precise) {
      return new DOMPos(dom6.parentNode, domIndex(dom6) + 1, precise);
    }
  };
  var none2 = [];
  var ContentView = class {
    constructor() {
      this.parent = null;
      this.dom = null;
      this.dirty = 2;
    }
    get editorView() {
      if (!this.parent)
        throw new Error("Accessing view in orphan content view");
      return this.parent.editorView;
    }
    get overrideDOMText() {
      return null;
    }
    get posAtStart() {
      return this.parent ? this.parent.posBefore(this) : 0;
    }
    get posAtEnd() {
      return this.posAtStart + this.length;
    }
    posBefore(view22) {
      let pos = this.posAtStart;
      for (let child of this.children) {
        if (child == view22)
          return pos;
        pos += child.length + child.breakAfter;
      }
      throw new RangeError("Invalid child in posBefore");
    }
    posAfter(view22) {
      return this.posBefore(view22) + view22.length;
    }
    coordsAt(_pos, _side) {
      return null;
    }
    sync(track) {
      if (this.dirty & 2) {
        let parent = this.dom, pos = null;
        for (let child of this.children) {
          if (child.dirty) {
            let next2 = pos ? pos.nextSibling : parent.firstChild;
            if (next2 && !child.dom && !ContentView.get(next2))
              child.reuseDOM(next2);
            child.sync(track);
            child.dirty = 0;
          }
          if (track && track.node == parent && pos != child.dom)
            track.written = true;
          syncNodeInto(parent, pos, child.dom);
          pos = child.dom;
        }
        let next = pos ? pos.nextSibling : parent.firstChild;
        if (next && track && track.node == parent)
          track.written = true;
        while (next)
          next = rm(next);
      } else if (this.dirty & 1) {
        for (let child of this.children)
          if (child.dirty) {
            child.sync(track);
            child.dirty = 0;
          }
      }
    }
    reuseDOM(_dom) {
      return false;
    }
    localPosFromDOM(node, offset) {
      let after;
      if (node == this.dom) {
        after = this.dom.childNodes[offset];
      } else {
        let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
        for (; ; ) {
          let parent = node.parentNode;
          if (parent == this.dom)
            break;
          if (bias == 0 && parent.firstChild != parent.lastChild) {
            if (node == parent.firstChild)
              bias = -1;
            else
              bias = 1;
          }
          node = parent;
        }
        if (bias < 0)
          after = node;
        else
          after = node.nextSibling;
      }
      if (after == this.dom.firstChild)
        return 0;
      while (after && !ContentView.get(after))
        after = after.nextSibling;
      if (!after)
        return this.length;
      for (let i = 0, pos = 0; ; i++) {
        let child = this.children[i];
        if (child.dom == after)
          return pos;
        pos += child.length + child.breakAfter;
      }
    }
    domBoundsAround(from, to, offset = 0) {
      let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
      for (let i = 0, pos = offset; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (pos < from && end > to)
          return child.domBoundsAround(from, to, pos);
        if (end >= from && fromI == -1) {
          fromI = i;
          fromStart = pos;
        }
        if (end >= to && end != pos && toI == -1) {
          toI = i;
          toEnd = end;
          break;
        }
        pos = end + child.breakAfter;
      }
      return {from: fromStart, to: toEnd < 0 ? offset + this.length : toEnd, startDOM: (fromI ? this.children[fromI - 1].dom.nextSibling : null) || this.dom.firstChild, endDOM: toI < this.children.length - 1 && toI >= 0 ? this.children[toI + 1].dom : null};
    }
    markDirty(andParent = false) {
      if (this.dirty & 2)
        return;
      this.dirty |= 2;
      this.markParentsDirty(andParent);
    }
    markParentsDirty(childList) {
      for (let parent = this.parent; parent; parent = parent.parent) {
        if (childList)
          parent.dirty |= 2;
        if (parent.dirty & 1)
          return;
        parent.dirty |= 1;
        childList = false;
      }
    }
    setParent(parent) {
      if (this.parent != parent) {
        this.parent = parent;
        if (this.dirty)
          this.markParentsDirty(true);
      }
    }
    setDOM(dom6) {
      this.dom = dom6;
      dom6.cmView = this;
    }
    get rootView() {
      for (let v = this; ; ) {
        let parent = v.parent;
        if (!parent)
          return v;
        v = parent;
      }
    }
    replaceChildren(from, to, children = none2) {
      this.markDirty();
      for (let i = from; i < to; i++)
        this.children[i].parent = null;
      this.children.splice(from, to - from, ...children);
      for (let i = 0; i < children.length; i++)
        children[i].setParent(this);
    }
    ignoreMutation(_rec) {
      return false;
    }
    ignoreEvent(_event) {
      return false;
    }
    childCursor(pos = this.length) {
      return new ChildCursor(this.children, pos, this.children.length);
    }
    childPos(pos, bias = 1) {
      return this.childCursor().findPos(pos, bias);
    }
    toString() {
      let name2 = this.constructor.name.replace("View", "");
      return name2 + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (name2 == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
    }
    static get(node) {
      return node.cmView;
    }
  };
  ContentView.prototype.breakAfter = 0;
  function rm(dom6) {
    let next = dom6.nextSibling;
    dom6.parentNode.removeChild(dom6);
    return next;
  }
  function syncNodeInto(parent, after, dom6) {
    let next = after ? after.nextSibling : parent.firstChild;
    if (dom6.parentNode == parent)
      while (next != dom6)
        next = rm(next);
    else
      parent.insertBefore(dom6, next);
  }
  var ChildCursor = class {
    constructor(children, pos, i) {
      this.children = children;
      this.pos = pos;
      this.i = i;
      this.off = 0;
    }
    findPos(pos, bias = 1) {
      for (; ; ) {
        if (pos > this.pos || pos == this.pos && (bias > 0 || this.i == 0 || this.children[this.i - 1].breakAfter)) {
          this.off = pos - this.pos;
          return this;
        }
        let next = this.children[--this.i];
        this.pos -= next.length + next.breakAfter;
      }
    }
  };
  var none$1 = [];
  var InlineView = class extends ContentView {
    become(_other) {
      return false;
    }
    getSide() {
      return 0;
    }
  };
  InlineView.prototype.children = none$1;
  var MaxJoinLen = 256;
  var TextView = class extends InlineView {
    constructor(text9) {
      super();
      this.text = text9;
    }
    get length() {
      return this.text.length;
    }
    createDOM(textDOM) {
      this.setDOM(textDOM || document.createTextNode(this.text));
    }
    sync(track) {
      if (!this.dom)
        this.createDOM();
      if (this.dom.nodeValue != this.text) {
        if (track && track.node == this.dom)
          track.written = true;
        this.dom.nodeValue = this.text;
      }
    }
    reuseDOM(dom6) {
      if (dom6.nodeType != 3)
        return false;
      this.createDOM(dom6);
      return true;
    }
    merge(from, to, source) {
      if (source && (!(source instanceof TextView) || this.length - (to - from) + source.length > MaxJoinLen))
        return false;
      this.text = this.text.slice(0, from) + (source ? source.text : "") + this.text.slice(to);
      this.markDirty();
      return true;
    }
    slice(from) {
      return new TextView(this.text.slice(from));
    }
    localPosFromDOM(node, offset) {
      return node == this.dom ? offset : offset ? this.text.length : 0;
    }
    domAtPos(pos) {
      return new DOMPos(this.dom, pos);
    }
    domBoundsAround(_from, _to, offset) {
      return {from: offset, to: offset + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling};
    }
    coordsAt(pos, side) {
      return textCoords(this.dom, pos, side, this.length);
    }
  };
  var MarkView = class extends InlineView {
    constructor(mark, children = [], length = 0) {
      super();
      this.mark = mark;
      this.children = children;
      this.length = length;
      for (let ch of children)
        ch.setParent(this);
    }
    createDOM() {
      let dom6 = document.createElement(this.mark.tagName);
      if (this.mark.class)
        dom6.className = this.mark.class;
      if (this.mark.attrs)
        for (let name2 in this.mark.attrs)
          dom6.setAttribute(name2, this.mark.attrs[name2]);
      this.setDOM(dom6);
    }
    sync(track) {
      if (!this.dom)
        this.createDOM();
      super.sync(track);
    }
    merge(from, to, source, openStart, openEnd) {
      if (source && (!(source instanceof MarkView && source.mark.eq(this.mark)) || from && openStart <= 0 || to < this.length && openEnd <= 0))
        return false;
      mergeInlineChildren(this, from, to, source ? source.children : none$1, openStart - 1, openEnd - 1);
      this.markDirty();
      return true;
    }
    slice(from) {
      return new MarkView(this.mark, sliceInlineChildren(this.children, from), this.length - from);
    }
    domAtPos(pos) {
      return inlineDOMAtPos(this.dom, this.children, pos);
    }
    coordsAt(pos, side) {
      return coordsInChildren(this, pos, side);
    }
  };
  function textCoords(text9, pos, side, length) {
    let from = pos, to = pos, flatten2 = 0;
    if (pos == 0 && side < 0 || pos == length && side >= 0) {
      if (!(browser.chrome || browser.gecko)) {
        if (pos) {
          from--;
          flatten2 = 1;
        } else {
          to++;
          flatten2 = -1;
        }
      }
    } else {
      if (side < 0)
        from--;
      else
        to++;
    }
    let range = tempRange();
    range.setEnd(text9, to);
    range.setStart(text9, from);
    let rects = range.getClientRects(), rect = rects[(flatten2 ? flatten2 < 0 : side >= 0) ? 0 : rects.length - 1];
    if (browser.safari && !flatten2 && rect.width == 0)
      rect = Array.prototype.find.call(rects, (r) => r.width) || rect;
    return flatten2 ? flattenRect(rect, flatten2 < 0) : rect;
  }
  var WidgetView = class extends InlineView {
    constructor(widget, length, side) {
      super();
      this.widget = widget;
      this.length = length;
      this.side = side;
    }
    static create(widget, length, side) {
      return new (widget.customView || WidgetView)(widget, length, side);
    }
    slice(from) {
      return WidgetView.create(this.widget, this.length - from, this.side);
    }
    sync() {
      if (!this.dom || !this.widget.updateDOM(this.dom)) {
        this.setDOM(this.widget.toDOM(this.editorView));
        this.dom.contentEditable = "false";
      }
    }
    getSide() {
      return this.side;
    }
    merge(from, to, source, openStart, openEnd) {
      if (source && (!(source instanceof WidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
        return false;
      this.length = from + (source ? source.length : 0) + (this.length - to);
      return true;
    }
    become(other) {
      if (other.length == this.length && other instanceof WidgetView && other.side == this.side) {
        if (this.widget.constructor == other.widget.constructor) {
          if (!this.widget.eq(other.widget))
            this.markDirty(true);
          this.widget = other.widget;
          return true;
        }
      }
      return false;
    }
    ignoreMutation() {
      return true;
    }
    ignoreEvent(event) {
      return this.widget.ignoreEvent(event);
    }
    get overrideDOMText() {
      if (this.length == 0)
        return Text.empty;
      let top2 = this;
      while (top2.parent)
        top2 = top2.parent;
      let view22 = top2.editorView, text9 = view22 && view22.state.doc, start = this.posAtStart;
      return text9 ? text9.slice(start, start + this.length) : Text.empty;
    }
    domAtPos(pos) {
      return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    domBoundsAround() {
      return null;
    }
    coordsAt(pos, side) {
      let rects = this.dom.getClientRects(), rect = null;
      for (let i = pos > 0 ? rects.length - 1 : 0; ; i += pos > 0 ? -1 : 1) {
        rect = rects[i];
        if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
          break;
      }
      return pos == 0 && side > 0 || pos == this.length && side <= 0 ? rect : flattenRect(rect, pos == 0);
    }
  };
  var CompositionView = class extends WidgetView {
    domAtPos(pos) {
      return new DOMPos(this.widget.text, pos);
    }
    sync() {
      if (!this.dom)
        this.setDOM(this.widget.toDOM());
    }
    localPosFromDOM(node, offset) {
      return !offset ? 0 : node.nodeType == 3 ? Math.min(offset, this.length) : this.length;
    }
    ignoreMutation() {
      return false;
    }
    get overrideDOMText() {
      return null;
    }
    coordsAt(pos, side) {
      return textCoords(this.widget.text, pos, side, this.length);
    }
  };
  function mergeInlineChildren(parent, from, to, elts, openStart, openEnd) {
    let cur2 = parent.childCursor();
    let {i: toI, off: toOff} = cur2.findPos(to, 1);
    let {i: fromI, off: fromOff} = cur2.findPos(from, -1);
    let dLen = from - to;
    for (let view22 of elts)
      dLen += view22.length;
    parent.length += dLen;
    let {children} = parent;
    if (fromI == toI && fromOff) {
      let start = children[fromI];
      if (elts.length == 1 && start.merge(fromOff, toOff, elts[0], openStart, openEnd))
        return;
      if (elts.length == 0) {
        start.merge(fromOff, toOff, null, openStart, openEnd);
        return;
      }
      let after = start.slice(toOff);
      if (after.merge(0, 0, elts[elts.length - 1], 0, openEnd))
        elts[elts.length - 1] = after;
      else
        elts.push(after);
      toI++;
      openEnd = toOff = 0;
    }
    if (toOff) {
      let end = children[toI];
      if (elts.length && end.merge(0, toOff, elts[elts.length - 1], 0, openEnd)) {
        elts.pop();
        openEnd = 0;
      } else {
        end.merge(0, toOff, null, 0, 0);
      }
    } else if (toI < children.length && elts.length && children[toI].merge(0, 0, elts[elts.length - 1], 0, openEnd)) {
      elts.pop();
      openEnd = 0;
    }
    if (fromOff) {
      let start = children[fromI];
      if (elts.length && start.merge(fromOff, start.length, elts[0], openStart, 0)) {
        elts.shift();
        openStart = 0;
      } else {
        start.merge(fromOff, start.length, null, 0, 0);
      }
      fromI++;
    } else if (fromI && elts.length) {
      let end = children[fromI - 1];
      if (end.merge(end.length, end.length, elts[0], openStart, 0)) {
        elts.shift();
        openStart = 0;
      }
    }
    while (fromI < toI && elts.length && children[toI - 1].become(elts[elts.length - 1])) {
      elts.pop();
      toI--;
      openEnd = 0;
    }
    while (fromI < toI && elts.length && children[fromI].become(elts[0])) {
      elts.shift();
      fromI++;
      openStart = 0;
    }
    if (!elts.length && fromI && toI < children.length && openStart && openEnd && children[toI].merge(0, 0, children[fromI - 1], openStart, openEnd))
      fromI--;
    if (elts.length || fromI != toI)
      parent.replaceChildren(fromI, toI, elts);
  }
  function sliceInlineChildren(children, from) {
    let result = [], off = 0;
    for (let elt2 of children) {
      let end = off + elt2.length;
      if (end > from)
        result.push(off < from ? elt2.slice(from - off) : elt2);
      off = end;
    }
    return result;
  }
  function inlineDOMAtPos(dom6, children, pos) {
    let i = 0;
    for (let off = 0; i < children.length; i++) {
      let child = children[i], end = off + child.length;
      if (end == off && child.getSide() <= 0)
        continue;
      if (pos > off && pos < end && child.dom.parentNode == dom6)
        return child.domAtPos(pos - off);
      if (pos <= off)
        break;
      off = end;
    }
    for (; i > 0; i--) {
      let before = children[i - 1].dom;
      if (before.parentNode == dom6)
        return DOMPos.after(before);
    }
    return new DOMPos(dom6, 0);
  }
  function joinInlineInto(parent, view22, open) {
    let last, {children} = parent;
    if (open > 0 && view22 instanceof MarkView && children.length && (last = children[children.length - 1]) instanceof MarkView && last.mark.eq(view22.mark)) {
      joinInlineInto(last, view22.children[0], open - 1);
    } else {
      children.push(view22);
      view22.setParent(parent);
    }
    parent.length += view22.length;
  }
  function coordsInChildren(view22, pos, side) {
    for (let off = 0, i = 0; i < view22.children.length; i++) {
      let child = view22.children[i], end = off + child.length;
      if (end == off && child.getSide() <= 0)
        continue;
      if (side <= 0 || end == view22.length ? end >= pos : end > pos)
        return child.coordsAt(pos - off, side);
      off = end;
    }
    return (view22.dom.lastChild || view22.dom).getBoundingClientRect();
  }
  function combineAttrs(source, target) {
    for (let name2 in source) {
      if (name2 == "class" && target.class)
        target.class += " " + source.class;
      else if (name2 == "style" && target.style)
        target.style += ";" + source.style;
      else
        target[name2] = source[name2];
    }
    return target;
  }
  function attrsEq(a, b) {
    if (a == b)
      return true;
    if (!a || !b)
      return false;
    let keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length != keysB.length)
      return false;
    for (let key of keysA) {
      if (keysB.indexOf(key) == -1 || a[key] !== b[key])
        return false;
    }
    return true;
  }
  function updateAttrs(dom6, prev, attrs) {
    if (prev) {
      for (let name2 in prev)
        if (!(attrs && name2 in attrs))
          dom6.removeAttribute(name2);
    }
    if (attrs) {
      for (let name2 in attrs)
        if (!(prev && prev[name2] == attrs[name2]))
          dom6.setAttribute(name2, attrs[name2]);
    }
  }
  var WidgetType = class {
    eq(_widget) {
      return false;
    }
    updateDOM(_dom) {
      return false;
    }
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    get estimatedHeight() {
      return -1;
    }
    ignoreEvent(_event) {
      return true;
    }
    get customView() {
      return null;
    }
  };
  var BlockType;
  (function(BlockType2) {
    BlockType2[BlockType2["Text"] = 0] = "Text";
    BlockType2[BlockType2["WidgetBefore"] = 1] = "WidgetBefore";
    BlockType2[BlockType2["WidgetAfter"] = 2] = "WidgetAfter";
    BlockType2[BlockType2["WidgetRange"] = 3] = "WidgetRange";
  })(BlockType || (BlockType = {}));
  var Decoration = class extends RangeValue {
    constructor(startSide, endSide, widget, spec) {
      super();
      this.startSide = startSide;
      this.endSide = endSide;
      this.widget = widget;
      this.spec = spec;
    }
    get heightRelevant() {
      return false;
    }
    static mark(spec) {
      return new MarkDecoration(spec);
    }
    static widget(spec) {
      let side = spec.side || 0;
      if (spec.block)
        side += (2e8 + 1) * (side > 0 ? 1 : -1);
      return new PointDecoration(spec, side, side, !!spec.block, spec.widget || null, false);
    }
    static replace(spec) {
      let block = !!spec.block;
      let {start, end} = getInclusive(spec);
      let startSide = block ? -2e8 * (start ? 2 : 1) : 1e8 * (start ? -1 : 1);
      let endSide = block ? 2e8 * (end ? 2 : 1) : 1e8 * (end ? 1 : -1);
      return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
    }
    static line(spec) {
      return new LineDecoration(spec);
    }
    static set(of, sort = false) {
      return RangeSet.of(of, sort);
    }
    hasHeight() {
      return this.widget ? this.widget.estimatedHeight > -1 : false;
    }
  };
  Decoration.none = RangeSet.empty;
  var MarkDecoration = class extends Decoration {
    constructor(spec) {
      let {start, end} = getInclusive(spec);
      super(1e8 * (start ? -1 : 1), 1e8 * (end ? 1 : -1), null, spec);
      this.tagName = spec.tagName || "span";
      this.class = spec.class || "";
      this.attrs = spec.attributes || null;
    }
    eq(other) {
      return this == other || other instanceof MarkDecoration && this.tagName == other.tagName && this.class == other.class && attrsEq(this.attrs, other.attrs);
    }
    range(from, to = from) {
      if (from >= to)
        throw new RangeError("Mark decorations may not be empty");
      return super.range(from, to);
    }
  };
  MarkDecoration.prototype.point = false;
  var LineDecoration = class extends Decoration {
    constructor(spec) {
      super(-1e8, -1e8, null, spec);
    }
    eq(other) {
      return other instanceof LineDecoration && attrsEq(this.spec.attributes, other.spec.attributes);
    }
    range(from, to = from) {
      if (to != from)
        throw new RangeError("Line decoration ranges must be zero-length");
      return super.range(from, to);
    }
  };
  LineDecoration.prototype.mapMode = MapMode.TrackBefore;
  LineDecoration.prototype.point = true;
  var PointDecoration = class extends Decoration {
    constructor(spec, startSide, endSide, block, widget, isReplace) {
      super(startSide, endSide, widget, spec);
      this.block = block;
      this.isReplace = isReplace;
      this.mapMode = !block ? MapMode.TrackDel : startSide < 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
    }
    get type() {
      return this.startSide < this.endSide ? BlockType.WidgetRange : this.startSide < 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
    }
    get heightRelevant() {
      return this.block || !!this.widget && this.widget.estimatedHeight >= 5;
    }
    eq(other) {
      return other instanceof PointDecoration && widgetsEq(this.widget, other.widget) && this.block == other.block && this.startSide == other.startSide && this.endSide == other.endSide;
    }
    range(from, to = from) {
      if (this.isReplace && (from > to || from == to && this.startSide > 0 && this.endSide < 0))
        throw new RangeError("Invalid range for replacement decoration");
      if (!this.isReplace && to != from)
        throw new RangeError("Widget decorations can only have zero-length ranges");
      return super.range(from, to);
    }
  };
  PointDecoration.prototype.point = true;
  function getInclusive(spec) {
    let {inclusiveStart: start, inclusiveEnd: end} = spec;
    if (start == null)
      start = spec.inclusive;
    if (end == null)
      end = spec.inclusive;
    return {start: start || false, end: end || false};
  }
  function widgetsEq(a, b) {
    return a == b || !!(a && b && a.compare(b));
  }
  var MinRangeGap = 4;
  function addRange(from, to, ranges) {
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last] + MinRangeGap > from)
      ranges[last] = Math.max(ranges[last], to);
    else
      ranges.push(from, to);
  }
  var theme = Facet.define({combine: (strs) => strs.join(" ")});
  var darkTheme = Facet.define({combine: (values) => values.indexOf(true) > -1});
  var baseThemeID = StyleModule.newName();
  function expandThemeClasses(sel) {
    return sel.replace(/\$\w[\w\.]*/g, (cls) => {
      let parts5 = cls.slice(1).split("."), result = "";
      for (let i = 1; i <= parts5.length; i++)
        result += ".cm-" + parts5.slice(0, i).join("-");
      return result;
    });
  }
  function buildTheme(main, spec) {
    return new StyleModule(spec, {
      process(sel) {
        sel = expandThemeClasses(sel);
        return /\$/.test(sel) ? sel.replace(/\$/, main) : main + " " + sel;
      },
      extend(template6, sel) {
        template6 = expandThemeClasses(template6);
        return sel.slice(0, main.length + 1) == main + " " ? main + " " + template6.replace(/&/, sel.slice(main.length + 1)) : template6.replace(/&/, sel);
      }
    });
  }
  function themeClass(selector) {
    if (selector.indexOf(".") < 0)
      return "cm-" + selector;
    let parts5 = selector.split("."), result = "";
    for (let i = 1; i <= parts5.length; i++)
      result += (result ? " " : "") + "cm-" + parts5.slice(0, i).join("-");
    return result;
  }
  var baseTheme = buildTheme("." + baseThemeID, {
    $: {
      position: "relative !important",
      boxSizing: "border-box",
      "&$focused": {
        outline_fallback: "1px dotted #212121",
        outline: "5px auto -webkit-focus-ring-color"
      },
      display: "flex !important",
      flexDirection: "column"
    },
    $scroller: {
      display: "flex !important",
      alignItems: "flex-start !important",
      fontFamily: "monospace",
      lineHeight: 1.4,
      height: "100%",
      overflowX: "auto",
      position: "relative",
      zIndex: 0
    },
    $content: {
      margin: 0,
      flexGrow: 2,
      minHeight: "100%",
      display: "block",
      whiteSpace: "pre",
      boxSizing: "border-box",
      padding: "4px 0",
      outline: "none"
    },
    "$$light $content": {caretColor: "black"},
    "$$dark $content": {caretColor: "white"},
    $line: {
      display: "block",
      padding: "0 2px 0 4px"
    },
    $selectionLayer: {
      zIndex: -1,
      contain: "size style"
    },
    $selectionBackground: {
      position: "absolute"
    },
    "$$light $selectionBackground": {
      background: "#d9d9d9"
    },
    "$$dark $selectionBackground": {
      background: "#222"
    },
    "$$focused$light $selectionBackground": {
      background: "#d7d4f0"
    },
    "$$focused$dark $selectionBackground": {
      background: "#233"
    },
    $cursorLayer: {
      zIndex: 100,
      contain: "size style",
      pointerEvents: "none"
    },
    "$$focused $cursorLayer": {
      animation: "steps(1) cm-blink 1.2s infinite"
    },
    "@keyframes cm-blink": {"0%": {}, "50%": {visibility: "hidden"}, "100%": {}},
    "@keyframes cm-blink2": {"0%": {}, "50%": {visibility: "hidden"}, "100%": {}},
    $cursor: {
      position: "absolute",
      borderLeft: "1.2px solid #bbb",
      marginLeft: "-0.6px",
      pointerEvents: "none"
    },
    "$$dark $cursor": {
      borderLeftColor: "#444"
    },
    "$$focused $cursor": {
      borderLeft: "1.2px solid black"
    },
    $placeholder: {
      color: "#888",
      display: "inline-block"
    },
    $button: {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      padding: ".2em 1em",
      borderRadius: "3px"
    },
    "$$light $button": {
      backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
      }
    },
    "$$dark $button": {
      backgroundImage: "linear-gradient(#555, #111)",
      border: "1px solid #888",
      "&:active": {
        backgroundImage: "linear-gradient(#111, #333)"
      }
    },
    $textfield: {
      verticalAlign: "middle",
      color: "inherit",
      fontSize: "70%",
      border: "1px solid silver",
      padding: ".2em .5em"
    },
    "$$light $textfield": {
      backgroundColor: "white"
    },
    "$$dark $textfield": {
      border: "1px solid #555",
      backgroundColor: "inherit"
    }
  });
  var LineClass = themeClass("line");
  var LineView = class extends ContentView {
    constructor() {
      super(...arguments);
      this.children = [];
      this.length = 0;
      this.prevAttrs = void 0;
      this.attrs = null;
      this.breakAfter = 0;
    }
    merge(from, to, source, takeDeco, openStart, openEnd) {
      if (source) {
        if (!(source instanceof LineView))
          return false;
        if (!this.dom)
          source.transferDOM(this);
      }
      if (takeDeco)
        this.setDeco(source ? source.attrs : null);
      mergeInlineChildren(this, from, to, source ? source.children : none$2, openStart, openEnd);
      return true;
    }
    split(at) {
      let end = new LineView();
      end.breakAfter = this.breakAfter;
      if (this.length == 0)
        return end;
      let {i, off} = this.childPos(at);
      if (off) {
        end.append(this.children[i].slice(off), 0);
        this.children[i].merge(off, this.children[i].length, null, 0, 0);
        i++;
      }
      for (let j = i; j < this.children.length; j++)
        end.append(this.children[j], 0);
      while (i > 0 && this.children[i - 1].length == 0) {
        this.children[i - 1].parent = null;
        i--;
      }
      this.children.length = i;
      this.markDirty();
      this.length = at;
      return end;
    }
    transferDOM(other) {
      if (!this.dom)
        return;
      other.setDOM(this.dom);
      other.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs;
      this.prevAttrs = void 0;
      this.dom = null;
    }
    setDeco(attrs) {
      if (!attrsEq(this.attrs, attrs)) {
        if (this.dom) {
          this.prevAttrs = this.attrs;
          this.markDirty();
        }
        this.attrs = attrs;
      }
    }
    append(child, openStart) {
      joinInlineInto(this, child, openStart);
    }
    addLineDeco(deco) {
      let attrs = deco.spec.attributes;
      if (attrs)
        this.attrs = combineAttrs(attrs, this.attrs || {});
    }
    domAtPos(pos) {
      return inlineDOMAtPos(this.dom, this.children, pos);
    }
    sync(track) {
      if (!this.dom) {
        this.setDOM(document.createElement("div"));
        this.dom.className = LineClass;
        this.prevAttrs = this.attrs ? null : void 0;
      }
      if (this.prevAttrs !== void 0) {
        updateAttrs(this.dom, this.prevAttrs, this.attrs);
        this.dom.classList.add(LineClass);
        this.prevAttrs = void 0;
      }
      super.sync(track);
      let last = this.dom.lastChild;
      if (!last || last.nodeName != "BR" && ContentView.get(last) instanceof WidgetView) {
        let hack = document.createElement("BR");
        hack.cmIgnore = true;
        this.dom.appendChild(hack);
      }
    }
    measureTextSize() {
      if (this.children.length == 0 || this.length > 20)
        return null;
      let totalWidth = 0;
      for (let child of this.children) {
        if (!(child instanceof TextView))
          return null;
        let rects = clientRectsFor(child.dom);
        if (rects.length != 1)
          return null;
        totalWidth += rects[0].width;
      }
      return {lineHeight: this.dom.getBoundingClientRect().height, charWidth: totalWidth / this.length};
    }
    coordsAt(pos, side) {
      return coordsInChildren(this, pos, side);
    }
    match(_other) {
      return false;
    }
    get type() {
      return BlockType.Text;
    }
    static find(docView, pos) {
      for (let i = 0, off = 0; ; i++) {
        let block = docView.children[i], end = off + block.length;
        if (end >= pos) {
          if (block instanceof LineView)
            return block;
          if (block.length)
            return null;
        }
        off = end + block.breakAfter;
      }
    }
  };
  var none$2 = [];
  var BlockWidgetView = class extends ContentView {
    constructor(widget, length, type) {
      super();
      this.widget = widget;
      this.length = length;
      this.type = type;
      this.breakAfter = 0;
    }
    merge(from, to, source, _takeDeco, openStart, openEnd) {
      if (source && (!(source instanceof BlockWidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
        return false;
      this.length = from + (source ? source.length : 0) + (this.length - to);
      return true;
    }
    domAtPos(pos) {
      return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
    }
    split(at) {
      let len = this.length - at;
      this.length = at;
      return new BlockWidgetView(this.widget, len, this.type);
    }
    get children() {
      return none$2;
    }
    sync() {
      if (!this.dom || !this.widget.updateDOM(this.dom)) {
        this.setDOM(this.widget.toDOM(this.editorView));
        this.dom.contentEditable = "false";
      }
    }
    get overrideDOMText() {
      return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : Text.empty;
    }
    domBoundsAround() {
      return null;
    }
    match(other) {
      if (other instanceof BlockWidgetView && other.type == this.type && other.widget.constructor == this.widget.constructor) {
        if (!other.widget.eq(this.widget))
          this.markDirty(true);
        this.widget = other.widget;
        this.length = other.length;
        this.breakAfter = other.breakAfter;
        return true;
      }
      return false;
    }
    ignoreMutation() {
      return true;
    }
    ignoreEvent(event) {
      return this.widget.ignoreEvent(event);
    }
  };
  var ContentBuilder = class {
    constructor(doc2, pos, end) {
      this.doc = doc2;
      this.pos = pos;
      this.end = end;
      this.content = [];
      this.curLine = null;
      this.breakAtStart = 0;
      this.openStart = -1;
      this.openEnd = -1;
      this.text = "";
      this.textOff = 0;
      this.cursor = doc2.iter();
      this.skip = pos;
    }
    posCovered() {
      if (this.content.length == 0)
        return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
      let last = this.content[this.content.length - 1];
      return !last.breakAfter && !(last instanceof BlockWidgetView && last.type == BlockType.WidgetBefore);
    }
    getLine() {
      if (!this.curLine)
        this.content.push(this.curLine = new LineView());
      return this.curLine;
    }
    addWidget(view22) {
      this.curLine = null;
      this.content.push(view22);
    }
    finish() {
      if (!this.posCovered())
        this.getLine();
    }
    wrapMarks(view22, active) {
      for (let i = active.length - 1; i >= 0; i--)
        view22 = new MarkView(active[i], [view22], view22.length);
      return view22;
    }
    buildText(length, active, openStart) {
      while (length > 0) {
        if (this.textOff == this.text.length) {
          let {value, lineBreak, done} = this.cursor.next(this.skip);
          this.skip = 0;
          if (done)
            throw new Error("Ran out of text content when drawing inline views");
          if (lineBreak) {
            if (!this.posCovered())
              this.getLine();
            if (this.content.length)
              this.content[this.content.length - 1].breakAfter = 1;
            else
              this.breakAtStart = 1;
            this.curLine = null;
            length--;
            continue;
          } else {
            this.text = value;
            this.textOff = 0;
          }
        }
        let take = Math.min(this.text.length - this.textOff, length);
        this.getLine().append(this.wrapMarks(new TextView(this.text.slice(this.textOff, this.textOff + take)), active), openStart);
        length -= take;
        this.textOff += take;
      }
    }
    span(from, to, active, openStart) {
      this.buildText(to - from, active, openStart);
      this.pos = to;
      if (this.openStart < 0)
        this.openStart = openStart;
    }
    point(from, to, deco, active, openStart) {
      let len = to - from;
      if (deco instanceof PointDecoration) {
        if (deco.block) {
          let {type} = deco;
          if (type == BlockType.WidgetAfter && !this.posCovered())
            this.getLine();
          this.addWidget(new BlockWidgetView(deco.widget || new NullWidget("div"), len, type));
        } else {
          let widget = this.wrapMarks(WidgetView.create(deco.widget || new NullWidget("span"), len, deco.startSide), active);
          this.getLine().append(widget, openStart);
        }
      } else if (this.doc.lineAt(this.pos).from == this.pos) {
        this.getLine().addLineDeco(deco);
      }
      if (len) {
        if (this.textOff + len <= this.text.length) {
          this.textOff += len;
        } else {
          this.skip += len - (this.text.length - this.textOff);
          this.text = "";
          this.textOff = 0;
        }
        this.pos = to;
      }
      if (this.openStart < 0)
        this.openStart = openStart;
    }
    static build(text9, from, to, decorations4) {
      let builder = new ContentBuilder(text9, from, to);
      builder.openEnd = RangeSet.spans(decorations4, from, to, builder);
      if (builder.openStart < 0)
        builder.openStart = builder.openEnd;
      builder.finish();
      return builder;
    }
  };
  var NullWidget = class extends WidgetType {
    constructor(tag) {
      super();
      this.tag = tag;
    }
    eq(other) {
      return other.tag == this.tag;
    }
    toDOM() {
      return document.createElement(this.tag);
    }
    updateDOM(elt2) {
      return elt2.nodeName.toLowerCase() == this.tag;
    }
  };
  var Direction;
  (function(Direction2) {
    Direction2[Direction2["LTR"] = 0] = "LTR";
    Direction2[Direction2["RTL"] = 1] = "RTL";
  })(Direction || (Direction = {}));
  var LTR = Direction.LTR;
  var RTL = Direction.RTL;
  function dec(str) {
    let result = [];
    for (let i = 0; i < str.length; i++)
      result.push(1 << +str[i]);
    return result;
  }
  var LowTypes = dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
  var ArabicTypes = dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
  function charType(ch) {
    return ch <= 247 ? LowTypes[ch] : 1424 <= ch && ch <= 1524 ? 2 : 1536 <= ch && ch <= 1785 ? ArabicTypes[ch - 1536] : 1774 <= ch && ch <= 2220 ? 4 : 8192 <= ch && ch <= 8203 ? 256 : ch == 8204 ? 256 : 1;
  }
  var BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
  var BidiSpan = class {
    constructor(from, to, level) {
      this.from = from;
      this.to = to;
      this.level = level;
    }
    get dir() {
      return this.level % 2 ? RTL : LTR;
    }
    side(end, dir) {
      return this.dir == dir == end ? this.to : this.from;
    }
    static find(order, index2, level, assoc) {
      let maybe = -1;
      for (let i = 0; i < order.length; i++) {
        let span = order[i];
        if (span.from <= index2 && span.to >= index2) {
          if (span.level == level)
            return i;
          if (maybe < 0 || (assoc != 0 ? assoc < 0 ? span.from < index2 : span.to > index2 : order[maybe].level > span.level))
            maybe = i;
        }
      }
      if (maybe < 0)
        throw new RangeError("Index out of range");
      return maybe;
    }
  };
  var types = [];
  function computeOrder(line, direction) {
    let len = line.length, outerType = direction == LTR ? 1 : 2;
    if (!line || outerType == 1 && !BidiRE.test(line))
      return trivialOrder(len);
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
      let type = charType(line.charCodeAt(i));
      if (type == 512)
        type = prev;
      else if (type == 8 && prevStrong == 4)
        type = 16;
      types[i] = type == 4 ? 2 : type;
      if (type & 7)
        prevStrong = type;
      prev = type;
    }
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
      let type = types[i];
      if (type == 128) {
        if (i < len - 1 && prev == types[i + 1] && prev & 24)
          type = types[i] = prev;
        else
          types[i] = 256;
      } else if (type == 64) {
        let end = i + 1;
        while (end < len && types[end] == 64)
          end++;
        let replace = i && prev == 8 || end < len && types[end] == 8 ? prevStrong == 1 ? 1 : 8 : 256;
        for (let j = i; j < end; j++)
          types[j] = replace;
        i = end - 1;
      } else if (type == 8 && prevStrong == 1) {
        types[i] = 1;
      }
      prev = type;
      if (type & 7)
        prevStrong = type;
    }
    for (let i = 0; i < len; i++) {
      if (types[i] == 256) {
        let end = i + 1;
        while (end < len && types[end] == 256)
          end++;
        let beforeL = (i ? types[i - 1] : outerType) == 1;
        let afterL = (end < len ? types[end] : outerType) == 1;
        let replace = beforeL == afterL ? beforeL ? 1 : 2 : outerType;
        for (let j = i; j < end; j++)
          types[j] = replace;
        i = end - 1;
      }
    }
    let order = [];
    if (outerType == 1) {
      for (let i = 0; i < len; ) {
        let start = i, rtl = types[i++] != 1;
        while (i < len && rtl == (types[i] != 1))
          i++;
        if (rtl) {
          for (let j = i; j > start; ) {
            let end = j, l = types[--j] != 2;
            while (j > start && l == (types[j - 1] != 2))
              j--;
            order.push(new BidiSpan(j, end, l ? 2 : 1));
          }
        } else {
          order.push(new BidiSpan(start, i, 0));
        }
      }
    } else {
      for (let i = 0; i < len; ) {
        let start = i, rtl = types[i++] == 2;
        while (i < len && rtl == (types[i] == 2))
          i++;
        order.push(new BidiSpan(start, i, rtl ? 1 : 2));
      }
    }
    return order;
  }
  function trivialOrder(length) {
    return [new BidiSpan(0, length, 0)];
  }
  var movedOver = "";
  function moveVisually(line, order, dir, start, forward) {
    var _a;
    let startIndex = start.head - line.from, spanI = -1;
    if (startIndex == 0) {
      if (!forward || !line.length)
        return null;
      if (order[0].level != dir) {
        startIndex = order[0].side(false, dir);
        spanI = 0;
      }
    } else if (startIndex == line.length) {
      if (forward)
        return null;
      let last = order[order.length - 1];
      if (last.level != dir) {
        startIndex = last.side(true, dir);
        spanI = order.length - 1;
      }
    }
    if (spanI < 0)
      spanI = BidiSpan.find(order, startIndex, (_a = start.bidiLevel) !== null && _a !== void 0 ? _a : -1, start.assoc);
    let span = order[spanI];
    if (startIndex == span.side(forward, dir)) {
      span = order[spanI += forward ? 1 : -1];
      startIndex = span.side(!forward, dir);
    }
    let indexForward = forward == (span.dir == dir);
    let nextIndex = line.findClusterBreak(startIndex, indexForward);
    movedOver = line.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
    if (nextIndex != span.side(forward, dir))
      return EditorSelection.cursor(nextIndex + line.from, indexForward ? -1 : 1, span.level);
    let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
    if (!nextSpan && span.level != dir)
      return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1, dir);
    if (nextSpan && nextSpan.level < span.level)
      return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, 0, nextSpan.level);
    return EditorSelection.cursor(nextIndex + line.from, 0, span.level);
  }
  var wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line"];
  var HeightOracle = class {
    constructor() {
      this.doc = Text.empty;
      this.lineWrapping = false;
      this.direction = Direction.LTR;
      this.heightSamples = {};
      this.lineHeight = 14;
      this.charWidth = 7;
      this.lineLength = 30;
      this.heightChanged = false;
    }
    heightForGap(from, to) {
      let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
      if (this.lineWrapping)
        lines += Math.ceil((to - from - lines * this.lineLength * 0.5) / this.lineLength);
      return this.lineHeight * lines;
    }
    heightForLine(length) {
      if (!this.lineWrapping)
        return this.lineHeight;
      let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / (this.lineLength - 5)));
      return lines * this.lineHeight;
    }
    setDoc(doc2) {
      this.doc = doc2;
      return this;
    }
    mustRefresh(lineHeights, whiteSpace, direction) {
      let newHeight = false;
      for (let i = 0; i < lineHeights.length; i++) {
        let h = lineHeights[i];
        if (h < 0) {
          i++;
        } else if (!this.heightSamples[Math.floor(h * 10)]) {
          newHeight = true;
          this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return newHeight || wrappingWhiteSpace.indexOf(whiteSpace) > -1 != this.lineWrapping || this.direction != direction;
    }
    refresh(whiteSpace, direction, lineHeight, charWidth, lineLength, knownHeights) {
      let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
      let changed = Math.round(lineHeight) != Math.round(this.lineHeight) || this.lineWrapping != lineWrapping || this.direction != direction;
      this.lineWrapping = lineWrapping;
      this.direction = direction;
      this.lineHeight = lineHeight;
      this.charWidth = charWidth;
      this.lineLength = lineLength;
      if (changed) {
        this.heightSamples = {};
        for (let i = 0; i < knownHeights.length; i++) {
          let h = knownHeights[i];
          if (h < 0)
            i++;
          else
            this.heightSamples[Math.floor(h * 10)] = true;
        }
      }
      return changed;
    }
  };
  var MeasuredHeights = class {
    constructor(from, heights) {
      this.from = from;
      this.heights = heights;
      this.index = 0;
    }
    get more() {
      return this.index < this.heights.length;
    }
  };
  var BlockInfo = class {
    constructor(from, length, top2, height, type) {
      this.from = from;
      this.length = length;
      this.top = top2;
      this.height = height;
      this.type = type;
    }
    get to() {
      return this.from + this.length;
    }
    get bottom() {
      return this.top + this.height;
    }
    join(other) {
      let detail = (Array.isArray(this.type) ? this.type : [this]).concat(Array.isArray(other.type) ? other.type : [other]);
      return new BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, detail);
    }
  };
  var QueryType;
  (function(QueryType2) {
    QueryType2[QueryType2["ByPos"] = 0] = "ByPos";
    QueryType2[QueryType2["ByHeight"] = 1] = "ByHeight";
    QueryType2[QueryType2["ByPosNoHeight"] = 2] = "ByPosNoHeight";
  })(QueryType || (QueryType = {}));
  var Epsilon = 1e-4;
  var HeightMap = class {
    constructor(length, height, flags = 2) {
      this.length = length;
      this.height = height;
      this.flags = flags;
    }
    get outdated() {
      return (this.flags & 2) > 0;
    }
    set outdated(value) {
      this.flags = (value ? 2 : 0) | this.flags & ~2;
    }
    setHeight(oracle, height) {
      if (this.height != height) {
        if (Math.abs(this.height - height) > Epsilon)
          oracle.heightChanged = true;
        this.height = height;
      }
    }
    replace(_from, _to, nodes) {
      return HeightMap.of(nodes);
    }
    decomposeLeft(_to, result) {
      result.push(this);
    }
    decomposeRight(_from, result) {
      result.push(this);
    }
    applyChanges(decorations4, oldDoc, oracle, changes) {
      let me = this;
      for (let i = changes.length - 1; i >= 0; i--) {
        let {fromA, toA, fromB, toB} = changes[i];
        let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
        let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
        toB += end.to - toA;
        toA = end.to;
        while (i > 0 && start.from <= changes[i - 1].toA) {
          fromA = changes[i - 1].fromA;
          fromB = changes[i - 1].fromB;
          i--;
          if (fromA < start.from)
            start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
        }
        fromB += start.from - fromA;
        fromA = start.from;
        let nodes = NodeBuilder.build(oracle, decorations4, fromB, toB);
        me = me.replace(fromA, toA, nodes);
      }
      return me.updateHeight(oracle, 0);
    }
    static empty() {
      return new HeightMapText(0, 0);
    }
    static of(nodes) {
      if (nodes.length == 1)
        return nodes[0];
      let i = 0, j = nodes.length, before = 0, after = 0;
      for (; ; ) {
        if (i == j) {
          if (before > after * 2) {
            let split = nodes[i - 1];
            if (split.break)
              nodes.splice(--i, 1, split.left, null, split.right);
            else
              nodes.splice(--i, 1, split.left, split.right);
            j += 1 + split.break;
            before -= split.size;
          } else if (after > before * 2) {
            let split = nodes[j];
            if (split.break)
              nodes.splice(j, 1, split.left, null, split.right);
            else
              nodes.splice(j, 1, split.left, split.right);
            j += 2 + split.break;
            after -= split.size;
          } else {
            break;
          }
        } else if (before < after) {
          let next = nodes[i++];
          if (next)
            before += next.size;
        } else {
          let next = nodes[--j];
          if (next)
            after += next.size;
        }
      }
      let brk = 0;
      if (nodes[i - 1] == null) {
        brk = 1;
        i--;
      } else if (nodes[i] == null) {
        brk = 1;
        j++;
      }
      return new HeightMapBranch(HeightMap.of(nodes.slice(0, i)), brk, HeightMap.of(nodes.slice(j)));
    }
  };
  HeightMap.prototype.size = 1;
  var HeightMapBlock = class extends HeightMap {
    constructor(length, height, type) {
      super(length, height);
      this.type = type;
    }
    blockAt(_height, _doc, top2, offset) {
      return new BlockInfo(offset, this.length, top2, this.height, this.type);
    }
    lineAt(_value, _type, doc2, top2, offset) {
      return this.blockAt(0, doc2, top2, offset);
    }
    forEachLine(_from, _to, doc2, top2, offset, f) {
      f(this.blockAt(0, doc2, top2, offset));
    }
    updateHeight(oracle, offset = 0, _force = false, measured) {
      if (measured && measured.from <= offset && measured.more)
        this.setHeight(oracle, measured.heights[measured.index++]);
      this.outdated = false;
      return this;
    }
    toString() {
      return `block(${this.length})`;
    }
  };
  var HeightMapText = class extends HeightMapBlock {
    constructor(length, height) {
      super(length, height, BlockType.Text);
      this.collapsed = 0;
      this.widgetHeight = 0;
    }
    replace(_from, _to, nodes) {
      let node = nodes[0];
      if (nodes.length == 1 && (node instanceof HeightMapText || node instanceof HeightMapGap && node.flags & 4) && Math.abs(this.length - node.length) < 10) {
        if (node instanceof HeightMapGap)
          node = new HeightMapText(node.length, this.height);
        else
          node.height = this.height;
        if (!this.outdated)
          node.outdated = false;
        return node;
      } else {
        return HeightMap.of(nodes);
      }
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      if (measured && measured.from <= offset && measured.more)
        this.setHeight(oracle, measured.heights[measured.index++]);
      else if (force || this.outdated)
        this.setHeight(oracle, Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)));
      this.outdated = false;
      return this;
    }
    toString() {
      return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
    }
  };
  var HeightMapGap = class extends HeightMap {
    constructor(length) {
      super(length, 0);
    }
    lines(doc2, offset) {
      let firstLine = doc2.lineAt(offset).number, lastLine = doc2.lineAt(offset + this.length).number;
      return {firstLine, lastLine, lineHeight: this.height / (lastLine - firstLine + 1)};
    }
    blockAt(height, doc2, top2, offset) {
      let {firstLine, lastLine, lineHeight} = this.lines(doc2, offset);
      let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top2) / lineHeight)));
      let {from, length} = doc2.line(firstLine + line);
      return new BlockInfo(from, length, top2 + lineHeight * line, lineHeight, BlockType.Text);
    }
    lineAt(value, type, doc2, top2, offset) {
      if (type == QueryType.ByHeight)
        return this.blockAt(value, doc2, top2, offset);
      if (type == QueryType.ByPosNoHeight) {
        let {from: from2, to} = doc2.lineAt(value);
        return new BlockInfo(from2, to - from2, 0, 0, BlockType.Text);
      }
      let {firstLine, lineHeight} = this.lines(doc2, offset);
      let {from, length, number: number2} = doc2.lineAt(value);
      return new BlockInfo(from, length, top2 + lineHeight * (number2 - firstLine), lineHeight, BlockType.Text);
    }
    forEachLine(from, to, doc2, top2, offset, f) {
      let {firstLine, lineHeight} = this.lines(doc2, offset);
      for (let pos = from; pos < to; ) {
        let line = doc2.lineAt(pos);
        if (pos == from)
          top2 += lineHeight * (line.number - firstLine);
        f(new BlockInfo(line.from, line.length, top2, top2 += lineHeight, BlockType.Text));
        pos = line.to + 1;
      }
    }
    replace(from, to, nodes) {
      let after = this.length - to;
      if (after > 0) {
        let last = nodes[nodes.length - 1];
        if (last instanceof HeightMapGap)
          nodes[nodes.length - 1] = new HeightMapGap(last.length + after);
        else
          nodes.push(null, new HeightMapGap(after - 1));
      }
      if (from > 0) {
        let first = nodes[0];
        if (first instanceof HeightMapGap)
          nodes[0] = new HeightMapGap(from + first.length);
        else
          nodes.unshift(new HeightMapGap(from - 1), null);
      }
      return HeightMap.of(nodes);
    }
    decomposeLeft(to, result) {
      result.push(new HeightMapGap(to - 1), null);
    }
    decomposeRight(from, result) {
      result.push(null, new HeightMapGap(this.length - from - 1));
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let end = offset + this.length;
      if (measured && measured.from <= offset + this.length && measured.more) {
        let nodes = [], pos = Math.max(offset, measured.from);
        if (measured.from > offset)
          nodes.push(new HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
        while (pos <= end && measured.more) {
          let len = oracle.doc.lineAt(pos).length;
          if (nodes.length)
            nodes.push(null);
          let line = new HeightMapText(len, measured.heights[measured.index++]);
          line.outdated = false;
          nodes.push(line);
          pos += len + 1;
        }
        if (pos <= end)
          nodes.push(null, new HeightMapGap(end - pos).updateHeight(oracle, pos));
        oracle.heightChanged = true;
        return HeightMap.of(nodes);
      } else if (force || this.outdated) {
        this.setHeight(oracle, oracle.heightForGap(offset, offset + this.length));
        this.outdated = false;
      }
      return this;
    }
    toString() {
      return `gap(${this.length})`;
    }
  };
  var HeightMapBranch = class extends HeightMap {
    constructor(left, brk, right) {
      super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 : 0));
      this.left = left;
      this.right = right;
      this.size = left.size + right.size;
    }
    get break() {
      return this.flags & 1;
    }
    blockAt(height, doc2, top2, offset) {
      let mid = top2 + this.left.height;
      return height < mid || this.right.height == 0 ? this.left.blockAt(height, doc2, top2, offset) : this.right.blockAt(height, doc2, mid, offset + this.left.length + this.break);
    }
    lineAt(value, type, doc2, top2, offset) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      let left = type == QueryType.ByHeight ? value < rightTop || this.right.height == 0 : value < rightOffset;
      let base2 = left ? this.left.lineAt(value, type, doc2, top2, offset) : this.right.lineAt(value, type, doc2, rightTop, rightOffset);
      if (this.break || (left ? base2.to < rightOffset : base2.from > rightOffset))
        return base2;
      let subQuery = type == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
      if (left)
        return base2.join(this.right.lineAt(rightOffset, subQuery, doc2, rightTop, rightOffset));
      else
        return this.left.lineAt(rightOffset, subQuery, doc2, top2, offset).join(base2);
    }
    forEachLine(from, to, doc2, top2, offset, f) {
      let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
      if (this.break) {
        if (from < rightOffset)
          this.left.forEachLine(from, to, doc2, top2, offset, f);
        if (to >= rightOffset)
          this.right.forEachLine(from, to, doc2, rightTop, rightOffset, f);
      } else {
        let mid = this.lineAt(rightOffset, QueryType.ByPos, doc2, top2, offset);
        if (from < mid.from)
          this.left.forEachLine(from, mid.from - 1, doc2, top2, offset, f);
        if (mid.to >= from && mid.from <= to)
          f(mid);
        if (to > mid.to)
          this.right.forEachLine(mid.to + 1, to, doc2, rightTop, rightOffset, f);
      }
    }
    replace(from, to, nodes) {
      let rightStart = this.left.length + this.break;
      if (to < rightStart)
        return this.balanced(this.left.replace(from, to, nodes), this.right);
      if (from > this.left.length)
        return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
      let result = [];
      if (from > 0)
        this.decomposeLeft(from, result);
      let left = result.length;
      for (let node of nodes)
        result.push(node);
      if (from > 0)
        mergeGaps(result, left - 1);
      if (to < this.length) {
        let right = result.length;
        this.decomposeRight(to, result);
        mergeGaps(result, right);
      }
      return HeightMap.of(result);
    }
    decomposeLeft(to, result) {
      let left = this.left.length;
      if (to <= left)
        return this.left.decomposeLeft(to, result);
      result.push(this.left);
      if (this.break) {
        left++;
        if (to >= left)
          result.push(null);
      }
      if (to > left)
        this.right.decomposeLeft(to - left, result);
    }
    decomposeRight(from, result) {
      let left = this.left.length, right = left + this.break;
      if (from >= right)
        return this.right.decomposeRight(from - right, result);
      if (from < left)
        this.left.decomposeRight(from, result);
      if (this.break && from < right)
        result.push(null);
      result.push(this.right);
    }
    balanced(left, right) {
      if (left.size > 2 * right.size || right.size > 2 * left.size)
        return HeightMap.of(this.break ? [left, null, right] : [left, right]);
      this.left = left;
      this.right = right;
      this.height = left.height + right.height;
      this.outdated = left.outdated || right.outdated;
      this.size = left.size + right.size;
      this.length = left.length + this.break + right.length;
      return this;
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
      let {left, right} = this, rightStart = offset + left.length + this.break, rebalance = null;
      if (measured && measured.from <= offset + left.length && measured.more)
        rebalance = left = left.updateHeight(oracle, offset, force, measured);
      else
        left.updateHeight(oracle, offset, force);
      if (measured && measured.from <= rightStart + right.length && measured.more)
        rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
      else
        right.updateHeight(oracle, rightStart, force);
      if (rebalance)
        return this.balanced(left, right);
      this.height = this.left.height + this.right.height;
      this.outdated = false;
      return this;
    }
    toString() {
      return this.left + (this.break ? " " : "-") + this.right;
    }
  };
  function mergeGaps(nodes, around) {
    let before, after;
    if (nodes[around] == null && (before = nodes[around - 1]) instanceof HeightMapGap && (after = nodes[around + 1]) instanceof HeightMapGap)
      nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
  }
  var relevantWidgetHeight = 5;
  var NodeBuilder = class {
    constructor(pos, oracle) {
      this.pos = pos;
      this.oracle = oracle;
      this.nodes = [];
      this.lineStart = -1;
      this.lineEnd = -1;
      this.covering = null;
      this.writtenTo = pos;
    }
    get isCovered() {
      return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
    }
    span(_from, to) {
      if (this.lineStart > -1) {
        let end = Math.min(to, this.lineEnd), last = this.nodes[this.nodes.length - 1];
        if (last instanceof HeightMapText)
          last.length += end - this.pos;
        else if (end > this.pos || !this.isCovered)
          this.nodes.push(new HeightMapText(end - this.pos, -1));
        this.writtenTo = end;
        if (to > end) {
          this.nodes.push(null);
          this.writtenTo++;
          this.lineStart = -1;
        }
      }
      this.pos = to;
    }
    point(from, to, deco) {
      if (from < to || deco.heightRelevant) {
        let height = deco.widget ? Math.max(0, deco.widget.estimatedHeight) : 0;
        let len = to - from;
        if (deco.block) {
          this.addBlock(new HeightMapBlock(len, height, deco.type));
        } else if (len || height >= relevantWidgetHeight) {
          this.addLineDeco(height, len);
        }
      } else if (to > from) {
        this.span(from, to);
      }
      if (this.lineEnd > -1 && this.lineEnd < this.pos)
        this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
    }
    enterLine() {
      if (this.lineStart > -1)
        return;
      let {from, to} = this.oracle.doc.lineAt(this.pos);
      this.lineStart = from;
      this.lineEnd = to;
      if (this.writtenTo < from) {
        if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
          this.nodes.push(this.blankContent(this.writtenTo, from - 1));
        this.nodes.push(null);
      }
      if (this.pos > from)
        this.nodes.push(new HeightMapText(this.pos - from, -1));
      this.writtenTo = this.pos;
    }
    blankContent(from, to) {
      let gap = new HeightMapGap(to - from);
      if (this.oracle.doc.lineAt(from).to == to)
        gap.flags |= 4;
      return gap;
    }
    ensureLine() {
      this.enterLine();
      let last = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
      if (last instanceof HeightMapText)
        return last;
      let line = new HeightMapText(0, -1);
      this.nodes.push(line);
      return line;
    }
    addBlock(block) {
      this.enterLine();
      if (block.type == BlockType.WidgetAfter && !this.isCovered)
        this.ensureLine();
      this.nodes.push(block);
      this.writtenTo = this.pos = this.pos + block.length;
      if (block.type != BlockType.WidgetBefore)
        this.covering = block;
    }
    addLineDeco(height, length) {
      let line = this.ensureLine();
      line.length += length;
      line.collapsed += length;
      line.widgetHeight = Math.max(line.widgetHeight, height);
      this.writtenTo = this.pos = this.pos + length;
    }
    finish(from) {
      let last = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
      if (this.lineStart > -1 && !(last instanceof HeightMapText) && !this.isCovered)
        this.nodes.push(new HeightMapText(0, -1));
      else if (this.writtenTo < this.pos || last == null)
        this.nodes.push(this.blankContent(this.writtenTo, this.pos));
      let pos = from;
      for (let node of this.nodes) {
        if (node instanceof HeightMapText)
          node.updateHeight(this.oracle, pos);
        pos += node ? node.length : 1;
      }
      return this.nodes;
    }
    static build(oracle, decorations4, from, to) {
      let builder = new NodeBuilder(from, oracle);
      RangeSet.spans(decorations4, from, to, builder);
      return builder.finish(from);
    }
    get minPointSize() {
      return 0;
    }
  };
  function heightRelevantDecoChanges(a, b, diff2) {
    let comp = new DecorationComparator();
    RangeSet.compare(a, b, diff2, comp);
    return comp.changes;
  }
  var DecorationComparator = class {
    constructor() {
      this.changes = [];
    }
    compareRange() {
    }
    comparePoint(from, to, a, b) {
      if (from < to || a && a.heightRelevant || b && b.heightRelevant)
        addRange(from, to, this.changes);
    }
    get minPointSize() {
      return 0;
    }
  };
  var none$3 = [];
  var clickAddsSelectionRange = Facet.define();
  var dragMovesSelection = Facet.define();
  var mouseSelectionStyle = Facet.define();
  var exceptionSink = Facet.define();
  var updateListener = Facet.define();
  var inputHandler = Facet.define();
  function logException(state24, exception, context) {
    let handler = state24.facet(exceptionSink);
    if (handler.length)
      handler[0](exception);
    else if (window.onerror)
      window.onerror(String(exception), context, void 0, void 0, exception);
    else if (context)
      console.error(context + ":", exception);
    else
      console.error(exception);
  }
  var editable = Facet.define({combine: (values) => values.length ? values[0] : true});
  var PluginFieldProvider = class {
    constructor(field, get) {
      this.field = field;
      this.get = get;
    }
  };
  var PluginField = class {
    from(get) {
      return new PluginFieldProvider(this, get);
    }
    static define() {
      return new PluginField();
    }
  };
  PluginField.scrollMargins = PluginField.define();
  var nextPluginID = 0;
  var viewPlugin = Facet.define();
  var ViewPlugin = class {
    constructor(id, create, fields) {
      this.id = id;
      this.create = create;
      this.fields = fields;
      this.extension = viewPlugin.of(this);
    }
    static define(create, spec) {
      let {eventHandlers, provide, decorations: decorations4} = spec || {};
      let fields = [];
      if (provide)
        for (let provider of Array.isArray(provide) ? provide : [provide])
          fields.push(provider);
      if (eventHandlers)
        fields.push(domEventHandlers.from((value) => ({plugin: value, handlers: eventHandlers})));
      if (decorations4)
        for (let get of Array.isArray(decorations4) ? decorations4 : [decorations4])
          fields.push(pluginDecorations.from(get));
      return new ViewPlugin(nextPluginID++, create, fields);
    }
    static fromClass(cls, spec) {
      return ViewPlugin.define((view22) => new cls(view22), spec);
    }
  };
  var pluginDecorations = PluginField.define();
  var domEventHandlers = PluginField.define();
  var PluginInstance = class {
    constructor(value, spec) {
      this.value = value;
      this.spec = spec;
    }
    static create(spec, view22) {
      let value;
      try {
        value = spec.create(view22);
      } catch (e) {
        logException(view22.state, e, "CodeMirror plugin crashed");
        return PluginInstance.dummy;
      }
      return new PluginInstance(value, spec);
    }
    takeField(type, target) {
      for (let {field, get} of this.spec.fields)
        if (field == type)
          target.push(get(this.value));
    }
    update(update) {
      if (!this.value.update)
        return this;
      try {
        this.value.update(update);
        return this;
      } catch (e) {
        logException(update.state, e, "CodeMirror plugin crashed");
        if (this.value.destroy)
          try {
            this.value.destroy();
          } catch (_) {
          }
        return PluginInstance.dummy;
      }
    }
    destroy(view22) {
      if (this.value.destroy) {
        try {
          this.value.destroy();
        } catch (e) {
          logException(view22.state, e, "CodeMirror plugin crashed");
        }
      }
    }
  };
  PluginInstance.dummy = new PluginInstance({}, ViewPlugin.define(() => ({})));
  var editorAttributes = Facet.define({
    combine: (values) => values.reduce((a, b) => combineAttrs(b, a), {})
  });
  var contentAttributes = Facet.define({
    combine: (values) => values.reduce((a, b) => combineAttrs(b, a), {})
  });
  var decorations = Facet.define();
  var styleModule = Facet.define();
  var ChangedRange = class {
    constructor(fromA, toA, fromB, toB) {
      this.fromA = fromA;
      this.toA = toA;
      this.fromB = fromB;
      this.toB = toB;
    }
    join(other) {
      return new ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
    }
    addToSet(set) {
      let i = set.length, me = this;
      for (; i > 0; i--) {
        let range = set[i - 1];
        if (range.fromA > me.toA)
          continue;
        if (range.toA < me.fromA)
          break;
        me = me.join(range);
        set.splice(i - 1, 1);
      }
      set.splice(i, 0, me);
      return set;
    }
    static extendWithRanges(diff2, ranges) {
      if (ranges.length == 0)
        return diff2;
      let result = [];
      for (let dI = 0, rI = 0, posA = 0, posB = 0; ; dI++) {
        let next = dI == diff2.length ? null : diff2[dI], off = posA - posB;
        let end = next ? next.fromB : 1e9;
        while (rI < ranges.length && ranges[rI] < end) {
          let from = ranges[rI], to = ranges[rI + 1];
          let fromB = Math.max(posB, from), toB = Math.min(end, to);
          if (fromB <= toB)
            new ChangedRange(fromB + off, toB + off, fromB, toB).addToSet(result);
          if (to > end)
            break;
          else
            rI += 2;
        }
        if (!next)
          return result;
        new ChangedRange(next.fromA, next.toA, next.fromB, next.toB).addToSet(result);
        posA = next.toA;
        posB = next.toB;
      }
    }
  };
  var ViewUpdate = class {
    constructor(view22, state24, transactions = none$3) {
      this.view = view22;
      this.state = state24;
      this.transactions = transactions;
      this.flags = 0;
      this.prevState = view22.state;
      this.changes = ChangeSet.empty(this.prevState.doc.length);
      for (let tr of transactions)
        this.changes = this.changes.compose(tr.changes);
      let changedRanges = [];
      this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
      this.changedRanges = changedRanges;
      let focus = view22.hasFocus;
      if (focus != view22.inputState.notifiedFocused) {
        view22.inputState.notifiedFocused = focus;
        this.flags != 1;
      }
      if (this.docChanged)
        this.flags |= 2;
    }
    get viewportChanged() {
      return (this.flags & 4) > 0;
    }
    get heightChanged() {
      return (this.flags & 2) > 0;
    }
    get geometryChanged() {
      return this.docChanged || (this.flags & (16 | 2)) > 0;
    }
    get focusChanged() {
      return (this.flags & 1) > 0;
    }
    get docChanged() {
      return this.transactions.some((tr) => tr.docChanged);
    }
    get selectionSet() {
      return this.transactions.some((tr) => tr.selection);
    }
    get empty() {
      return this.flags == 0 && this.transactions.length == 0;
    }
  };
  function visiblePixelRange(dom6, paddingTop) {
    let rect = dom6.getBoundingClientRect();
    let left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
    let top2 = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    for (let parent = dom6.parentNode; parent; ) {
      if (parent.nodeType == 1) {
        if ((parent.scrollHeight > parent.clientHeight || parent.scrollWidth > parent.clientWidth) && window.getComputedStyle(parent).overflow != "visible") {
          let parentRect = parent.getBoundingClientRect();
          left = Math.max(left, parentRect.left);
          right = Math.min(right, parentRect.right);
          top2 = Math.max(top2, parentRect.top);
          bottom = Math.min(bottom, parentRect.bottom);
        }
        parent = parent.parentNode;
      } else if (parent.nodeType == 11) {
        parent = parent.host;
      } else {
        break;
      }
    }
    return {
      left: left - rect.left,
      right: right - rect.left,
      top: top2 - (rect.top + paddingTop),
      bottom: bottom - (rect.top + paddingTop)
    };
  }
  var LineGap = class {
    constructor(from, to, size) {
      this.from = from;
      this.to = to;
      this.size = size;
    }
    static same(a, b) {
      if (a.length != b.length)
        return false;
      for (let i = 0; i < a.length; i++) {
        let gA = a[i], gB = b[i];
        if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
          return false;
      }
      return true;
    }
    draw(wrapping) {
      return Decoration.replace({widget: new LineGapWidget(this.size, wrapping)}).range(this.from, this.to);
    }
  };
  var LineGapWidget = class extends WidgetType {
    constructor(size, vertical) {
      super();
      this.size = size;
      this.vertical = vertical;
    }
    eq(other) {
      return other.size == this.size && other.vertical == this.vertical;
    }
    toDOM() {
      let elt2 = document.createElement("div");
      if (this.vertical) {
        elt2.style.height = this.size + "px";
      } else {
        elt2.style.width = this.size + "px";
        elt2.style.height = "2px";
        elt2.style.display = "inline-block";
      }
      return elt2;
    }
    get estimatedHeight() {
      return this.vertical ? this.size : -1;
    }
  };
  var ViewState = class {
    constructor(state24) {
      this.state = state24;
      this.pixelViewport = {left: 0, right: window.innerWidth, top: 0, bottom: 0};
      this.inView = true;
      this.paddingTop = 0;
      this.paddingBottom = 0;
      this.contentWidth = 0;
      this.heightOracle = new HeightOracle();
      this.heightMap = HeightMap.empty();
      this.scrollTo = null;
      this.printing = false;
      this.visibleRanges = [];
      this.mustEnforceCursorAssoc = false;
      this.heightMap = this.heightMap.applyChanges(state24.facet(decorations), Text.empty, this.heightOracle.setDoc(state24.doc), [new ChangedRange(0, 0, 0, state24.doc.length)]);
      this.viewport = this.getViewport(0, null);
      this.lineGaps = this.ensureLineGaps([]);
      this.lineGapDeco = Decoration.set(this.lineGaps.map((gap) => gap.draw(false)));
      this.computeVisibleRanges();
    }
    update(update, scrollTo2 = null) {
      let prev = this.state;
      this.state = update.state;
      let newDeco = this.state.facet(decorations);
      let contentChanges = update.changedRanges;
      let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(update.prevState.facet(decorations), newDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
      let prevHeight = this.heightMap.height;
      this.heightMap = this.heightMap.applyChanges(newDeco, prev.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
      if (this.heightMap.height != prevHeight)
        update.flags |= 2;
      let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
      if (scrollTo2 && (scrollTo2.head < viewport.from || scrollTo2.head > viewport.to) || !this.viewportIsAppropriate(viewport))
        viewport = this.getViewport(0, scrollTo2);
      if (!viewport.eq(this.viewport)) {
        this.viewport = viewport;
        update.flags |= 4;
      }
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 15e3)
        update.flags |= this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
      this.computeVisibleRanges();
      if (scrollTo2)
        this.scrollTo = scrollTo2;
      if (!this.mustEnforceCursorAssoc && update.selectionSet && update.view.lineWrapping && update.state.selection.primary.empty && update.state.selection.primary.assoc)
        this.mustEnforceCursorAssoc = true;
    }
    measure(docView, repeated) {
      let dom6 = docView.dom, whiteSpace = "", direction = Direction.LTR;
      if (!repeated) {
        let style = window.getComputedStyle(dom6);
        whiteSpace = style.whiteSpace, direction = style.direction == "rtl" ? Direction.RTL : Direction.LTR;
        this.paddingTop = parseInt(style.paddingTop) || 0;
        this.paddingBottom = parseInt(style.paddingBottom) || 0;
      }
      let pixelViewport = this.printing ? {top: -1e8, bottom: 1e8, left: -1e8, right: 1e8} : visiblePixelRange(dom6, this.paddingTop);
      let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
      this.pixelViewport = pixelViewport;
      this.inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
      if (!this.inView)
        return 0;
      let lineHeights = docView.measureVisibleLineHeights();
      let refresh = false, bias = 0, result = 0, oracle = this.heightOracle;
      if (!repeated) {
        let contentWidth = docView.dom.clientWidth;
        if (oracle.mustRefresh(lineHeights, whiteSpace, direction) || oracle.lineWrapping && Math.abs(contentWidth - this.contentWidth) > oracle.charWidth) {
          let {lineHeight, charWidth} = docView.measureTextSize();
          refresh = oracle.refresh(whiteSpace, direction, lineHeight, charWidth, contentWidth / charWidth, lineHeights);
          if (refresh) {
            docView.minWidth = 0;
            result |= 16;
          }
        }
        if (this.contentWidth != contentWidth) {
          this.contentWidth = contentWidth;
          result |= 16;
        }
        if (dTop > 0 && dBottom > 0)
          bias = Math.max(dTop, dBottom);
        else if (dTop < 0 && dBottom < 0)
          bias = Math.min(dTop, dBottom);
      }
      oracle.heightChanged = false;
      this.heightMap = this.heightMap.updateHeight(oracle, 0, refresh, new MeasuredHeights(this.viewport.from, lineHeights));
      if (oracle.heightChanged)
        result |= 2;
      if (!this.viewportIsAppropriate(this.viewport, bias) || this.scrollTo && (this.scrollTo.head < this.viewport.from || this.scrollTo.head > this.viewport.to)) {
        this.viewport = this.getViewport(bias, this.scrollTo);
        result |= 4;
      }
      if (this.lineGaps.length || this.viewport.to - this.viewport.from > 15e3)
        result |= this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps));
      this.computeVisibleRanges();
      if (this.mustEnforceCursorAssoc) {
        this.mustEnforceCursorAssoc = false;
        docView.enforceCursorAssoc();
      }
      return result;
    }
    getViewport(bias, scrollTo2) {
      let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1e3 / 2));
      let map = this.heightMap, doc2 = this.state.doc, {top: top2, bottom} = this.pixelViewport;
      let viewport = new Viewport(map.lineAt(top2 - marginTop * 1e3, QueryType.ByHeight, doc2, 0, 0).from, map.lineAt(bottom + (1 - marginTop) * 1e3, QueryType.ByHeight, doc2, 0, 0).to);
      if (scrollTo2) {
        if (scrollTo2.head < viewport.from) {
          let {top: newTop} = map.lineAt(scrollTo2.head, QueryType.ByPos, doc2, 0, 0);
          viewport = new Viewport(map.lineAt(newTop - 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).from, map.lineAt(newTop + (bottom - top2) + 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).to);
        } else if (scrollTo2.head > viewport.to) {
          let {bottom: newBottom} = map.lineAt(scrollTo2.head, QueryType.ByPos, doc2, 0, 0);
          viewport = new Viewport(map.lineAt(newBottom - (bottom - top2) - 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).from, map.lineAt(newBottom + 1e3 / 2, QueryType.ByHeight, doc2, 0, 0).to);
        }
      }
      return viewport;
    }
    mapViewport(viewport, changes) {
      let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
      return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0).from, this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0).to);
    }
    viewportIsAppropriate({from, to}, bias = 0) {
      let {top: top2} = this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0);
      let {bottom} = this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0);
      return (from == 0 || top2 <= this.pixelViewport.top - Math.max(10, Math.min(-bias, 250))) && (to == this.state.doc.length || bottom >= this.pixelViewport.bottom + Math.max(10, Math.min(bias, 250))) && (top2 > this.pixelViewport.top - 2 * 1e3 && bottom < this.pixelViewport.bottom + 2 * 1e3);
    }
    mapLineGaps(gaps, changes) {
      if (!gaps.length || changes.empty)
        return gaps;
      let mapped = [];
      for (let gap of gaps)
        if (!changes.touchesRange(gap.from, gap.to))
          mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size));
      return mapped;
    }
    ensureLineGaps(current) {
      let gaps = [];
      if (this.heightOracle.direction != Direction.LTR)
        return gaps;
      this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.state.doc, 0, 0, (line) => {
        if (line.length < 1e4)
          return;
        let structure = lineStructure(line.from, line.to, this.state);
        if (structure.total < 1e4)
          return;
        let viewFrom, viewTo;
        if (this.heightOracle.lineWrapping) {
          if (line.from != this.viewport.from)
            viewFrom = line.from;
          else
            viewFrom = findPosition(structure, (this.pixelViewport.top - line.top) / line.height);
          if (line.to != this.viewport.to)
            viewTo = line.to;
          else
            viewTo = findPosition(structure, (this.pixelViewport.bottom - line.top) / line.height);
        } else {
          let totalWidth = structure.total * this.heightOracle.charWidth;
          viewFrom = findPosition(structure, this.pixelViewport.left / totalWidth);
          viewTo = findPosition(structure, this.pixelViewport.right / totalWidth);
        }
        let sel = this.state.selection.primary;
        if (sel.from <= viewFrom && sel.to >= line.from)
          viewFrom = sel.from;
        if (sel.from <= line.to && sel.to >= viewTo)
          viewTo = sel.to;
        let gapTo = viewFrom - 1e4, gapFrom = viewTo + 1e4;
        if (gapTo > line.from + 5e3)
          gaps.push(find(current, (gap) => gap.from == line.from && gap.to > gapTo - 5e3 && gap.to < gapTo + 5e3) || new LineGap(line.from, gapTo, this.gapSize(line, gapTo, true, structure)));
        if (gapFrom < line.to - 5e3)
          gaps.push(find(current, (gap) => gap.to == line.to && gap.from > gapFrom - 5e3 && gap.from < gapFrom + 5e3) || new LineGap(gapFrom, line.to, this.gapSize(line, gapFrom, false, structure)));
      });
      return gaps;
    }
    gapSize(line, pos, start, structure) {
      if (this.heightOracle.lineWrapping) {
        let height = line.height * findFraction(structure, pos);
        return start ? height : line.height - height;
      } else {
        let ratio = findFraction(structure, pos);
        return structure.total * this.heightOracle.charWidth * (start ? ratio : 1 - ratio);
      }
    }
    updateLineGaps(gaps) {
      if (!LineGap.same(gaps, this.lineGaps)) {
        this.lineGaps = gaps;
        this.lineGapDeco = Decoration.set(gaps.map((gap) => gap.draw(this.heightOracle.lineWrapping)));
        return 8;
      }
      return 0;
    }
    computeVisibleRanges() {
      let deco = this.state.facet(decorations);
      if (this.lineGaps.length)
        deco = deco.concat(this.lineGapDeco);
      let ranges = [];
      RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
        span(from, to) {
          ranges.push({from, to});
        },
        point() {
        },
        minPointSize: 20
      });
      this.visibleRanges = ranges;
    }
    lineAt(pos, editorTop) {
      return this.heightMap.lineAt(pos, QueryType.ByPos, this.state.doc, editorTop + this.paddingTop, 0);
    }
    lineAtHeight(height, editorTop) {
      return this.heightMap.lineAt(height, QueryType.ByHeight, this.state.doc, editorTop + this.paddingTop, 0);
    }
    blockAtHeight(height, editorTop) {
      return this.heightMap.blockAt(height, this.state.doc, editorTop + this.paddingTop, 0);
    }
    forEachLine(from, to, f, editorTop) {
      return this.heightMap.forEachLine(from, to, this.state.doc, editorTop + this.paddingTop, 0, f);
    }
  };
  var Viewport = class {
    constructor(from, to) {
      this.from = from;
      this.to = to;
    }
    eq(b) {
      return this.from == b.from && this.to == b.to;
    }
  };
  function lineStructure(from, to, state24) {
    let ranges = [], pos = from, total = 0;
    RangeSet.spans(state24.facet(decorations), from, to, {
      span() {
      },
      point(from2, to2) {
        if (from2 > pos) {
          ranges.push({from: pos, to: from2});
          total += from2 - pos;
        }
        pos = to2;
      },
      minPointSize: 20
    });
    if (pos < to) {
      ranges.push({from: pos, to});
      total += to - pos;
    }
    return {total, ranges};
  }
  function findPosition({total, ranges}, ratio) {
    if (ratio <= 0)
      return ranges[0].from;
    if (ratio >= 1)
      return ranges[ranges.length - 1].to;
    let dist = Math.floor(total * ratio);
    for (let i = 0; ; i++) {
      let {from, to} = ranges[i], size = to - from;
      if (dist <= size)
        return from + dist;
      dist -= size;
    }
  }
  function findFraction(structure, pos) {
    let counted = 0;
    for (let {from, to} of structure.ranges) {
      if (pos <= to) {
        counted += pos - from;
        break;
      }
      counted += to - from;
    }
    return counted / structure.total;
  }
  function find(array, f) {
    for (let val of array)
      if (f(val))
        return val;
    return void 0;
  }
  var none$4 = [];
  var DocView = class extends ContentView {
    constructor(view22) {
      super();
      this.view = view22;
      this.viewports = none$4;
      this.compositionDeco = Decoration.none;
      this.decorations = [];
      this.minWidth = 0;
      this.minWidthFrom = 0;
      this.minWidthTo = 0;
      this.impreciseAnchor = null;
      this.impreciseHead = null;
      this.setDOM(view22.contentDOM);
      this.children = [new LineView()];
      this.children[0].setParent(this);
      this.updateInner([new ChangedRange(0, 0, 0, view22.state.doc.length)], this.updateDeco(), 0);
    }
    get root() {
      return this.view.root;
    }
    get editorView() {
      return this.view;
    }
    get length() {
      return this.view.state.doc.length;
    }
    update(update) {
      var _a;
      let changedRanges = update.changedRanges;
      if (this.minWidth > 0 && changedRanges.length) {
        if (!changedRanges.every(({fromA, toA}) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
          this.minWidth = 0;
        } else {
          this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
          this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
        }
      }
      if (!((_a = this.view.inputState) === null || _a === void 0 ? void 0 : _a.composing))
        this.compositionDeco = Decoration.none;
      else if (update.transactions.length)
        this.compositionDeco = computeCompositionDeco(this.view, update.changes);
      let forceSelection = (browser.ie || browser.chrome) && !this.compositionDeco.size && update && update.state.doc.lines != update.prevState.doc.lines;
      let prevDeco = this.decorations, deco = this.updateDeco();
      let decoDiff = findChangedDeco(prevDeco, deco, update.changes);
      changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
      let pointerSel = update.transactions.some((tr) => tr.annotation(Transaction.userEvent) == "pointerselection");
      if (this.dirty == 0 && changedRanges.length == 0 && !(update.flags & (4 | 8)) && update.state.selection.primary.from >= this.view.viewport.from && update.state.selection.primary.to <= this.view.viewport.to) {
        this.updateSelection(forceSelection, pointerSel);
        return false;
      } else {
        this.updateInner(changedRanges, deco, update.prevState.doc.length, forceSelection, pointerSel);
        return true;
      }
    }
    updateInner(changes, deco, oldLength, forceSelection = false, pointerSel = false) {
      this.updateChildren(changes, deco, oldLength);
      this.view.observer.ignore(() => {
        this.dom.style.height = this.view.viewState.heightMap.height + "px";
        this.dom.style.minWidth = this.minWidth ? this.minWidth + "px" : "";
        let track = browser.chrome ? {node: getSelection(this.view.root).focusNode, written: false} : void 0;
        this.sync(track);
        this.dirty = 0;
        if (track === null || track === void 0 ? void 0 : track.written)
          forceSelection = true;
        this.updateSelection(forceSelection, pointerSel);
        this.dom.style.height = "";
      });
    }
    updateChildren(changes, deco, oldLength) {
      let cursor = this.childCursor(oldLength);
      for (let i = changes.length - 1; ; i--) {
        let next = i >= 0 ? changes[i] : null;
        if (!next)
          break;
        let {fromA, toA, fromB, toB} = next;
        let {content: content2, breakAtStart, openStart, openEnd} = ContentBuilder.build(this.view.state.doc, fromB, toB, deco);
        let {i: toI, off: toOff} = cursor.findPos(toA, 1);
        let {i: fromI, off: fromOff} = cursor.findPos(fromA, -1);
        this.replaceRange(fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd);
      }
    }
    replaceRange(fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd) {
      let before = this.children[fromI], last = content2.length ? content2[content2.length - 1] : null;
      let breakAtEnd = last ? last.breakAfter : breakAtStart;
      if (fromI == toI && !breakAtStart && !breakAtEnd && content2.length < 2 && before.merge(fromOff, toOff, content2.length ? last : null, fromOff == 0, openStart, openEnd))
        return;
      let after = this.children[toI];
      if (toOff < after.length || after.children.length && after.children[after.children.length - 1].length == 0) {
        if (fromI == toI) {
          after = after.split(toOff);
          toOff = 0;
        }
        if (!breakAtEnd && last && after.merge(0, toOff, last, true, 0, openEnd)) {
          content2[content2.length - 1] = after;
        } else {
          if (toOff || after.children.length && after.children[0].length == 0)
            after.merge(0, toOff, null, false, 0, openEnd);
          content2.push(after);
        }
      } else if (after.breakAfter) {
        if (last)
          last.breakAfter = 1;
        else
          breakAtStart = 1;
      }
      toI++;
      before.breakAfter = breakAtStart;
      if (fromOff > 0) {
        if (!breakAtStart && content2.length && before.merge(fromOff, before.length, content2[0], false, openStart, 0)) {
          before.breakAfter = content2.shift().breakAfter;
        } else if (fromOff < before.length || before.children.length && before.children[before.children.length - 1].length == 0) {
          before.merge(fromOff, before.length, null, false, openStart, 0);
        }
        fromI++;
      }
      while (fromI < toI && content2.length) {
        if (this.children[toI - 1].match(content2[content2.length - 1]))
          toI--, content2.pop();
        else if (this.children[fromI].match(content2[0]))
          fromI++, content2.shift();
        else
          break;
      }
      if (fromI < toI || content2.length)
        this.replaceChildren(fromI, toI, content2);
    }
    updateSelection(force = false, fromPointer = false) {
      if (!(fromPointer || this.mayControlSelection()))
        return;
      let primary = this.view.state.selection.primary;
      let anchor = this.domAtPos(primary.anchor);
      let head = this.domAtPos(primary.head);
      let domSel = getSelection(this.root);
      if (force || !domSel.focusNode || browser.gecko && primary.empty && nextToUneditable(domSel.focusNode, domSel.focusOffset) || !isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) || !isEquivalentPosition(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) {
        this.view.observer.ignore(() => {
          if (primary.empty) {
            if (browser.gecko) {
              let nextTo = nextToUneditable(anchor.node, anchor.offset);
              if (nextTo && nextTo != (1 | 2)) {
                let text9 = nearbyTextNode(anchor.node, anchor.offset, nextTo == 1 ? 1 : -1);
                if (text9)
                  anchor = new DOMPos(text9, nextTo == 1 ? 0 : text9.nodeValue.length);
              }
            }
            domSel.collapse(anchor.node, anchor.offset);
            if (primary.bidiLevel != null && domSel.cursorBidiLevel != null)
              domSel.cursorBidiLevel = primary.bidiLevel;
          } else if (domSel.extend) {
            domSel.collapse(anchor.node, anchor.offset);
            domSel.extend(head.node, head.offset);
          } else {
            let range = document.createRange();
            if (primary.anchor > primary.head)
              [anchor, head] = [head, anchor];
            range.setEnd(head.node, head.offset);
            range.setStart(anchor.node, anchor.offset);
            domSel.removeAllRanges();
            domSel.addRange(range);
          }
        });
      }
      this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
      this.impreciseHead = head.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
    }
    enforceCursorAssoc() {
      let cursor = this.view.state.selection.primary;
      let sel = getSelection(this.root);
      if (!cursor.empty || !cursor.assoc || !sel.modify)
        return;
      let line = LineView.find(this, cursor.head);
      if (!line)
        return;
      let lineStart = line.posAtStart;
      if (cursor.head == lineStart || cursor.head == lineStart + line.length)
        return;
      let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
      if (!before || !after || before.bottom > after.top)
        return;
      let dom6 = this.domAtPos(cursor.head + cursor.assoc);
      sel.collapse(dom6.node, dom6.offset);
      sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
    }
    mayControlSelection() {
      return this.view.state.facet(editable) ? this.root.activeElement == this.dom : hasSelection(this.dom, getSelection(this.root));
    }
    nearest(dom6) {
      for (let cur2 = dom6; cur2; ) {
        let domView = ContentView.get(cur2);
        if (domView && domView.rootView == this)
          return domView;
        cur2 = cur2.parentNode;
      }
      return null;
    }
    posFromDOM(node, offset) {
      let view22 = this.nearest(node);
      if (!view22)
        throw new RangeError("Trying to find position for a DOM position outside of the document");
      return view22.localPosFromDOM(node, offset) + view22.posAtStart;
    }
    domAtPos(pos) {
      let {i, off} = this.childCursor().findPos(pos, -1);
      for (; i < this.children.length - 1; ) {
        let child = this.children[i];
        if (off < child.length || child instanceof LineView)
          break;
        i++;
        off = 0;
      }
      return this.children[i].domAtPos(off);
    }
    coordsAt(pos, side) {
      for (let off = this.length, i = this.children.length - 1; ; i--) {
        let child = this.children[i], start = off - child.breakAfter - child.length;
        if (pos > start || pos == start && (child.type == BlockType.Text || !i || this.children[i - 1].breakAfter))
          return child.coordsAt(pos - start, side);
        off = start;
      }
    }
    measureVisibleLineHeights() {
      let result = [], {from, to} = this.view.viewState.viewport;
      let minWidth = Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
      for (let pos = 0, i = 0; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (end > to)
          break;
        if (pos >= from) {
          result.push(child.dom.getBoundingClientRect().height);
          let width = child.dom.scrollWidth;
          if (width > minWidth) {
            this.minWidth = minWidth = width;
            this.minWidthFrom = pos;
            this.minWidthTo = end;
          }
        }
        pos = end + child.breakAfter;
      }
      return result;
    }
    measureTextSize() {
      for (let child of this.children) {
        if (child instanceof LineView) {
          let measure = child.measureTextSize();
          if (measure)
            return measure;
        }
      }
      let dummy = document.createElement("div"), lineHeight, charWidth;
      dummy.className = "cm-line";
      dummy.textContent = "abc def ghi jkl mno pqr stu";
      this.view.observer.ignore(() => {
        this.dom.appendChild(dummy);
        let rect = clientRectsFor(dummy.firstChild)[0];
        lineHeight = dummy.getBoundingClientRect().height;
        charWidth = rect ? rect.width / 27 : 7;
        dummy.remove();
      });
      return {lineHeight, charWidth};
    }
    childCursor(pos = this.length) {
      let i = this.children.length;
      if (i)
        pos -= this.children[--i].length;
      return new ChildCursor(this.children, pos, i);
    }
    computeBlockGapDeco() {
      let visible = this.view.viewState.viewport, viewports = [visible];
      let {head, anchor} = this.view.state.selection.primary;
      if (head < visible.from || head > visible.to) {
        let {from, to} = this.view.viewState.lineAt(head, 0);
        viewports.push(new Viewport(from, to));
      }
      if (!viewports.some(({from, to}) => anchor >= from && anchor <= to)) {
        let {from, to} = this.view.viewState.lineAt(anchor, 0);
        viewports.push(new Viewport(from, to));
      }
      this.viewports = viewports.sort((a, b) => a.from - b.from);
      let deco = [];
      for (let pos = 0, i = 0; ; i++) {
        let next = i == viewports.length ? null : viewports[i];
        let end = next ? next.from - 1 : this.length;
        if (end > pos) {
          let height = this.view.viewState.lineAt(end, 0).bottom - this.view.viewState.lineAt(pos, 0).top;
          deco.push(Decoration.replace({widget: new BlockGapWidget(height), block: true, inclusive: true}).range(pos, end));
        }
        if (!next)
          break;
        pos = next.to + 1;
      }
      return Decoration.set(deco);
    }
    updateDeco() {
      return this.decorations = [
        this.computeBlockGapDeco(),
        this.view.viewState.lineGapDeco,
        this.compositionDeco,
        ...this.view.state.facet(decorations),
        ...this.view.pluginField(pluginDecorations)
      ];
    }
    scrollPosIntoView(pos, side) {
      let rect = this.coordsAt(pos, side);
      if (!rect)
        return;
      let mLeft = 0, mRight = 0, mTop = 0, mBottom = 0;
      for (let margins of this.view.pluginField(PluginField.scrollMargins))
        if (margins) {
          let {left, right, top: top2, bottom} = margins;
          if (left != null)
            mLeft = Math.max(mLeft, left);
          if (right != null)
            mRight = Math.max(mRight, right);
          if (top2 != null)
            mTop = Math.max(mTop, top2);
          if (bottom != null)
            mBottom = Math.max(mBottom, bottom);
        }
      scrollRectIntoView(this.dom, {
        left: rect.left - mLeft,
        top: rect.top - mTop,
        right: rect.right + mRight,
        bottom: rect.bottom + mBottom
      });
    }
  };
  var MaxNodeHeight = 1e7;
  var BlockGapWidget = class extends WidgetType {
    constructor(height) {
      super();
      this.height = height;
    }
    toDOM() {
      let elt2 = document.createElement("div");
      this.updateDOM(elt2);
      return elt2;
    }
    eq(other) {
      return other.height == this.height;
    }
    updateDOM(elt2) {
      if (this.height < MaxNodeHeight) {
        while (elt2.lastChild)
          elt2.lastChild.remove();
        elt2.style.height = this.height + "px";
      } else {
        elt2.style.height = "";
        for (let remaining = this.height; remaining > 0; remaining -= MaxNodeHeight) {
          let fill = elt2.appendChild(document.createElement("div"));
          fill.style.height = Math.min(remaining, MaxNodeHeight) + "px";
        }
      }
      return true;
    }
    get estimatedHeight() {
      return this.height;
    }
  };
  function computeCompositionDeco(view22, changes) {
    let sel = getSelection(view22.root);
    let textNode = sel.focusNode && nearbyTextNode(sel.focusNode, sel.focusOffset, 0);
    if (!textNode)
      return Decoration.none;
    let cView = view22.docView.nearest(textNode);
    let from, to, topNode = textNode;
    if (cView instanceof InlineView) {
      while (cView.parent instanceof InlineView)
        cView = cView.parent;
      from = cView.posAtStart;
      to = from + cView.length;
      topNode = cView.dom;
    } else if (cView instanceof LineView) {
      while (topNode.parentNode != cView.dom)
        topNode = topNode.parentNode;
      let prev = topNode.previousSibling;
      while (prev && !ContentView.get(prev))
        prev = prev.previousSibling;
      from = to = prev ? ContentView.get(prev).posAtEnd : cView.posAtStart;
    } else {
      return Decoration.none;
    }
    let newFrom = changes.mapPos(from, 1), newTo = Math.max(newFrom, changes.mapPos(to, -1));
    let text9 = textNode.nodeValue, {state: state24} = view22;
    if (newTo - newFrom < text9.length) {
      if (state24.sliceDoc(newFrom, Math.min(state24.doc.length, newFrom + text9.length)) == text9)
        newTo = newFrom + text9.length;
      else if (state24.sliceDoc(Math.max(0, newTo - text9.length), newTo) == text9)
        newFrom = newTo - text9.length;
      else
        return Decoration.none;
    } else if (state24.sliceDoc(newFrom, newTo) != text9) {
      return Decoration.none;
    }
    return Decoration.set(Decoration.replace({widget: new CompositionWidget(topNode, textNode)}).range(newFrom, newTo));
  }
  var CompositionWidget = class extends WidgetType {
    constructor(top2, text9) {
      super();
      this.top = top2;
      this.text = text9;
    }
    eq(other) {
      return this.top == other.top && this.text == other.text;
    }
    toDOM() {
      return this.top;
    }
    ignoreEvent() {
      return false;
    }
    get customView() {
      return CompositionView;
    }
  };
  function nearbyTextNode(node, offset, side) {
    for (; ; ) {
      if (node.nodeType == 3)
        return node;
      if (node.nodeType == 1 && offset > 0 && side <= 0) {
        node = node.childNodes[offset - 1];
        offset = maxOffset(node);
      } else if (node.nodeType == 1 && offset < node.childNodes.length && side >= 0) {
        node = node.childNodes[offset];
        offset = 0;
      } else {
        return null;
      }
    }
  }
  function nextToUneditable(node, offset) {
    if (node.nodeType != 1)
      return 0;
    return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 : 0) | (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 : 0);
  }
  var DecorationComparator$1 = class {
    constructor() {
      this.changes = [];
    }
    compareRange(from, to) {
      addRange(from, to, this.changes);
    }
    comparePoint(from, to) {
      addRange(from, to, this.changes);
    }
  };
  function findChangedDeco(a, b, diff2) {
    let comp = new DecorationComparator$1();
    RangeSet.compare(a, b, diff2, comp);
    return comp.changes;
  }
  function groupAt(state24, pos, bias = 1) {
    let categorize = state24.charCategorizer(pos);
    let line = state24.doc.lineAt(pos), linePos = pos - line.from;
    if (line.length == 0)
      return EditorSelection.cursor(pos);
    if (linePos == 0)
      bias = 1;
    else if (linePos == line.length)
      bias = -1;
    let from = linePos, to = linePos;
    if (bias < 0)
      from = line.findClusterBreak(linePos, false);
    else
      to = line.findClusterBreak(linePos, true);
    let cat = categorize(line.slice(from, to));
    while (from > 0) {
      let prev = line.findClusterBreak(from, false);
      if (categorize(line.slice(prev, from)) != cat)
        break;
      from = prev;
    }
    while (to < line.length) {
      let next = line.findClusterBreak(to, true);
      if (categorize(line.slice(to, next)) != cat)
        break;
      to = next;
    }
    return EditorSelection.range(from + line.from, to + line.from);
  }
  function getdx(x, rect) {
    return rect.left > x ? rect.left - x : Math.max(0, x - rect.right);
  }
  function getdy(y, rect) {
    return rect.top > y ? rect.top - y : Math.max(0, y - rect.bottom);
  }
  function yOverlap(a, b) {
    return a.top < b.bottom - 1 && a.bottom > b.top + 1;
  }
  function upTop(rect, top2) {
    return top2 < rect.top ? {top: top2, left: rect.left, right: rect.right, bottom: rect.bottom} : rect;
  }
  function upBot(rect, bottom) {
    return bottom > rect.bottom ? {top: rect.top, left: rect.left, right: rect.right, bottom} : rect;
  }
  function domPosAtCoords(parent, x, y) {
    let closest, closestRect, closestX, closestY;
    let above, below, aboveRect, belowRect;
    for (let child = parent.firstChild; child; child = child.nextSibling) {
      let rects = clientRectsFor(child);
      for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        if (closestRect && yOverlap(closestRect, rect))
          rect = upTop(upBot(rect, closestRect.bottom), closestRect.top);
        let dx = getdx(x, rect), dy = getdy(y, rect);
        if (dx == 0 && dy == 0)
          return child.nodeType == 3 ? domPosInText(child, x, y) : domPosAtCoords(child, x, y);
        if (!closest || closestY > dy || closestY == dy && closestX > dx) {
          closest = child;
          closestRect = rect;
          closestX = dx;
          closestY = dy;
        }
        if (dx == 0) {
          if (y > rect.bottom && (!aboveRect || aboveRect.bottom < rect.bottom)) {
            above = child;
            aboveRect = rect;
          } else if (y < rect.top && (!belowRect || belowRect.top > rect.top)) {
            below = child;
            belowRect = rect;
          }
        } else if (aboveRect && yOverlap(aboveRect, rect)) {
          aboveRect = upBot(aboveRect, rect.bottom);
        } else if (belowRect && yOverlap(belowRect, rect)) {
          belowRect = upTop(belowRect, rect.top);
        }
      }
    }
    if (aboveRect && aboveRect.bottom >= y) {
      closest = above;
      closestRect = aboveRect;
    } else if (belowRect && belowRect.top <= y) {
      closest = below;
      closestRect = belowRect;
    }
    if (!closest)
      return {node: parent, offset: 0};
    let clipX = Math.max(closestRect.left, Math.min(closestRect.right, x));
    if (closest.nodeType == 3)
      return domPosInText(closest, clipX, y);
    if (!closestX && closest.contentEditable == "true")
      return domPosAtCoords(closest, clipX, y);
    let offset = Array.prototype.indexOf.call(parent.childNodes, closest) + (x >= (closestRect.left + closestRect.right) / 2 ? 1 : 0);
    return {node: parent, offset};
  }
  function domPosInText(node, x, y) {
    let len = node.nodeValue.length, range = tempRange();
    for (let i = 0; i < len; i++) {
      range.setEnd(node, i + 1);
      range.setStart(node, i);
      let rects = range.getClientRects();
      for (let j = 0; j < rects.length; j++) {
        let rect = rects[j];
        if (rect.top == rect.bottom)
          continue;
        if (rect.left - 1 <= x && rect.right + 1 >= x && rect.top - 1 <= y && rect.bottom + 1 >= y) {
          let right = x >= (rect.left + rect.right) / 2, after = right;
          if (browser.chrome || browser.gecko) {
            range.setEnd(node, i);
            let rectBefore = range.getBoundingClientRect();
            if (rectBefore.left == rect.right)
              after = !right;
          }
          return {node, offset: i + (after ? 1 : 0)};
        }
      }
    }
    return {node, offset: 0};
  }
  function posAtCoords(view22, {x, y}, bias = -1) {
    let content2 = view22.contentDOM.getBoundingClientRect(), block;
    let halfLine = view22.defaultLineHeight / 2;
    for (let bounced = false; ; ) {
      block = view22.blockAtHeight(y, content2.top);
      if (block.top > y || block.bottom < y) {
        bias = block.top > y ? -1 : 1;
        y = Math.min(block.bottom - halfLine, Math.max(block.top + halfLine, y));
        if (bounced)
          return -1;
        else
          bounced = true;
      }
      if (block.type == BlockType.Text)
        break;
      y = bias > 0 ? block.bottom + halfLine : block.top - halfLine;
    }
    let lineStart = block.from;
    if (lineStart < view22.viewport.from)
      return view22.viewport.from == 0 ? 0 : null;
    if (lineStart > view22.viewport.to)
      return view22.viewport.to == view22.state.doc.length ? view22.state.doc.length : null;
    x = Math.max(content2.left + 1, Math.min(content2.right - 1, x));
    let root = view22.root, element = root.elementFromPoint(x, y);
    let node, offset = -1;
    if (element && view22.contentDOM.contains(element) && !(view22.docView.nearest(element) instanceof WidgetView)) {
      if (root.caretPositionFromPoint) {
        let pos = root.caretPositionFromPoint(x, y);
        if (pos)
          ({offsetNode: node, offset} = pos);
      } else if (root.caretRangeFromPoint) {
        let range = root.caretRangeFromPoint(x, y);
        if (range)
          ({startContainer: node, startOffset: offset} = range);
      }
    }
    if (!node || !view22.docView.dom.contains(node)) {
      let line = LineView.find(view22.docView, lineStart);
      ({node, offset} = domPosAtCoords(line.dom, x, y));
    }
    return view22.docView.posFromDOM(node, offset);
  }
  function moveToLineBoundary(view22, start, forward, includeWrap) {
    let line = view22.state.doc.lineAt(start.head);
    let coords = !includeWrap || !view22.lineWrapping ? null : view22.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
    if (coords) {
      let editorRect = view22.dom.getBoundingClientRect();
      let pos = view22.posAtCoords({
        x: forward == (view22.textDirection == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
        y: (coords.top + coords.bottom) / 2
      });
      if (pos != null)
        return EditorSelection.cursor(pos, forward ? -1 : 1);
    }
    let lineView = LineView.find(view22.docView, start.head);
    let end = lineView ? forward ? lineView.posAtEnd : lineView.posAtStart : forward ? line.to : line.from;
    return EditorSelection.cursor(end, forward ? -1 : 1);
  }
  function moveByChar(view22, start, forward, by) {
    let line = view22.state.doc.lineAt(start.head), spans = view22.bidiSpans(line);
    for (let cur2 = start, check = null; ; ) {
      let next = moveVisually(line, spans, view22.textDirection, cur2, forward), char = movedOver;
      if (!next) {
        if (line.number == (forward ? view22.state.doc.lines : 1))
          return cur2;
        char = "\n";
        line = view22.state.doc.line(line.number + (forward ? 1 : -1));
        spans = view22.bidiSpans(line);
        next = EditorSelection.cursor(forward ? line.from : line.to);
      }
      if (!check) {
        if (!by)
          return next;
        check = by(char);
      } else if (!check(char)) {
        return cur2;
      }
      cur2 = next;
    }
  }
  function byGroup(view22, pos, start) {
    let categorize = view22.state.charCategorizer(pos);
    let cat = categorize(start);
    return (next) => {
      let nextCat = categorize(next);
      if (cat == CharCategory.Space)
        cat = nextCat;
      return cat == nextCat;
    };
  }
  function moveVertically(view22, start, forward, distance) {
    var _a;
    let startPos = start.head, dir = forward ? 1 : -1;
    if (startPos == (forward ? view22.state.doc.length : 0))
      return EditorSelection.cursor(startPos);
    let startCoords = view22.coordsAtPos(startPos);
    if (startCoords) {
      let rect = view22.dom.getBoundingClientRect();
      let goal2 = (_a = start.goalColumn) !== null && _a !== void 0 ? _a : startCoords.left - rect.left;
      let resolvedGoal = rect.left + goal2;
      let dist = distance !== null && distance !== void 0 ? distance : 5;
      for (let startY = dir < 0 ? startCoords.top : startCoords.bottom, extra = 0; extra < 50; extra += 10) {
        let pos = posAtCoords(view22, {x: resolvedGoal, y: startY + (dist + extra) * dir}, dir);
        if (pos == null)
          break;
        if (pos != startPos)
          return EditorSelection.cursor(pos, void 0, void 0, goal2);
      }
    }
    let {doc: doc2} = view22.state, line = doc2.lineAt(startPos), tabSize = view22.state.tabSize;
    let goal = start.goalColumn, goalCol = 0;
    if (goal == null) {
      for (const iter = doc2.iterRange(line.from, startPos); !iter.next().done; )
        goalCol = countColumn(iter.value, goalCol, tabSize);
      goal = goalCol * view22.defaultCharacterWidth;
    } else {
      goalCol = Math.round(goal / view22.defaultCharacterWidth);
    }
    if (dir < 0 && line.from == 0)
      return EditorSelection.cursor(0);
    else if (dir > 0 && line.to == doc2.length)
      return EditorSelection.cursor(line.to);
    let otherLine = doc2.line(line.number + dir);
    let result = otherLine.from;
    let seen = 0;
    for (const iter = doc2.iterRange(otherLine.from, otherLine.to); seen >= goalCol && !iter.next().done; ) {
      const {offset, leftOver} = findColumn(iter.value, seen, goalCol, tabSize);
      seen = goalCol - leftOver;
      result += offset;
    }
    return EditorSelection.cursor(result, void 0, void 0, goal);
  }
  var InputState = class {
    constructor(view22) {
      this.lastKeyCode = 0;
      this.lastKeyTime = 0;
      this.lastSelectionOrigin = null;
      this.lastSelectionTime = 0;
      this.scrollHandlers = [];
      this.registeredEvents = [];
      this.customHandlers = [];
      this.composing = false;
      this.compositionEndedAt = 0;
      this.mouseSelection = null;
      for (let type in handlers) {
        let handler = handlers[type];
        view22.contentDOM.addEventListener(type, (event) => {
          if (!eventBelongsToEditor(view22, event) || this.ignoreDuringComposition(event))
            return;
          if (this.mustFlushObserver(event))
            view22.observer.forceFlush();
          if (this.runCustomHandlers(type, view22, event))
            event.preventDefault();
          else
            handler(view22, event);
        });
        this.registeredEvents.push(type);
      }
      view22.contentDOM.addEventListener("keydown", (event) => {
        view22.inputState.lastKeyCode = event.keyCode;
        view22.inputState.lastKeyTime = Date.now();
      });
      this.notifiedFocused = view22.hasFocus;
      this.ensureHandlers(view22);
    }
    setSelectionOrigin(origin) {
      this.lastSelectionOrigin = origin;
      this.lastSelectionTime = Date.now();
    }
    ensureHandlers(view22) {
      let handlers2 = this.customHandlers = view22.pluginField(domEventHandlers);
      for (let set of handlers2) {
        for (let type in set.handlers)
          if (this.registeredEvents.indexOf(type) < 0 && type != "scroll") {
            this.registeredEvents.push(type);
            view22.contentDOM.addEventListener(type, (event) => {
              if (!eventBelongsToEditor(view22, event))
                return;
              if (this.runCustomHandlers(type, view22, event))
                event.preventDefault();
            });
          }
      }
    }
    runCustomHandlers(type, view22, event) {
      for (let set of this.customHandlers) {
        let handler = set.handlers[type];
        if (handler) {
          try {
            if (handler.call(set.plugin, event, view22) || event.defaultPrevented)
              return true;
          } catch (e) {
            logException(view22.state, e);
          }
        }
      }
      return false;
    }
    runScrollHandlers(view22, event) {
      for (let set of this.customHandlers) {
        let handler = set.handlers.scroll;
        if (handler) {
          try {
            handler.call(set.plugin, event, view22);
          } catch (e) {
            logException(view22.state, e);
          }
        }
      }
    }
    ignoreDuringComposition(event) {
      if (!/^key/.test(event.type))
        return false;
      if (this.composing)
        return true;
      if (browser.safari && event.timeStamp - this.compositionEndedAt < 500) {
        this.compositionEndedAt = 0;
        return true;
      }
      return false;
    }
    mustFlushObserver(event) {
      return event.type == "keydown" || event.type == "compositionend";
    }
    startMouseSelection(view22, event, style) {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
      this.mouseSelection = new MouseSelection(this, view22, event, style);
    }
    update(update) {
      if (this.mouseSelection)
        this.mouseSelection.update(update);
      this.lastKeyCode = this.lastSelectionTime = 0;
    }
    destroy() {
      if (this.mouseSelection)
        this.mouseSelection.destroy();
    }
  };
  var MouseSelection = class {
    constructor(inputState, view22, startEvent, style) {
      this.inputState = inputState;
      this.view = view22;
      this.startEvent = startEvent;
      this.style = style;
      let doc2 = view22.contentDOM.ownerDocument;
      doc2.addEventListener("mousemove", this.move = this.move.bind(this));
      doc2.addEventListener("mouseup", this.up = this.up.bind(this));
      this.extend = startEvent.shiftKey;
      this.multiple = view22.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view22, startEvent);
      this.dragMove = dragMovesSelection$1(view22, startEvent);
      this.dragging = isInPrimarySelection(view22, startEvent) ? null : false;
      if (this.dragging === false) {
        startEvent.preventDefault();
        this.select(startEvent);
      }
    }
    move(event) {
      if (event.buttons == 0)
        return this.destroy();
      if (this.dragging !== false)
        return;
      this.select(event);
    }
    up(event) {
      if (this.dragging == null)
        this.select(this.startEvent);
      if (!this.dragging)
        event.preventDefault();
      this.destroy();
    }
    destroy() {
      let doc2 = this.view.contentDOM.ownerDocument;
      doc2.removeEventListener("mousemove", this.move);
      doc2.removeEventListener("mouseup", this.up);
      this.inputState.mouseSelection = null;
    }
    select(event) {
      let selection = this.style.get(event, this.extend, this.multiple);
      if (!selection.eq(this.view.state.selection) || selection.primary.assoc != this.view.state.selection.primary.assoc)
        this.view.dispatch({
          selection,
          annotations: Transaction.userEvent.of("pointerselection"),
          scrollIntoView: true
        });
    }
    update(update) {
      if (update.docChanged && this.dragging)
        this.dragging = this.dragging.map(update.changes);
      this.style.update(update);
    }
  };
  function addsSelectionRange(view22, event) {
    let facet = view22.state.facet(clickAddsSelectionRange);
    return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
  }
  function dragMovesSelection$1(view22, event) {
    let facet = view22.state.facet(dragMovesSelection);
    return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
  }
  function isInPrimarySelection(view22, event) {
    let {primary} = view22.state.selection;
    if (primary.empty)
      return false;
    let sel = getSelection(view22.root);
    if (sel.rangeCount == 0)
      return true;
    let rects = sel.getRangeAt(0).getClientRects();
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (rect.left <= event.clientX && rect.right >= event.clientX && rect.top <= event.clientY && rect.bottom >= event.clientY)
        return true;
    }
    return false;
  }
  function eventBelongsToEditor(view22, event) {
    if (!event.bubbles)
      return true;
    if (event.defaultPrevented)
      return false;
    for (let node = event.target, cView; node != view22.contentDOM; node = node.parentNode)
      if (!node || node.nodeType == 11 || (cView = ContentView.get(node)) && cView.ignoreEvent(event))
        return false;
    return true;
  }
  var handlers = Object.create(null);
  var brokenClipboardAPI = browser.ie && browser.ie_version < 15 || browser.ios && browser.webkit_version < 604;
  function capturePaste(view22) {
    let parent = view22.dom.parentNode;
    if (!parent)
      return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    setTimeout(() => {
      view22.focus();
      target.remove();
      doPaste(view22, target.value);
    }, 50);
  }
  function doPaste(view22, input) {
    let {state: state24} = view22, changes, i = 1, text9 = state24.toText(input);
    let byLine = text9.lines == state24.selection.ranges.length;
    let linewise = lastLinewiseCopy && state24.selection.ranges.every((r) => r.empty) && lastLinewiseCopy == text9.toString();
    if (linewise) {
      changes = {
        changes: state24.selection.ranges.map((r) => state24.doc.lineAt(r.from)).filter((l, i2, a) => i2 == 0 || a[i2 - 1] != l).map((line) => ({from: line.from, insert: (byLine ? text9.line(i++).slice() : input) + state24.lineBreak}))
      };
    } else if (byLine) {
      changes = state24.changeByRange((range) => {
        let line = text9.line(i++);
        return {
          changes: {from: range.from, to: range.to, insert: line.slice()},
          range: EditorSelection.cursor(range.from + line.length)
        };
      });
    } else {
      changes = state24.replaceSelection(text9);
    }
    view22.dispatch(changes, {
      annotations: Transaction.userEvent.of("paste"),
      scrollIntoView: true
    });
  }
  function mustCapture(event) {
    let mods = (event.ctrlKey ? 1 : 0) | (event.metaKey ? 8 : 0) | (event.altKey ? 2 : 0) | (event.shiftKey ? 4 : 0);
    let code = event.keyCode, macCtrl = browser.mac && mods == 1;
    return code == 8 || macCtrl && code == 72 || code == 46 || macCtrl && code == 68 || code == 27 || mods == (browser.mac ? 8 : 1) && (code == 66 || code == 73 || code == 89 || code == 90);
  }
  handlers.keydown = (view22, event) => {
    if (mustCapture(event))
      event.preventDefault();
    view22.inputState.setSelectionOrigin("keyboardselection");
  };
  handlers.touchdown = handlers.touchmove = (view22) => {
    view22.inputState.setSelectionOrigin("pointerselection");
  };
  handlers.mousedown = (view22, event) => {
    let style = null;
    for (let makeStyle of view22.state.facet(mouseSelectionStyle)) {
      style = makeStyle(view22, event);
      if (style)
        break;
    }
    if (!style && event.button == 0)
      style = basicMouseSelection(view22, event);
    if (style) {
      if (view22.root.activeElement != view22.contentDOM)
        view22.observer.ignore(() => focusPreventScroll(view22.contentDOM));
      view22.inputState.startMouseSelection(view22, event, style);
    }
  };
  function rangeForClick(view22, pos, bias, type) {
    if (type == 1) {
      return EditorSelection.cursor(pos, bias);
    } else if (type == 2) {
      return groupAt(view22.state, pos, bias);
    } else {
      let line = LineView.find(view22.docView, pos);
      if (line)
        return EditorSelection.range(line.posAtStart, line.posAtEnd);
      let {from, to} = view22.state.doc.lineAt(pos);
      return EditorSelection.range(from, to);
    }
  }
  var insideY = (y, rect) => y >= rect.top && y <= rect.bottom;
  var inside = (x, y, rect) => insideY(y, rect) && x >= rect.left && x <= rect.right;
  function findPositionSide(view22, pos, x, y) {
    let line = LineView.find(view22.docView, pos);
    if (!line)
      return 1;
    let off = pos - line.posAtStart;
    if (off == 0)
      return 1;
    if (off == line.length)
      return -1;
    let before = line.coordsAt(off, -1);
    if (before && inside(x, y, before))
      return -1;
    let after = line.coordsAt(off, 1);
    if (after && inside(x, y, after))
      return 1;
    return before && insideY(y, before) ? -1 : 1;
  }
  function queryPos(view22, event) {
    let pos = view22.posAtCoords({x: event.clientX, y: event.clientY});
    if (pos == null)
      return null;
    return {pos, bias: findPositionSide(view22, pos, event.clientX, event.clientY)};
  }
  var BadMouseDetail = browser.ie && browser.ie_version <= 11;
  var lastMouseDown = null;
  var lastMouseDownCount = 0;
  function getClickType(event) {
    if (!BadMouseDetail)
      return event.detail;
    let last = lastMouseDown;
    lastMouseDown = event;
    return lastMouseDownCount = !last || last.timeStamp > Date.now() - 400 && Math.abs(last.clientX - event.clientX) < 2 && Math.abs(last.clientY - event.clientY) < 2 ? (lastMouseDownCount + 1) % 3 : 1;
  }
  function basicMouseSelection(view22, event) {
    let start = queryPos(view22, event), type = getClickType(event);
    let startSel = view22.state.selection;
    let last = start, lastEvent = event;
    return {
      update(update) {
        if (update.changes) {
          if (start)
            start.pos = update.changes.mapPos(start.pos);
          startSel = startSel.map(update.changes);
        }
      },
      get(event2, extend2, multiple) {
        let cur2;
        if (event2.clientX == lastEvent.clientX && event2.clientY == lastEvent.clientY)
          cur2 = last;
        else {
          cur2 = last = queryPos(view22, event2);
          lastEvent = event2;
        }
        if (!cur2 || !start)
          return startSel;
        let range = rangeForClick(view22, cur2.pos, cur2.bias, type);
        if (start.pos != cur2.pos && !extend2) {
          let startRange = rangeForClick(view22, start.pos, start.bias, type);
          let from = Math.min(startRange.from, range.from), to = Math.max(startRange.to, range.to);
          range = from < range.from ? EditorSelection.range(from, to) : EditorSelection.range(to, from);
        }
        if (extend2)
          return startSel.replaceRange(startSel.primary.extend(range.from, range.to));
        else if (multiple)
          return startSel.addRange(range);
        else
          return EditorSelection.create([range]);
      }
    };
  }
  handlers.dragstart = (view22, event) => {
    let {selection: {primary}} = view22.state;
    let {mouseSelection} = view22.inputState;
    if (mouseSelection)
      mouseSelection.dragging = primary;
    if (event.dataTransfer) {
      event.dataTransfer.setData("Text", view22.state.sliceDoc(primary.from, primary.to));
      event.dataTransfer.effectAllowed = "copyMove";
    }
  };
  handlers.drop = (view22, event) => {
    if (!event.dataTransfer)
      return;
    let dropPos = view22.posAtCoords({x: event.clientX, y: event.clientY});
    let text9 = event.dataTransfer.getData("Text");
    if (dropPos == null || !text9)
      return;
    event.preventDefault();
    let {mouseSelection} = view22.inputState;
    let del = mouseSelection && mouseSelection.dragging && mouseSelection.dragMove ? {from: mouseSelection.dragging.from, to: mouseSelection.dragging.to} : null;
    let ins = {from: dropPos, insert: text9};
    let changes = view22.state.changes(del ? [del, ins] : ins);
    view22.focus();
    view22.dispatch({
      changes,
      selection: {anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1)},
      annotations: Transaction.userEvent.of("drop")
    });
  };
  handlers.paste = (view22, event) => {
    view22.observer.flush();
    let data = brokenClipboardAPI ? null : event.clipboardData;
    let text9 = data && data.getData("text/plain");
    if (text9) {
      doPaste(view22, text9);
      event.preventDefault();
    } else {
      capturePaste(view22);
    }
  };
  function captureCopy(view22, text9) {
    let parent = view22.dom.parentNode;
    if (!parent)
      return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.value = text9;
    target.focus();
    target.selectionEnd = text9.length;
    target.selectionStart = 0;
    setTimeout(() => {
      target.remove();
      view22.focus();
    }, 50);
  }
  function copiedRange(state24) {
    let content2 = [], ranges = [], linewise = false;
    for (let range of state24.selection.ranges)
      if (!range.empty) {
        content2.push(state24.sliceDoc(range.from, range.to));
        ranges.push(range);
      }
    if (!content2.length) {
      let upto = -1;
      for (let {from} of state24.selection.ranges) {
        let line = state24.doc.lineAt(from);
        if (line.number > upto) {
          content2.push(line.slice());
          ranges.push({from: line.from, to: Math.min(state24.doc.length, line.to + 1)});
        }
        upto = line.number;
      }
      linewise = true;
    }
    return {text: content2.join(state24.lineBreak), ranges, linewise};
  }
  var lastLinewiseCopy = null;
  handlers.copy = handlers.cut = (view22, event) => {
    let {text: text9, ranges, linewise} = copiedRange(view22.state);
    if (!text9)
      return;
    lastLinewiseCopy = linewise ? text9 : null;
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
      event.preventDefault();
      data.clearData();
      data.setData("text/plain", text9);
    } else {
      captureCopy(view22, text9);
    }
    if (event.type == "cut")
      view22.dispatch({
        changes: ranges,
        scrollIntoView: true,
        annotations: Transaction.userEvent.of("cut")
      });
  };
  handlers.focus = handlers.blur = (view22) => {
    setTimeout(() => {
      if (view22.hasFocus != view22.inputState.notifiedFocused)
        view22.update([]);
    }, 10);
  };
  handlers.beforeprint = (view22) => {
    view22.viewState.printing = true;
    view22.requestMeasure();
    setTimeout(() => {
      view22.viewState.printing = false;
      view22.requestMeasure();
    }, 2e3);
  };
  function forceClearComposition(view22) {
    if (view22.docView.compositionDeco.size)
      view22.update([]);
  }
  handlers.compositionstart = handlers.compositionupdate = (view22) => {
    if (!view22.inputState.composing) {
      if (view22.docView.compositionDeco.size) {
        view22.observer.flush();
        forceClearComposition(view22);
      }
      view22.inputState.composing = true;
    }
  };
  handlers.compositionend = (view22) => {
    view22.inputState.composing = false;
    view22.inputState.compositionEndedAt = Date.now();
    setTimeout(() => {
      if (!view22.inputState.composing)
        forceClearComposition(view22);
    }, 50);
  };
  var observeOptions = {
    childList: true,
    characterData: true,
    subtree: true,
    characterDataOldValue: true
  };
  var useCharData = browser.ie && browser.ie_version <= 11;
  var DOMObserver = class {
    constructor(view22, onChange, onScrollChanged) {
      this.view = view22;
      this.onChange = onChange;
      this.onScrollChanged = onScrollChanged;
      this.active = false;
      this.ignoreSelection = new DOMSelection();
      this.delayedFlush = -1;
      this.queue = [];
      this.scrollTargets = [];
      this.intersection = null;
      this.intersecting = false;
      this.parentCheck = -1;
      this.dom = view22.contentDOM;
      this.observer = new MutationObserver((mutations) => {
        for (let mut of mutations)
          this.queue.push(mut);
        if (browser.ie && browser.ie_version <= 11 && mutations.some((m) => m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
          this.flushSoon();
        else
          this.flush();
      });
      if (useCharData)
        this.onCharData = (event) => {
          this.queue.push({
            target: event.target,
            type: "characterData",
            oldValue: event.prevValue
          });
          this.flushSoon();
        };
      this.onSelectionChange = (event) => {
        if (this.view.root.activeElement != this.dom)
          return;
        let sel = getSelection(this.view.root);
        let context = sel.anchorNode && this.view.docView.nearest(sel.anchorNode);
        if (context && context.ignoreEvent(event))
          return;
        if (browser.ie && browser.ie_version <= 11 && !this.view.state.selection.primary.empty && sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
          this.flushSoon();
        else
          this.flush();
      };
      this.start();
      this.onScroll = this.onScroll.bind(this);
      window.addEventListener("scroll", this.onScroll);
      if (typeof IntersectionObserver == "function") {
        this.intersection = new IntersectionObserver((entries) => {
          if (this.parentCheck < 0)
            this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3);
          if (entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
            this.intersecting = !this.intersecting;
            this.onScrollChanged(document.createEvent("Event"));
          }
        }, {});
        this.intersection.observe(this.dom);
      }
      this.listenForScroll();
    }
    onScroll(e) {
      if (this.intersecting) {
        this.flush();
        this.onScrollChanged(e);
      }
    }
    listenForScroll() {
      this.parentCheck = -1;
      let i = 0, changed = null;
      for (let dom6 = this.dom; dom6; ) {
        if (dom6.nodeType == 1) {
          if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom6)
            i++;
          else if (!changed)
            changed = this.scrollTargets.slice(0, i);
          if (changed)
            changed.push(dom6);
          dom6 = dom6.parentNode;
        } else if (dom6.nodeType == 11) {
          dom6 = dom6.host;
        } else {
          break;
        }
      }
      if (i < this.scrollTargets.length && !changed)
        changed = this.scrollTargets.slice(0, i);
      if (changed) {
        for (let dom6 of this.scrollTargets)
          dom6.removeEventListener("scroll", this.onScroll);
        for (let dom6 of this.scrollTargets = changed)
          dom6.addEventListener("scroll", this.onScroll);
      }
    }
    ignore(f) {
      if (!this.active)
        return f();
      try {
        this.stop();
        return f();
      } finally {
        this.start();
        this.clear();
      }
    }
    start() {
      if (this.active)
        return;
      this.observer.observe(this.dom, observeOptions);
      this.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
      if (useCharData)
        this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
      this.active = true;
    }
    stop() {
      if (!this.active)
        return;
      this.active = false;
      this.observer.disconnect();
      this.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
      if (useCharData)
        this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
    }
    clearSelection() {
      this.ignoreSelection.set(getSelection(this.view.root));
    }
    clear() {
      this.observer.takeRecords();
      this.queue.length = 0;
      this.clearSelection();
    }
    flushSoon() {
      if (this.delayedFlush < 0)
        this.delayedFlush = window.setTimeout(() => {
          this.delayedFlush = -1;
          this.flush();
        }, 20);
    }
    forceFlush() {
      if (this.delayedFlush >= 0) {
        window.clearTimeout(this.delayedFlush);
        this.delayedFlush = -1;
        this.flush();
      }
    }
    flush() {
      if (this.delayedFlush >= 0)
        return;
      let records = this.queue;
      for (let mut of this.observer.takeRecords())
        records.push(mut);
      if (records.length)
        this.queue = [];
      let selection = getSelection(this.view.root);
      let newSel = !this.ignoreSelection.eq(selection) && hasSelection(this.dom, selection);
      if (records.length == 0 && !newSel)
        return;
      let from = -1, to = -1, typeOver = false;
      for (let record of records) {
        let range = this.readMutation(record);
        if (!range)
          continue;
        if (range.typeOver)
          typeOver = true;
        if (from == -1) {
          ({from, to} = range);
        } else {
          from = Math.min(range.from, from);
          to = Math.max(range.to, to);
        }
      }
      let startState = this.view.state;
      if (from > -1 || newSel)
        this.onChange(from, to, typeOver);
      if (this.view.state == startState) {
        if (this.view.docView.dirty) {
          this.ignore(() => this.view.docView.sync());
          this.view.docView.dirty = 0;
        }
        this.view.docView.updateSelection();
      }
      this.clearSelection();
    }
    readMutation(rec) {
      let cView = this.view.docView.nearest(rec.target);
      if (!cView || cView.ignoreMutation(rec))
        return null;
      cView.markDirty();
      if (rec.type == "childList") {
        let childBefore = findChild(cView, rec.previousSibling || rec.target.previousSibling, -1);
        let childAfter = findChild(cView, rec.nextSibling || rec.target.nextSibling, 1);
        return {
          from: childBefore ? cView.posAfter(childBefore) : cView.posAtStart,
          to: childAfter ? cView.posBefore(childAfter) : cView.posAtEnd,
          typeOver: false
        };
      } else {
        return {from: cView.posAtStart, to: cView.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue};
      }
    }
    destroy() {
      this.stop();
      if (this.intersection)
        this.intersection.disconnect();
      for (let dom6 of this.scrollTargets)
        dom6.removeEventListener("scroll", this.onScroll);
      window.removeEventListener("scroll", this.onScroll);
      clearTimeout(this.parentCheck);
    }
  };
  function findChild(cView, dom6, dir) {
    while (dom6) {
      let curView = ContentView.get(dom6);
      if (curView && curView.parent == cView)
        return curView;
      let parent = dom6.parentNode;
      dom6 = parent != cView.dom ? parent : dir > 0 ? dom6.nextSibling : dom6.previousSibling;
    }
    return null;
  }
  function applyDOMChange(view22, start, end, typeOver) {
    let change, newSel;
    let sel = view22.state.selection.primary, bounds;
    if (start > -1 && (bounds = view22.docView.domBoundsAround(start, end, 0))) {
      let {from, to} = bounds;
      let selPoints = view22.docView.impreciseHead || view22.docView.impreciseAnchor ? [] : selectionPoints(view22.contentDOM, view22.root);
      let reader = new DOMReader(selPoints, view22.state.lineBreak);
      reader.readRange(bounds.startDOM, bounds.endDOM);
      newSel = selectionFromPoints(selPoints, from);
      let preferredPos = sel.from, preferredSide = null;
      if (view22.inputState.lastKeyCode === 8 && view22.inputState.lastKeyTime > Date.now() - 100) {
        preferredPos = sel.to;
        preferredSide = "end";
      }
      let diff2 = findDiff(view22.state.sliceDoc(from, to), reader.text, preferredPos - from, preferredSide);
      if (diff2)
        change = {
          from: from + diff2.from,
          to: from + diff2.toA,
          insert: view22.state.toText(reader.text.slice(diff2.from, diff2.toB))
        };
    } else if (view22.hasFocus) {
      let domSel = getSelection(view22.root);
      let {impreciseHead: iHead, impreciseAnchor: iAnchor} = view22.docView;
      let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset ? view22.state.selection.primary.head : view22.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
      let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset ? view22.state.selection.primary.anchor : selectionCollapsed(domSel) ? head : view22.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
      if (head != sel.head || anchor != sel.anchor)
        newSel = EditorSelection.single(anchor, head);
    }
    if (!change && !newSel)
      return;
    if (!change && typeOver && !sel.empty && newSel && newSel.primary.empty)
      change = {from: sel.from, to: sel.to, insert: view22.state.doc.slice(sel.from, sel.to)};
    if (change) {
      let startState = view22.state;
      if (browser.android && (change.from == sel.from && change.to == sel.to && change.insert.length == 1 && change.insert.lines == 2 && dispatchKey(view22, "Enter", 10) || change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 && dispatchKey(view22, "Backspace", 8) || change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 && dispatchKey(view22, "Delete", 46)))
        return;
      let text9 = change.insert.toString();
      if (view22.state.facet(inputHandler).some((h) => h(view22, change.from, change.to, text9)))
        return;
      let tr;
      if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3) {
        let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
        let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
        tr = startState.replaceSelection(view22.state.toText(before + change.insert.sliceString(0, void 0, view22.state.lineBreak) + after));
      } else {
        let changes = startState.changes(change);
        tr = {
          changes,
          selection: newSel && !startState.selection.primary.eq(newSel.primary) && newSel.primary.to <= changes.newLength ? startState.selection.replaceRange(newSel.primary) : void 0
        };
      }
      view22.dispatch(tr, {scrollIntoView: true, annotations: Transaction.userEvent.of("input")});
    } else if (newSel && !newSel.primary.eq(sel)) {
      let scrollIntoView2 = false, annotations;
      if (view22.inputState.lastSelectionTime > Date.now() - 50) {
        if (view22.inputState.lastSelectionOrigin == "keyboardselection")
          scrollIntoView2 = true;
        else
          annotations = Transaction.userEvent.of(view22.inputState.lastSelectionOrigin);
      }
      view22.dispatch({selection: newSel, scrollIntoView: scrollIntoView2, annotations});
    }
  }
  function findDiff(a, b, preferredPos, preferredSide) {
    let minLen = Math.min(a.length, b.length);
    let from = 0;
    while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
      from++;
    if (from == minLen && a.length == b.length)
      return null;
    let toA = a.length, toB = b.length;
    while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
      toA--;
      toB--;
    }
    if (preferredSide == "end") {
      let adjust = Math.max(0, from - Math.min(toA, toB));
      preferredPos -= toA + adjust - from;
    }
    if (toA < from && a.length < b.length) {
      let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
      from -= move;
      toB = from + (toB - toA);
      toA = from;
    } else if (toB < from) {
      let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
      from -= move;
      toA = from + (toA - toB);
      toB = from;
    }
    return {from, toA, toB};
  }
  var DOMReader = class {
    constructor(points, lineSep) {
      this.points = points;
      this.lineSep = lineSep;
      this.text = "";
    }
    readRange(start, end) {
      if (!start)
        return;
      let parent = start.parentNode;
      for (let cur2 = start; ; ) {
        this.findPointBefore(parent, cur2);
        this.readNode(cur2);
        let next = cur2.nextSibling;
        if (next == end)
          break;
        let view22 = ContentView.get(cur2), nextView = ContentView.get(next);
        if ((view22 ? view22.breakAfter : isBlockElement(cur2)) || (nextView ? nextView.breakAfter : isBlockElement(next)) && !(cur2.nodeName == "BR" && !cur2.cmIgnore))
          this.text += this.lineSep;
        cur2 = next;
      }
      this.findPointBefore(parent, end);
    }
    readNode(node) {
      if (node.cmIgnore)
        return;
      let view22 = ContentView.get(node);
      let fromView = view22 && view22.overrideDOMText;
      let text9;
      if (fromView != null)
        text9 = fromView.sliceString(0, void 0, this.lineSep);
      else if (node.nodeType == 3)
        text9 = node.nodeValue;
      else if (node.nodeName == "BR")
        text9 = node.nextSibling ? this.lineSep : "";
      else if (node.nodeType == 1)
        this.readRange(node.firstChild, null);
      if (text9 != null) {
        this.findPointIn(node, text9.length);
        this.text += text9;
      }
    }
    findPointBefore(node, next) {
      for (let point of this.points)
        if (point.node == node && node.childNodes[point.offset] == next)
          point.pos = this.text.length;
    }
    findPointIn(node, maxLen) {
      for (let point of this.points)
        if (point.node == node)
          point.pos = this.text.length + Math.min(point.offset, maxLen);
    }
  };
  function isBlockElement(node) {
    return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
  }
  var DOMPoint = class {
    constructor(node, offset) {
      this.node = node;
      this.offset = offset;
      this.pos = -1;
    }
  };
  function selectionPoints(dom6, root) {
    let result = [];
    if (root.activeElement != dom6)
      return result;
    let {anchorNode, anchorOffset, focusNode, focusOffset} = getSelection(root);
    if (anchorNode) {
      result.push(new DOMPoint(anchorNode, anchorOffset));
      if (focusNode != anchorNode || focusOffset != anchorOffset)
        result.push(new DOMPoint(focusNode, focusOffset));
    }
    return result;
  }
  function selectionFromPoints(points, base2) {
    if (points.length == 0)
      return null;
    let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
    return anchor > -1 && head > -1 ? EditorSelection.single(anchor + base2, head + base2) : null;
  }
  function dispatchKey(view22, name2, code) {
    let options = {key: name2, code: name2, keyCode: code, which: code, cancelable: true};
    let down = new KeyboardEvent("keydown", options);
    view22.contentDOM.dispatchEvent(down);
    let up = new KeyboardEvent("keyup", options);
    view22.contentDOM.dispatchEvent(up);
    return down.defaultPrevented || up.defaultPrevented;
  }
  var EditorView = class {
    constructor(config2 = {}) {
      this.plugins = [];
      this.editorAttrs = {};
      this.contentAttrs = {};
      this.bidiCache = [];
      this.updateState = 2;
      this.measureScheduled = -1;
      this.measureRequests = [];
      this.contentDOM = document.createElement("div");
      this.scrollDOM = document.createElement("div");
      this.scrollDOM.className = themeClass("scroller");
      this.scrollDOM.appendChild(this.contentDOM);
      this.dom = document.createElement("div");
      this.dom.appendChild(this.scrollDOM);
      this._dispatch = config2.dispatch || ((tr) => this.update([tr]));
      this.dispatch = this.dispatch.bind(this);
      this.root = config2.root || document;
      this.viewState = new ViewState(config2.state || EditorState.create());
      this.plugins = this.state.facet(viewPlugin).map((spec) => PluginInstance.create(spec, this));
      this.observer = new DOMObserver(this, (from, to, typeOver) => {
        applyDOMChange(this, from, to, typeOver);
      }, (event) => {
        this.inputState.runScrollHandlers(this, event);
        this.measure();
      });
      this.docView = new DocView(this);
      this.inputState = new InputState(this);
      this.mountStyles();
      this.updateAttrs();
      this.updateState = 0;
      ensureGlobalHandler();
      this.requestMeasure();
      if (config2.parent)
        config2.parent.appendChild(this.dom);
    }
    get state() {
      return this.viewState.state;
    }
    get viewport() {
      return this.viewState.viewport;
    }
    get visibleRanges() {
      return this.viewState.visibleRanges;
    }
    get inView() {
      return this.viewState.inView;
    }
    get composing() {
      return this.inputState.composing;
    }
    dispatch(...input) {
      this._dispatch(input.length == 1 && input[0] instanceof Transaction ? input[0] : this.state.update(...input));
    }
    update(transactions) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
      let redrawn = false, update;
      this.updateState = 2;
      try {
        let state24 = this.state;
        for (let tr of transactions) {
          if (tr.startState != state24)
            throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
          state24 = tr.state;
        }
        update = new ViewUpdate(this, state24, transactions);
        let scrollTo2 = transactions.some((tr) => tr.scrollIntoView) ? state24.selection.primary : null;
        this.viewState.update(update, scrollTo2);
        this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
        if (!update.empty)
          this.updatePlugins(update);
        redrawn = this.docView.update(update);
        if (this.state.facet(styleModule) != this.styleModules)
          this.mountStyles();
        this.updateAttrs();
      } finally {
        this.updateState = 0;
      }
      if (redrawn || scrollTo || this.viewState.mustEnforceCursorAssoc)
        this.requestMeasure();
      for (let listener of this.state.facet(updateListener))
        listener(update);
    }
    setState(newState) {
      if (this.updateState != 0)
        throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
      this.updateState = 2;
      try {
        for (let plugin of this.plugins)
          plugin.destroy(this);
        this.viewState = new ViewState(newState);
        this.plugins = newState.facet(viewPlugin).map((spec) => PluginInstance.create(spec, this));
        this.docView = new DocView(this);
        this.inputState.ensureHandlers(this);
        this.mountStyles();
        this.updateAttrs();
        this.bidiCache = [];
      } finally {
        this.updateState = 0;
      }
      this.requestMeasure();
    }
    updatePlugins(update) {
      let prevSpecs = update.prevState.facet(viewPlugin), specs = update.state.facet(viewPlugin);
      if (prevSpecs != specs) {
        let newPlugins = [], reused = [];
        for (let spec of specs) {
          let found = prevSpecs.indexOf(spec);
          if (found < 0) {
            newPlugins.push(PluginInstance.create(spec, this));
          } else {
            let plugin = this.plugins[found].update(update);
            reused.push(plugin);
            newPlugins.push(plugin);
          }
        }
        for (let plugin of this.plugins)
          if (reused.indexOf(plugin) < 0)
            plugin.destroy(this);
        this.plugins = newPlugins;
        this.inputState.ensureHandlers(this);
      } else {
        for (let i = 0; i < this.plugins.length; i++)
          this.plugins[i] = this.plugins[i].update(update);
      }
    }
    measure() {
      if (this.measureScheduled > -1)
        cancelAnimationFrame(this.measureScheduled);
      this.measureScheduled = -1;
      let updated = null;
      try {
        for (let i = 0; ; i++) {
          this.updateState = 1;
          let changed = this.viewState.measure(this.docView, i > 0);
          let measuring = this.measureRequests;
          if (!changed && !measuring.length && this.viewState.scrollTo == null)
            break;
          this.measureRequests = [];
          if (i > 5) {
            console.warn("Viewport failed to stabilize");
            break;
          }
          let measured = measuring.map((m) => {
            try {
              return m.read(this);
            } catch (e) {
              logException(this.state, e);
              return BadMeasure;
            }
          });
          let update = new ViewUpdate(this, this.state);
          update.flags |= changed;
          if (!updated)
            updated = update;
          else
            updated.flags |= changed;
          this.updateState = 2;
          this.updatePlugins(update);
          this.updateAttrs();
          if (changed)
            this.docView.update(update);
          for (let i2 = 0; i2 < measuring.length; i2++)
            if (measured[i2] != BadMeasure) {
              try {
                measuring[i2].write(measured[i2], this);
              } catch (e) {
                logException(this.state, e);
              }
            }
          if (this.viewState.scrollTo) {
            this.docView.scrollPosIntoView(this.viewState.scrollTo.head, this.viewState.scrollTo.assoc);
            this.viewState.scrollTo = null;
          }
          if (!(changed & 4) && this.measureRequests.length == 0)
            break;
        }
      } finally {
        this.updateState = 0;
      }
      this.measureScheduled = -1;
      if (updated)
        for (let listener of this.state.facet(updateListener))
          listener(updated);
    }
    get themeClasses() {
      return baseThemeID + " " + (this.state.facet(darkTheme) ? "cm-dark" : "cm-light") + " " + this.state.facet(theme);
    }
    updateAttrs() {
      let editorAttrs = combineAttrs(this.state.facet(editorAttributes), {
        class: themeClass("wrap") + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
      });
      updateAttrs(this.dom, this.editorAttrs, editorAttrs);
      this.editorAttrs = editorAttrs;
      let contentAttrs = combineAttrs(this.state.facet(contentAttributes), {
        spellcheck: "false",
        contenteditable: String(this.state.facet(editable)),
        class: themeClass("content"),
        style: `${browser.tabSize}: ${this.state.tabSize}`,
        role: "textbox",
        "aria-multiline": "true"
      });
      updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
      this.contentAttrs = contentAttrs;
    }
    mountStyles() {
      this.styleModules = this.state.facet(styleModule);
      StyleModule.mount(this.root, this.styleModules.concat(baseTheme).reverse());
    }
    domAtPos(pos) {
      return this.docView.domAtPos(pos);
    }
    posAtDOM(node, offset = 0) {
      return this.docView.posFromDOM(node, offset);
    }
    readMeasured() {
      if (this.updateState == 2)
        throw new Error("Reading the editor layout isn't allowed during an update");
      if (this.updateState == 0 && this.measureScheduled > -1)
        this.measure();
    }
    requestMeasure(request) {
      if (this.measureScheduled < 0)
        this.measureScheduled = requestAnimationFrame(() => this.measure());
      if (request) {
        if (request.key != null)
          for (let i = 0; i < this.measureRequests.length; i++) {
            if (this.measureRequests[i].key === request.key) {
              this.measureRequests[i] = request;
              return;
            }
          }
        this.measureRequests.push(request);
      }
    }
    pluginField(field) {
      let result = [];
      for (let plugin of this.plugins)
        plugin.takeField(field, result);
      return result;
    }
    plugin(plugin) {
      for (let inst of this.plugins)
        if (inst.spec == plugin)
          return inst.value;
      return null;
    }
    blockAtHeight(height, editorTop) {
      this.readMeasured();
      return this.viewState.blockAtHeight(height, ensureTop(editorTop, this.contentDOM));
    }
    visualLineAtHeight(height, editorTop) {
      this.readMeasured();
      return this.viewState.lineAtHeight(height, ensureTop(editorTop, this.contentDOM));
    }
    visualLineAt(pos, editorTop = 0) {
      return this.viewState.lineAt(pos, editorTop);
    }
    viewportLines(f, editorTop) {
      let {from, to} = this.viewport;
      this.viewState.forEachLine(from, to, f, ensureTop(editorTop, this.contentDOM));
    }
    get contentHeight() {
      return this.viewState.heightMap.height + this.viewState.paddingTop + this.viewState.paddingBottom;
    }
    moveByChar(start, forward, by) {
      return moveByChar(this, start, forward, by);
    }
    moveByGroup(start, forward) {
      return moveByChar(this, start, forward, (initial) => byGroup(this, start.head, initial));
    }
    moveToLineBoundary(start, forward, includeWrap = true) {
      return moveToLineBoundary(this, start, forward, includeWrap);
    }
    moveVertically(start, forward, distance) {
      return moveVertically(this, start, forward, distance);
    }
    scrollPosIntoView(pos) {
      this.viewState.scrollTo = EditorSelection.cursor(pos);
      this.requestMeasure();
    }
    posAtCoords(coords) {
      this.readMeasured();
      return posAtCoords(this, coords);
    }
    coordsAtPos(pos, side = 1) {
      this.readMeasured();
      let rect = this.docView.coordsAt(pos, side);
      if (!rect || rect.left == rect.right)
        return rect;
      let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
      let span = order[BidiSpan.find(order, pos - line.from, -1, side)];
      return flattenRect(rect, span.dir == Direction.LTR == side > 0);
    }
    get defaultCharacterWidth() {
      return this.viewState.heightOracle.charWidth;
    }
    get defaultLineHeight() {
      return this.viewState.heightOracle.lineHeight;
    }
    get textDirection() {
      return this.viewState.heightOracle.direction;
    }
    get lineWrapping() {
      return this.viewState.heightOracle.lineWrapping;
    }
    bidiSpans(line) {
      if (line.length > MaxBidiLine)
        return trivialOrder(line.length);
      let dir = this.textDirection;
      for (let entry of this.bidiCache)
        if (entry.from == line.from && entry.dir == dir)
          return entry.order;
      let order = computeOrder(line.slice(), this.textDirection);
      this.bidiCache.push(new CachedOrder(line.from, line.to, dir, order));
      return order;
    }
    get hasFocus() {
      return document.hasFocus() && this.root.activeElement == this.contentDOM;
    }
    focus() {
      this.observer.ignore(() => {
        focusPreventScroll(this.contentDOM);
        this.docView.updateSelection();
      });
    }
    destroy() {
      for (let plugin of this.plugins)
        plugin.destroy(this);
      this.inputState.destroy();
      this.dom.remove();
      this.observer.destroy();
      if (this.measureScheduled > -1)
        cancelAnimationFrame(this.measureScheduled);
    }
    static domEventHandlers(handlers2) {
      return ViewPlugin.define(() => ({}), {eventHandlers: handlers2});
    }
    static theme(spec, options) {
      let prefix = StyleModule.newName();
      let result = [theme.of(prefix), styleModule.of(buildTheme(`.${baseThemeID}.${prefix}`, spec))];
      if (options && options.dark)
        result.push(darkTheme.of(true));
      return result;
    }
    static baseTheme(spec) {
      return precedence(styleModule.of(buildTheme("." + baseThemeID, spec)), "fallback");
    }
  };
  EditorView.styleModule = styleModule;
  EditorView.inputHandler = inputHandler;
  EditorView.exceptionSink = exceptionSink;
  EditorView.updateListener = updateListener;
  EditorView.editable = editable;
  EditorView.dragMovesSelection = dragMovesSelection;
  EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
  EditorView.mouseSelectionStyle = mouseSelectionStyle;
  EditorView.decorations = decorations;
  EditorView.lineWrapping = EditorView.theme({$content: {whiteSpace: "pre-wrap"}});
  EditorView.contentAttributes = contentAttributes;
  EditorView.editorAttributes = editorAttributes;
  var MaxBidiLine = 4096;
  function ensureTop(given, dom6) {
    return given == null ? dom6.getBoundingClientRect().top : given;
  }
  var resizeDebounce = -1;
  function ensureGlobalHandler() {
    window.addEventListener("resize", () => {
      if (resizeDebounce == -1)
        resizeDebounce = setTimeout(handleResize, 50);
    });
  }
  function handleResize() {
    resizeDebounce = -1;
    let found = document.querySelectorAll(".cm-content");
    for (let i = 0; i < found.length; i++) {
      let docView = ContentView.get(found[i]);
      if (docView)
        docView.editorView.requestMeasure();
    }
  }
  var BadMeasure = {};
  var CachedOrder = class {
    constructor(from, to, dir, order) {
      this.from = from;
      this.to = to;
      this.dir = dir;
      this.order = order;
    }
    static update(cache, changes) {
      if (changes.empty)
        return cache;
      let result = [], lastDir = cache.length ? cache[cache.length - 1].dir : Direction.LTR;
      for (let i = Math.max(0, cache.length - 10); i < cache.length; i++) {
        let entry = cache[i];
        if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
          result.push(new CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.order));
      }
      return result;
    }
  };
  var currentPlatform = typeof navigator == "undefined" ? "key" : /Mac/.test(navigator.platform) ? "mac" : /Win/.test(navigator.platform) ? "win" : /Linux|X11/.test(navigator.platform) ? "linux" : "key";
  function normalizeKeyName(name2, platform) {
    const parts5 = name2.split(/-(?!$)/);
    let result = parts5[parts5.length - 1];
    if (result == "Space")
      result = " ";
    let alt, ctrl, shift2, meta2;
    for (let i = 0; i < parts5.length - 1; ++i) {
      const mod = parts5[i];
      if (/^(cmd|meta|m)$/i.test(mod))
        meta2 = true;
      else if (/^a(lt)?$/i.test(mod))
        alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod))
        ctrl = true;
      else if (/^s(hift)?$/i.test(mod))
        shift2 = true;
      else if (/^mod$/i.test(mod)) {
        if (platform == "mac")
          meta2 = true;
        else
          ctrl = true;
      } else
        throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt)
      result = "Alt-" + result;
    if (ctrl)
      result = "Ctrl-" + result;
    if (meta2)
      result = "Meta-" + result;
    if (shift2)
      result = "Shift-" + result;
    return result;
  }
  function modifiers(name2, event, shift2) {
    if (event.altKey)
      name2 = "Alt-" + name2;
    if (event.ctrlKey)
      name2 = "Ctrl-" + name2;
    if (event.metaKey)
      name2 = "Meta-" + name2;
    if (shift2 !== false && event.shiftKey)
      name2 = "Shift-" + name2;
    return name2;
  }
  var keymaps = Facet.define();
  var handleKeyEvents = EditorView.domEventHandlers({
    keydown(event, view22) {
      return runHandlers(view22.state.facet(keymaps), event, view22, "editor");
    }
  });
  function keymap(bindings, platform) {
    return [handleKeyEvents, keymaps.of(buildKeymap(bindings, platform))];
  }
  function runScopeHandlers(view22, event, scope) {
    return runHandlers(view22.state.facet(keymaps), event, view22, scope);
  }
  var storedPrefix = null;
  var PrefixTimeout = 4e3;
  function buildKeymap(bindings, platform = currentPlatform) {
    let bound = Object.create(null);
    let isPrefix = Object.create(null);
    let checkPrefix = (name2, is) => {
      let current = isPrefix[name2];
      if (current == null)
        isPrefix[name2] = is;
      else if (current != is)
        throw new Error("Key binding " + name2 + " is used both as a regular binding and as a multi-stroke prefix");
    };
    let add = (scope, key, command, preventDefault) => {
      let scopeObj = bound[scope] || (bound[scope] = Object.create(null));
      let parts5 = key.split(/ (?!$)/).map((k) => normalizeKeyName(k, platform));
      for (let i = 1; i < parts5.length; i++) {
        let prefix = parts5.slice(0, i).join(" ");
        checkPrefix(prefix, true);
        if (!scopeObj[prefix])
          scopeObj[prefix] = {
            preventDefault: true,
            commands: [(view22) => {
              let ourObj = storedPrefix = {view: view22, prefix, scope};
              setTimeout(() => {
                if (storedPrefix == ourObj)
                  storedPrefix = null;
              }, PrefixTimeout);
              return true;
            }]
          };
      }
      let full = parts5.join(" ");
      checkPrefix(full, false);
      let binding = scopeObj[full] || (scopeObj[full] = {preventDefault: false, commands: []});
      binding.commands.push(command);
      if (preventDefault)
        binding.preventDefault = true;
    };
    for (let b of bindings) {
      let name2 = b[platform] || b.key;
      if (!name2)
        continue;
      for (let scope of b.scope ? b.scope.split(" ") : ["editor"]) {
        add(scope, name2, b.run, b.preventDefault);
        if (b.shift)
          add(scope, "Shift-" + name2, b.shift, b.preventDefault);
      }
    }
    return bound;
  }
  function runHandlers(maps, event, view22, scope) {
    let name2 = keyName(event), isChar = name2.length == 1 && name2 != " ";
    let prefix = "";
    if (storedPrefix && storedPrefix.view == view22 && storedPrefix.scope == scope) {
      prefix = storedPrefix.prefix + " ";
      storedPrefix = null;
    }
    let fallthrough = !!prefix;
    let runFor = (binding) => {
      if (binding) {
        for (let cmd2 of binding.commands)
          if (cmd2(view22))
            return true;
        if (binding.preventDefault)
          fallthrough = true;
      }
      return false;
    };
    for (let map of maps) {
      let scopeObj = map[scope], baseName;
      if (!scopeObj)
        continue;
      if (runFor(scopeObj[prefix + modifiers(name2, event, !isChar)]))
        return true;
      if (isChar && (event.shiftKey || event.altKey || event.metaKey) && (baseName = base[event.keyCode]) && baseName != name2) {
        if (runFor(scopeObj[prefix + modifiers(baseName, event, true)]))
          return true;
      } else if (isChar && event.shiftKey) {
        if (runFor(scopeObj[prefix + modifiers(name2, event, true)]))
          return true;
      }
    }
    return fallthrough;
  }
  var CanHidePrimary = !browser.ios;
  var selectionConfig = Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        cursorBlinkRate: 1200,
        drawRangeCursor: true
      }, {
        cursorBlinkRate: (a, b) => Math.min(a, b),
        drawRangeCursor: (a, b) => a || b
      });
    }
  });
  function drawSelection(config2 = {}) {
    return [
      selectionConfig.of(config2),
      drawSelectionPlugin,
      hideNativeSelection
    ];
  }
  var Piece = class {
    constructor(left, top2, width, height, className) {
      this.left = left;
      this.top = top2;
      this.width = width;
      this.height = height;
      this.className = className;
    }
    draw() {
      let elt2 = document.createElement("div");
      elt2.className = this.className;
      elt2.style.left = this.left + "px";
      elt2.style.top = this.top + "px";
      if (this.width >= 0)
        elt2.style.width = this.width + "px";
      elt2.style.height = this.height + "px";
      return elt2;
    }
    eq(p) {
      return this.left == p.left && this.top == p.top && this.width == p.width && this.height == p.height && this.className == p.className;
    }
  };
  var drawSelectionPlugin = ViewPlugin.fromClass(class {
    constructor(view22) {
      this.view = view22;
      this.rangePieces = [];
      this.cursors = [];
      this.measureReq = {read: this.readPos.bind(this), write: this.drawSel.bind(this)};
      this.selectionLayer = view22.scrollDOM.appendChild(document.createElement("div"));
      this.selectionLayer.className = themeClass("selectionLayer");
      this.selectionLayer.setAttribute("aria-hidden", "true");
      this.cursorLayer = view22.scrollDOM.appendChild(document.createElement("div"));
      this.cursorLayer.className = themeClass("cursorLayer");
      this.cursorLayer.setAttribute("aria-hidden", "true");
      view22.requestMeasure(this.measureReq);
      this.setBlinkRate();
    }
    setBlinkRate() {
      this.cursorLayer.style.animationDuration = this.view.state.facet(selectionConfig).cursorBlinkRate + "ms";
    }
    update(update) {
      let confChanged = update.prevState.facet(selectionConfig) != update.state.facet(selectionConfig);
      if (confChanged || update.selectionSet || update.geometryChanged || update.viewportChanged)
        this.view.requestMeasure(this.measureReq);
      if (update.transactions.some((tr) => tr.scrollIntoView))
        this.cursorLayer.style.animationName = this.cursorLayer.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink";
      if (confChanged)
        this.setBlinkRate();
    }
    readPos() {
      let {state: state24} = this.view, conf = state24.facet(selectionConfig);
      let rangePieces = state24.selection.ranges.map((r) => r.empty ? [] : measureRange(this.view, r)).reduce((a, b) => a.concat(b));
      let cursors = [];
      for (let r of state24.selection.ranges) {
        let prim = r == state24.selection.primary;
        if (r.empty ? !prim || CanHidePrimary : conf.drawRangeCursor) {
          let piece = measureCursor(this.view, r, prim);
          if (piece)
            cursors.push(piece);
        }
      }
      return {rangePieces, cursors};
    }
    drawSel({rangePieces, cursors}) {
      if (rangePieces.length != this.rangePieces.length || rangePieces.some((p, i) => !p.eq(this.rangePieces[i]))) {
        this.selectionLayer.textContent = "";
        for (let p of rangePieces)
          this.selectionLayer.appendChild(p.draw());
        this.rangePieces = rangePieces;
      }
      if (cursors.length != this.cursors.length || cursors.some((c, i) => !c.eq(this.cursors[i]))) {
        this.cursorLayer.textContent = "";
        for (let c of cursors)
          this.cursorLayer.appendChild(c.draw());
        this.cursors = cursors;
      }
    }
    destroy() {
      this.selectionLayer.remove();
      this.cursorLayer.remove();
    }
  });
  var themeSpec = {
    $line: {
      "& ::selection": {backgroundColor: "transparent !important"},
      "&::selection": {backgroundColor: "transparent !important"}
    }
  };
  if (CanHidePrimary)
    themeSpec.$line.caretColor = "transparent !important";
  var hideNativeSelection = precedence(EditorView.theme(themeSpec), "override");
  var selectionClass = themeClass("selectionBackground");
  function getBase(view22) {
    let rect = view22.scrollDOM.getBoundingClientRect();
    return {left: rect.left - view22.scrollDOM.scrollLeft, top: rect.top - view22.scrollDOM.scrollTop};
  }
  function wrappedLine(view22, pos, inside2) {
    let range = EditorSelection.cursor(pos);
    return {
      from: Math.max(inside2.from, view22.moveToLineBoundary(range, false, true).from),
      to: Math.min(inside2.to, view22.moveToLineBoundary(range, true, true).from)
    };
  }
  function measureRange(view22, range) {
    if (range.to <= view22.viewport.from || range.from >= view22.viewport.to)
      return [];
    let from = Math.max(range.from, view22.viewport.from), to = Math.min(range.to, view22.viewport.to);
    let ltr = view22.textDirection == Direction.LTR;
    let content2 = view22.contentDOM, contentRect = content2.getBoundingClientRect(), base2 = getBase(view22);
    let lineStyle = window.getComputedStyle(content2.firstChild);
    let leftSide = contentRect.left + parseInt(lineStyle.paddingLeft);
    let rightSide = contentRect.right - parseInt(lineStyle.paddingRight);
    let visualStart = view22.visualLineAt(from);
    let visualEnd = view22.visualLineAt(to);
    if (view22.lineWrapping) {
      visualStart = wrappedLine(view22, from, visualStart);
      visualEnd = wrappedLine(view22, to, visualEnd);
    }
    if (visualStart.from == visualEnd.from) {
      return pieces(drawForLine(range.from, range.to));
    } else {
      let top2 = drawForLine(range.from, null);
      let bottom = drawForLine(null, range.to);
      let between = [];
      if (visualStart.to < visualEnd.from - 1)
        between.push(piece(leftSide, top2.bottom, rightSide, bottom.top));
      else if (top2.bottom < bottom.top && bottom.top - top2.bottom < 4)
        top2.bottom = bottom.top = (top2.bottom + bottom.top) / 2;
      return pieces(top2).concat(between).concat(pieces(bottom));
    }
    function piece(left, top2, right, bottom) {
      return new Piece(left - base2.left, top2 - base2.top, right - left, bottom - top2, selectionClass);
    }
    function pieces({top: top2, bottom, horizontal}) {
      let pieces2 = [];
      for (let i = 0; i < horizontal.length; i += 2)
        pieces2.push(piece(horizontal[i], top2, horizontal[i + 1], bottom));
      return pieces2;
    }
    function drawForLine(from2, to2) {
      let top2 = 1e9, bottom = -1e9, horizontal = [];
      function addSpan(from3, fromOpen, to3, toOpen, dir) {
        let fromCoords = view22.coordsAtPos(from3, 1), toCoords = view22.coordsAtPos(to3, -1);
        top2 = Math.min(fromCoords.top, toCoords.top, top2);
        bottom = Math.max(fromCoords.bottom, toCoords.bottom, bottom);
        if (dir == Direction.LTR)
          horizontal.push(ltr && fromOpen ? leftSide : fromCoords.left, ltr && toOpen ? rightSide : toCoords.right);
        else
          horizontal.push(!ltr && toOpen ? leftSide : toCoords.left, !ltr && fromOpen ? rightSide : fromCoords.right);
      }
      let start = from2 !== null && from2 !== void 0 ? from2 : view22.moveToLineBoundary(EditorSelection.cursor(to2, 1), false).head;
      let end = to2 !== null && to2 !== void 0 ? to2 : view22.moveToLineBoundary(EditorSelection.cursor(from2, -1), true).head;
      for (let r of view22.visibleRanges)
        if (r.to > start && r.from < end) {
          for (let pos = Math.max(r.from, start), endPos = Math.min(r.to, end); ; ) {
            let docLine = view22.state.doc.lineAt(pos);
            for (let span of view22.bidiSpans(docLine)) {
              let spanFrom = span.from + docLine.from, spanTo = span.to + docLine.from;
              if (spanFrom >= endPos)
                break;
              if (spanTo > pos)
                addSpan(Math.max(spanFrom, pos), from2 == null && spanFrom <= start, Math.min(spanTo, endPos), to2 == null && spanTo >= end, span.dir);
            }
            pos = docLine.to + 1;
            if (pos >= endPos)
              break;
          }
        }
      if (horizontal.length == 0) {
        let coords = view22.coordsAtPos(start, -1);
        top2 = Math.min(coords.top, top2);
        bottom = Math.max(coords.bottom, bottom);
      }
      return {top: top2, bottom, horizontal};
    }
  }
  var primaryCursorClass = themeClass("cursor.primary");
  var cursorClass = themeClass("cursor.secondary");
  function measureCursor(view22, cursor, primary) {
    let pos = view22.coordsAtPos(cursor.head, cursor.assoc || 1);
    if (!pos)
      return null;
    let base2 = getBase(view22);
    return new Piece(pos.left - base2.left, pos.top - base2.top, -1, pos.bottom - pos.top, primary ? primaryCursorClass : cursorClass);
  }
  var Specials = /[\u0000-\u0008\u000a-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200c\u200e\u200f\u2028\u2029\ufeff\ufff9-\ufffc]/gu;
  var Names = {
    0: "null",
    7: "bell",
    8: "backspace",
    10: "newline",
    11: "vertical tab",
    13: "carriage return",
    27: "escape",
    8203: "zero width space",
    8204: "zero width non-joiner",
    8205: "zero width joiner",
    8206: "left-to-right mark",
    8207: "right-to-left mark",
    8232: "line separator",
    8233: "paragraph separator",
    65279: "zero width no-break space",
    65532: "object replacement"
  };
  var _supportsTabSize = null;
  function supportsTabSize() {
    if (_supportsTabSize == null && typeof document != "undefined" && document.body) {
      let styles = document.body.style;
      _supportsTabSize = (styles.tabSize || styles.MozTabSize) != null;
    }
    return _supportsTabSize || false;
  }
  var UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
  var specialCharConfig = Facet.define({
    combine(configs) {
      let config2 = combineConfig(configs, {
        render: null,
        specialChars: Specials,
        addSpecialChars: null
      });
      if (config2.replaceTabs = !supportsTabSize())
        config2.specialChars = new RegExp("	|" + config2.specialChars.source, UnicodeRegexpSupport);
      if (config2.addSpecialChars)
        config2.specialChars = new RegExp(config2.specialChars.source + "|" + config2.addSpecialChars.source, UnicodeRegexpSupport);
      return config2;
    }
  });
  function highlightSpecialChars(config2 = {}) {
    let ext = [specialCharConfig.of(config2), specialCharPlugin];
    if (!supportsTabSize())
      ext.push(tabStyle);
    return ext;
  }
  var specialCharPlugin = ViewPlugin.fromClass(class {
    constructor(view22) {
      this.view = view22;
      this.decorations = Decoration.none;
      this.decorationCache = Object.create(null);
      this.recompute();
    }
    update(update) {
      let confChange = update.prevState.facet(specialCharConfig) != update.state.facet(specialCharConfig);
      if (confChange)
        this.decorationCache = Object.create(null);
      if (confChange || update.changes.length || update.viewportChanged)
        this.recompute();
    }
    recompute() {
      let decorations4 = [];
      for (let {from, to} of this.view.visibleRanges)
        this.getDecorationsFor(from, to, decorations4);
      this.decorations = Decoration.set(decorations4);
    }
    getDecorationsFor(from, to, target) {
      let config2 = this.view.state.facet(specialCharConfig);
      let {doc: doc2} = this.view.state;
      for (let pos = from, cursor = doc2.iterRange(from, to), m; !cursor.next().done; ) {
        if (!cursor.lineBreak) {
          while (m = config2.specialChars.exec(cursor.value)) {
            let code = codePointAt(m[0], 0), deco;
            if (code == null)
              continue;
            if (code == 9) {
              let line = doc2.lineAt(pos + m.index);
              let size = this.view.state.tabSize, col = countColumn(doc2.sliceString(line.from, pos + m.index), 0, size);
              deco = Decoration.replace({widget: new TabWidget((size - col % size) * this.view.defaultCharacterWidth)});
            } else {
              deco = this.decorationCache[code] || (this.decorationCache[code] = Decoration.replace({widget: new SpecialCharWidget(config2, code)}));
            }
            target.push(deco.range(pos + m.index, pos + m.index + m[0].length));
          }
        }
        pos += cursor.value.length;
      }
    }
  }, {
    decorations: (v) => v.decorations
  });
  function placeHolder(code) {
    if (code >= 32)
      return null;
    if (code == 10)
      return "\u2424";
    return String.fromCharCode(9216 + code);
  }
  var DefaultPlaceholder = "\u2022";
  var SpecialCharWidget = class extends WidgetType {
    constructor(options, code) {
      super();
      this.options = options;
      this.code = code;
    }
    eq(other) {
      return other.code == this.code;
    }
    toDOM() {
      let ph = placeHolder(this.code) || DefaultPlaceholder;
      let desc = "Control character " + (Names[this.code] || this.code);
      let custom = this.options.render && this.options.render(this.code, desc, ph);
      if (custom)
        return custom;
      let span = document.createElement("span");
      span.textContent = ph;
      span.title = desc;
      span.setAttribute("aria-label", desc);
      span.style.color = "red";
      return span;
    }
    ignoreEvent() {
      return false;
    }
  };
  var TabWidget = class extends WidgetType {
    constructor(width) {
      super();
      this.width = width;
    }
    eq(other) {
      return other.width == this.width;
    }
    toDOM() {
      let span = document.createElement("span");
      span.textContent = "	";
      span.className = tab;
      span.style.width = this.width + "px";
      return span;
    }
    ignoreEvent() {
      return false;
    }
  };
  var tab = StyleModule.newName();
  var tabStyle = EditorView.styleModule.of(new StyleModule({
    ["." + tab]: {
      display: "inline-block",
      overflow: "hidden",
      verticalAlign: "bottom"
    }
  }));

  // node_modules/@codemirror/next/history/dist/index.js
  var fromHistory = Annotation.define();
  var isolateHistory = Annotation.define();
  var invertedEffects = Facet.define();
  var historyConfig = Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        minDepth: 100,
        newGroupDelay: 500
      }, {minDepth: Math.max, newGroupDelay: Math.min});
    }
  });
  var historyField = StateField.define({
    create() {
      return HistoryState.empty;
    },
    update(state24, tr) {
      let config2 = tr.state.facet(historyConfig);
      let fromHist = tr.annotation(fromHistory);
      if (fromHist) {
        let item = HistEvent.fromTransaction(tr), from = fromHist.side;
        let other = from == 0 ? state24.undone : state24.done;
        if (item)
          other = updateBranch(other, other.length, config2.minDepth, item);
        else
          other = addSelection(other, tr.startState.selection);
        return new HistoryState(from == 0 ? fromHist.rest : other, from == 0 ? other : fromHist.rest);
      }
      let isolate = tr.annotation(isolateHistory);
      if (isolate == "full" || isolate == "before")
        state24 = state24.isolate();
      if (tr.annotation(Transaction.addToHistory) === false)
        return tr.changes.length ? state24.addMapping(tr.changes.desc) : state24;
      let event = HistEvent.fromTransaction(tr);
      let time = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
      if (event)
        state24 = state24.addChanges(event, time, userEvent, config2.newGroupDelay, config2.minDepth);
      else if (tr.selection)
        state24 = state24.addSelection(tr.startState.selection, time, userEvent, config2.newGroupDelay);
      if (isolate == "full" || isolate == "after")
        state24 = state24.isolate();
      return state24;
    }
  });
  function history(config2 = {}) {
    return [
      historyField,
      historyConfig.of(config2)
    ];
  }
  function cmd(side, selection) {
    return function({state: state24, dispatch: dispatch2}) {
      let historyState = state24.field(historyField, false);
      if (!historyState)
        return false;
      let tr = historyState.pop(side, state24, selection);
      if (!tr)
        return false;
      dispatch2(tr);
      return true;
    };
  }
  var undo = cmd(0, false);
  var redo = cmd(1, false);
  var undoSelection = cmd(0, true);
  var redoSelection = cmd(1, true);
  function depth(side) {
    return function(state24) {
      let histState = state24.field(historyField, false);
      if (!histState)
        return 0;
      let branch = side == 0 ? histState.done : histState.undone;
      return branch.length - (branch.length && !branch[0].changes ? 1 : 0);
    };
  }
  var undoDepth = depth(0);
  var redoDepth = depth(1);
  var HistEvent = class {
    constructor(changes, effects, mapped, startSelection, selectionsAfter) {
      this.changes = changes;
      this.effects = effects;
      this.mapped = mapped;
      this.startSelection = startSelection;
      this.selectionsAfter = selectionsAfter;
    }
    setSelAfter(after) {
      return new HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
    }
    static fromTransaction(tr) {
      let effects = none3;
      for (let invert of tr.startState.facet(invertedEffects)) {
        let result = invert(tr);
        if (result.length)
          effects = effects.concat(result);
      }
      if (!effects.length && tr.changes.empty)
        return null;
      return new HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, tr.startState.selection, none3);
    }
    static selection(selections) {
      return new HistEvent(void 0, none3, void 0, void 0, selections);
    }
  };
  function updateBranch(branch, to, maxLen, newEvent) {
    let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
    let newBranch = branch.slice(start, to);
    newBranch.push(newEvent);
    return newBranch;
  }
  function isAdjacent(a, b) {
    let ranges = [], isAdjacent2 = false;
    a.iterChangedRanges((f, t2) => ranges.push(f, t2));
    b.iterChangedRanges((_f, _t, f, t2) => {
      for (let i = 0; i < ranges.length; ) {
        let from = ranges[i++], to = ranges[i++];
        if (t2 >= from && f <= to)
          isAdjacent2 = true;
      }
    });
    return isAdjacent2;
  }
  function eqSelectionShape(a, b) {
    return a.ranges.length == b.ranges.length && a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
  }
  function conc(a, b) {
    return !a.length ? b : !b.length ? a : a.concat(b);
  }
  var none3 = [];
  var MaxSelectionsPerEvent = 200;
  function addSelection(branch, selection) {
    if (!branch.length) {
      return [HistEvent.selection([selection])];
    } else {
      let lastEvent = branch[branch.length - 1];
      let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
      if (sels.length && sels[sels.length - 1].eq(selection))
        return branch;
      sels.push(selection);
      return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
    }
  }
  function popSelection(branch) {
    let last = branch[branch.length - 1];
    let newBranch = branch.slice();
    newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
    return newBranch;
  }
  function addMappingToBranch(branch, mapping) {
    if (!branch.length)
      return branch;
    let length = branch.length, selections = none3;
    while (length) {
      let event = mapEvent(branch[length - 1], mapping, selections);
      if (event.changes && !event.changes.empty || event.effects.length) {
        let result = branch.slice(0, length);
        result[length - 1] = event;
        return result;
      } else {
        mapping = event.mapped;
        length--;
        selections = event.selectionsAfter;
      }
    }
    return selections.length ? [HistEvent.selection(selections)] : none3;
  }
  function mapEvent(event, mapping, extraSelections) {
    let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none3, extraSelections);
    if (!event.changes)
      return HistEvent.selection(selections);
    let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
    let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
    return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
  }
  var HistoryState = class {
    constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
      this.done = done;
      this.undone = undone;
      this.prevTime = prevTime;
      this.prevUserEvent = prevUserEvent;
    }
    isolate() {
      return this.prevTime ? new HistoryState(this.done, this.undone) : this;
    }
    addChanges(event, time, userEvent, newGroupDelay, maxLen) {
      let done = this.done, lastEvent = done[done.length - 1];
      if (lastEvent && lastEvent.changes && time - this.prevTime < newGroupDelay && !lastEvent.selectionsAfter.length && lastEvent.changes.length && event.changes && isAdjacent(lastEvent.changes, event.changes)) {
        done = updateBranch(done, done.length - 1, maxLen, new HistEvent(event.changes.compose(lastEvent.changes), conc(event.effects, lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none3));
      } else {
        done = updateBranch(done, done.length, maxLen, event);
      }
      return new HistoryState(done, none3, time, userEvent);
    }
    addSelection(selection, time, userEvent, newGroupDelay) {
      let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none3;
      if (last.length > 0 && time - this.prevTime < newGroupDelay && userEvent == "keyboardselection" && this.prevUserEvent == userEvent && eqSelectionShape(last[last.length - 1], selection))
        return this;
      return new HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
    }
    addMapping(mapping) {
      return new HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
    }
    pop(side, state24, selection) {
      let branch = side == 0 ? this.done : this.undone;
      if (branch.length == 0)
        return null;
      let event = branch[branch.length - 1];
      if (selection && event.selectionsAfter.length) {
        return state24.update({
          selection: event.selectionsAfter[event.selectionsAfter.length - 1],
          annotations: fromHistory.of({side, rest: popSelection(branch)})
        });
      } else if (!event.changes) {
        return null;
      } else {
        let rest = branch.length == 1 ? none3 : branch.slice(0, branch.length - 1);
        if (event.mapped)
          rest = addMappingToBranch(rest, event.mapped);
        return state24.update({
          changes: event.changes,
          selection: event.startSelection,
          effects: event.effects,
          annotations: fromHistory.of({side, rest}),
          filter: false
        });
      }
    }
  };
  HistoryState.empty = new HistoryState(none3, none3);
  var historyKeymap = [
    {key: "Mod-z", run: undo, preventDefault: true},
    {key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true},
    {key: "Mod-u", run: undoSelection, preventDefault: true},
    {key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true}
  ];

  // node_modules/lezer-tree/dist/tree.es.js
  var DefaultBufferLength = 1024;
  var nextPropID = 0;
  var CachedNode = new WeakMap();
  var NodeProp = class {
    constructor({deserialize} = {}) {
      this.id = nextPropID++;
      this.deserialize = deserialize || (() => {
        throw new Error("This node type doesn't define a deserialize function");
      });
    }
    static string() {
      return new NodeProp({deserialize: (str) => str});
    }
    static number() {
      return new NodeProp({deserialize: Number});
    }
    static flag() {
      return new NodeProp({deserialize: () => true});
    }
    set(propObj, value) {
      propObj[this.id] = value;
      return propObj;
    }
    add(match) {
      if (typeof match != "function")
        match = NodeType.match(match);
      return (type) => {
        let result = match(type);
        return result === void 0 ? null : [this, result];
      };
    }
  };
  NodeProp.closedBy = new NodeProp({deserialize: (str) => str.split(" ")});
  NodeProp.openedBy = new NodeProp({deserialize: (str) => str.split(" ")});
  NodeProp.group = new NodeProp({deserialize: (str) => str.split(" ")});
  var noProps = Object.create(null);
  var NodeType = class {
    constructor(name2, props, id, flags = 0) {
      this.name = name2;
      this.props = props;
      this.id = id;
      this.flags = flags;
    }
    static define(spec) {
      let props = spec.props && spec.props.length ? Object.create(null) : noProps;
      let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
      let type = new NodeType(spec.name || "", props, spec.id, flags);
      if (spec.props)
        for (let src of spec.props) {
          if (!Array.isArray(src))
            src = src(type);
          if (src)
            src[0].set(props, src[1]);
        }
      return type;
    }
    prop(prop) {
      return this.props[prop.id];
    }
    get isTop() {
      return (this.flags & 1) > 0;
    }
    get isSkipped() {
      return (this.flags & 2) > 0;
    }
    get isError() {
      return (this.flags & 4) > 0;
    }
    get isAnonymous() {
      return (this.flags & 8) > 0;
    }
    is(name2) {
      if (typeof name2 == "string") {
        if (this.name == name2)
          return true;
        let group = this.prop(NodeProp.group);
        return group ? group.indexOf(name2) > -1 : false;
      }
      return this.id == name2;
    }
    static match(map) {
      let direct = Object.create(null);
      for (let prop in map)
        for (let name2 of prop.split(" "))
          direct[name2] = map[prop];
      return (node) => {
        for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
          let found = direct[i < 0 ? node.name : groups[i]];
          if (found)
            return found;
        }
      };
    }
  };
  NodeType.none = new NodeType("", Object.create(null), 0, 8);
  var Tree = class {
    constructor(type, children, positions, length) {
      this.type = type;
      this.children = children;
      this.positions = positions;
      this.length = length;
    }
    toString() {
      let children = this.children.map((c) => c.toString()).join();
      return !this.type.name ? children : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children.length ? "(" + children + ")" : "");
    }
    cursor(pos, side = 0) {
      let scope = pos != null && CachedNode.get(this) || this.topNode;
      let cursor = new TreeCursor(scope);
      if (pos != null) {
        cursor.moveTo(pos, side);
        CachedNode.set(this, cursor._tree);
      }
      return cursor;
    }
    fullCursor() {
      return new TreeCursor(this.topNode, true);
    }
    get topNode() {
      return new TreeNode(this, 0, 0, null);
    }
    resolve(pos, side = 0) {
      return this.cursor(pos, side).node;
    }
    iterate(spec) {
      let {enter, leave, from = 0, to = this.length} = spec;
      for (let c = this.cursor(); ; ) {
        let mustLeave = false;
        if (c.from <= to && c.to >= from && (c.type.isAnonymous || enter(c.type, c.from, c.to) !== false)) {
          if (c.firstChild())
            continue;
          if (!c.type.isAnonymous)
            mustLeave = true;
        }
        for (; ; ) {
          if (mustLeave && leave)
            leave(c.type, c.from, c.to);
          mustLeave = c.type.isAnonymous;
          if (c.nextSibling())
            break;
          if (!c.parent())
            return;
          mustLeave = true;
        }
      }
    }
    balance(maxBufferLength = DefaultBufferLength) {
      return this.children.length <= BalanceBranchFactor ? this : balanceRange(this.type, NodeType.none, this.children, this.positions, 0, this.children.length, 0, maxBufferLength, this.length);
    }
    static build(data) {
      return buildTree(data);
    }
  };
  Tree.empty = new Tree(NodeType.none, [], [], 0);
  var TreeBuffer = class {
    constructor(buffer, length, set, type = NodeType.none) {
      this.buffer = buffer;
      this.length = length;
      this.set = set;
      this.type = type;
    }
    toString() {
      let result = [];
      for (let index2 = 0; index2 < this.buffer.length; ) {
        result.push(this.childString(index2));
        index2 = this.buffer[index2 + 3];
      }
      return result.join(",");
    }
    childString(index2) {
      let id = this.buffer[index2], endIndex = this.buffer[index2 + 3];
      let type = this.set.types[id], result = type.name;
      if (/\W/.test(result) && !type.isError)
        result = JSON.stringify(result);
      index2 += 4;
      if (endIndex == index2)
        return result;
      let children = [];
      while (index2 < endIndex) {
        children.push(this.childString(index2));
        index2 = this.buffer[index2 + 3];
      }
      return result + "(" + children.join(",") + ")";
    }
    findChild(startIndex, endIndex, dir, after) {
      let {buffer} = this, pick = -1;
      for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
        if (after != -1e8) {
          let start = buffer[i + 1], end = buffer[i + 2];
          if (dir > 0) {
            if (end > after)
              pick = i;
            if (end > after)
              break;
          } else {
            if (start < after)
              pick = i;
            if (end >= after)
              break;
          }
        } else {
          pick = i;
          if (dir > 0)
            break;
        }
      }
      return pick;
    }
  };
  var TreeNode = class {
    constructor(node, from, index2, _parent) {
      this.node = node;
      this.from = from;
      this.index = index2;
      this._parent = _parent;
    }
    get type() {
      return this.node.type;
    }
    get name() {
      return this.node.type.name;
    }
    get to() {
      return this.from + this.node.length;
    }
    nextChild(i, dir, after, full = false) {
      for (let parent = this; ; ) {
        for (let {children, positions} = parent.node, e = dir > 0 ? children.length : -1; i != e; i += dir) {
          let next = children[i], start = positions[i] + parent.from;
          if (after != -1e8 && (dir < 0 ? start >= after : start + next.length <= after))
            continue;
          if (next instanceof TreeBuffer) {
            let index2 = next.findChild(0, next.buffer.length, dir, after == -1e8 ? -1e8 : after - start);
            if (index2 > -1)
              return new BufferNode(new BufferContext(parent, next, i, start), null, index2);
          } else if (full || (!next.type.isAnonymous || hasChild(next))) {
            let inner = new TreeNode(next, start, i, parent);
            return full || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, after);
          }
        }
        if (full || !parent.type.isAnonymous)
          return null;
        i = parent.index + dir;
        parent = parent._parent;
        if (!parent)
          return null;
      }
    }
    get firstChild() {
      return this.nextChild(0, 1, -1e8);
    }
    get lastChild() {
      return this.nextChild(this.node.children.length - 1, -1, -1e8);
    }
    childAfter(pos) {
      return this.nextChild(0, 1, pos);
    }
    childBefore(pos) {
      return this.nextChild(this.node.children.length - 1, -1, pos);
    }
    nextSignificantParent() {
      let val = this;
      while (val.type.isAnonymous && val._parent)
        val = val._parent;
      return val;
    }
    get parent() {
      return this._parent ? this._parent.nextSignificantParent() : null;
    }
    get nextSibling() {
      return this._parent ? this._parent.nextChild(this.index + 1, 1, -1) : null;
    }
    get prevSibling() {
      return this._parent ? this._parent.nextChild(this.index - 1, -1, -1) : null;
    }
    get cursor() {
      return new TreeCursor(this);
    }
    resolve(pos, side = 0) {
      return this.cursor.moveTo(pos, side).node;
    }
    getChild(type, before = null, after = null) {
      let r = getChildren(this, type, before, after);
      return r.length ? r[0] : null;
    }
    getChildren(type, before = null, after = null) {
      return getChildren(this, type, before, after);
    }
    toString() {
      return this.node.toString();
    }
  };
  function getChildren(node, type, before, after) {
    let cur2 = node.cursor, result = [];
    if (!cur2.firstChild())
      return result;
    if (before != null) {
      while (!cur2.type.is(before))
        if (!cur2.nextSibling())
          return result;
    }
    for (; ; ) {
      if (after != null && cur2.type.is(after))
        return result;
      if (cur2.type.is(type))
        result.push(cur2.node);
      if (!cur2.nextSibling())
        return after == null ? result : [];
    }
  }
  var BufferContext = class {
    constructor(parent, buffer, index2, start) {
      this.parent = parent;
      this.buffer = buffer;
      this.index = index2;
      this.start = start;
    }
  };
  var BufferNode = class {
    constructor(context, _parent, index2) {
      this.context = context;
      this._parent = _parent;
      this.index = index2;
      this.type = context.buffer.set.types[context.buffer.buffer[index2]];
    }
    get name() {
      return this.type.name;
    }
    get from() {
      return this.context.start + this.context.buffer.buffer[this.index + 1];
    }
    get to() {
      return this.context.start + this.context.buffer.buffer[this.index + 2];
    }
    child(dir, after) {
      let {buffer} = this.context;
      let index2 = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, after == -1e8 ? -1e8 : after - this.context.start);
      return index2 < 0 ? null : new BufferNode(this.context, this, index2);
    }
    get firstChild() {
      return this.child(1, -1e8);
    }
    get lastChild() {
      return this.child(-1, -1e8);
    }
    childAfter(pos) {
      return this.child(1, pos);
    }
    childBefore(pos) {
      return this.child(-1, pos);
    }
    get parent() {
      return this._parent || this.context.parent.nextSignificantParent();
    }
    externalSibling(dir) {
      return this._parent ? null : this.context.parent.nextChild(this.context.index + dir, dir, -1);
    }
    get nextSibling() {
      let {buffer} = this.context;
      let after = buffer.buffer[this.index + 3];
      if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
        return new BufferNode(this.context, this._parent, after);
      return this.externalSibling(1);
    }
    get prevSibling() {
      let {buffer} = this.context;
      let parentStart = this._parent ? this._parent.index + 4 : 0;
      if (this.index == parentStart)
        return this.externalSibling(-1);
      return new BufferNode(this.context, this._parent, buffer.findChild(parentStart, this.index, -1, -1e8));
    }
    get cursor() {
      return new TreeCursor(this);
    }
    resolve(pos, side = 0) {
      return this.cursor.moveTo(pos, side).node;
    }
    toString() {
      return this.context.buffer.childString(this.index);
    }
    getChild(type, before = null, after = null) {
      let r = getChildren(this, type, before, after);
      return r.length ? r[0] : null;
    }
    getChildren(type, before = null, after = null) {
      return getChildren(this, type, before, after);
    }
  };
  var TreeCursor = class {
    constructor(node, full = false) {
      this.full = full;
      this.buffer = null;
      this.stack = [];
      this.index = 0;
      this.bufferNode = null;
      if (node instanceof TreeNode) {
        this.yieldNode(node);
      } else {
        this._tree = node.context.parent;
        this.buffer = node.context;
        for (let n = node._parent; n; n = n._parent)
          this.stack.unshift(n.index);
        this.bufferNode = node;
        this.yieldBuf(node.index);
      }
    }
    get name() {
      return this.type.name;
    }
    yieldNode(node) {
      if (!node)
        return false;
      this._tree = node;
      this.type = node.type;
      this.from = node.from;
      this.to = node.to;
      return true;
    }
    yieldBuf(index2, type) {
      this.index = index2;
      let {start, buffer} = this.buffer;
      this.type = type || buffer.set.types[buffer.buffer[index2]];
      this.from = start + buffer.buffer[index2 + 1];
      this.to = start + buffer.buffer[index2 + 2];
      return true;
    }
    yield(node) {
      if (!node)
        return false;
      if (node instanceof TreeNode) {
        this.buffer = null;
        return this.yieldNode(node);
      }
      this.buffer = node.context;
      return this.yieldBuf(node.index, node.type);
    }
    toString() {
      return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
    }
    enter(dir, after) {
      if (!this.buffer)
        return this.yield(this._tree.nextChild(dir < 0 ? this._tree.node.children.length - 1 : 0, dir, after, this.full));
      let {buffer} = this.buffer;
      let index2 = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, after == -1e8 ? -1e8 : after - this.buffer.start);
      if (index2 < 0)
        return false;
      this.stack.push(this.index);
      return this.yieldBuf(index2);
    }
    firstChild() {
      return this.enter(1, -1e8);
    }
    lastChild() {
      return this.enter(-1, -1e8);
    }
    childAfter(pos) {
      return this.enter(1, pos);
    }
    childBefore(pos) {
      return this.enter(-1, pos);
    }
    parent() {
      if (!this.buffer)
        return this.yieldNode(this.full ? this._tree._parent : this._tree.parent);
      if (this.stack.length)
        return this.yieldBuf(this.stack.pop());
      let parent = this.full ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
      this.buffer = null;
      return this.yieldNode(parent);
    }
    sibling(dir) {
      if (!this.buffer)
        return !this._tree._parent ? false : this.yield(this._tree._parent.nextChild(this._tree.index + dir, dir, -1e8, this.full));
      let {buffer} = this.buffer, d = this.stack.length - 1;
      if (dir < 0) {
        let parentStart = d < 0 ? 0 : this.stack[d] + 4;
        if (this.index != parentStart)
          return this.yieldBuf(buffer.findChild(parentStart, this.index, -1, -1e8));
      } else {
        let after = buffer.buffer[this.index + 3];
        if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
          return this.yieldBuf(after);
      }
      return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, -1e8, this.full)) : false;
    }
    nextSibling() {
      return this.sibling(1);
    }
    prevSibling() {
      return this.sibling(-1);
    }
    atLastNode(dir) {
      let index2, parent, {buffer} = this;
      if (buffer) {
        if (dir > 0) {
          if (this.index < buffer.buffer.buffer.length)
            return false;
        } else {
          for (let i = 0; i < this.index; i++)
            if (buffer.buffer.buffer[i + 3] < this.index)
              return false;
        }
        ({index: index2, parent} = buffer);
      } else {
        ({index: index2, _parent: parent} = this._tree);
      }
      for (; parent; {index: index2, _parent: parent} = parent) {
        for (let i = index2 + dir, e = dir < 0 ? -1 : parent.node.children.length; i != e; i += dir) {
          let child = parent.node.children[i];
          if (this.full || !child.type.isAnonymous || child instanceof TreeBuffer || hasChild(child))
            return false;
        }
      }
      return true;
    }
    move(dir) {
      if (this.enter(dir, -1e8))
        return true;
      for (; ; ) {
        if (this.sibling(dir))
          return true;
        if (this.atLastNode(dir) || !this.parent())
          return false;
      }
    }
    next() {
      return this.move(1);
    }
    prev() {
      return this.move(-1);
    }
    moveTo(pos, side = 0) {
      while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
        if (!this.parent())
          break;
      for (; ; ) {
        if (side < 0 ? !this.childBefore(pos) : !this.childAfter(pos))
          break;
        if (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos)) {
          this.parent();
          break;
        }
      }
      return this;
    }
    get node() {
      if (!this.buffer)
        return this._tree;
      let cache = this.bufferNode, result = null, depth2 = 0;
      if (cache && cache.context == this.buffer) {
        scan:
          for (let index2 = this.index, d = this.stack.length; d >= 0; ) {
            for (let c = cache; c; c = c._parent)
              if (c.index == index2) {
                if (index2 == this.index)
                  return c;
                result = c;
                depth2 = d + 1;
                break scan;
              }
            index2 = this.stack[--d];
          }
      }
      for (let i = depth2; i < this.stack.length; i++)
        result = new BufferNode(this.buffer, result, this.stack[i]);
      return this.bufferNode = new BufferNode(this.buffer, result, this.index);
    }
    get tree() {
      return this.buffer ? null : this._tree.node;
    }
  };
  function hasChild(tree) {
    return tree.children.some((ch) => !ch.type.isAnonymous || ch instanceof TreeBuffer || hasChild(ch));
  }
  var FlatBufferCursor = class {
    constructor(buffer, index2) {
      this.buffer = buffer;
      this.index = index2;
    }
    get id() {
      return this.buffer[this.index - 4];
    }
    get start() {
      return this.buffer[this.index - 3];
    }
    get end() {
      return this.buffer[this.index - 2];
    }
    get size() {
      return this.buffer[this.index - 1];
    }
    get pos() {
      return this.index;
    }
    next() {
      this.index -= 4;
    }
    fork() {
      return new FlatBufferCursor(this.buffer, this.index);
    }
  };
  var BalanceBranchFactor = 8;
  function buildTree(data) {
    var _a;
    let {buffer, nodeSet, topID = 0, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length} = data;
    let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
    let types2 = nodeSet.types;
    function takeNode(parentStart, minPos, children2, positions2, inRepeat) {
      let {id, start, end, size} = cursor;
      while (id == inRepeat) {
        cursor.next();
        ({id, start, end, size} = cursor);
      }
      let startPos = start - parentStart;
      if (size < 0) {
        children2.push(reused[id]);
        positions2.push(startPos);
        cursor.next();
        return;
      }
      let type = types2[id], node, buffer2;
      if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
        let data2 = new Uint16Array(buffer2.size - buffer2.skip);
        let endPos = cursor.pos - buffer2.size, index2 = data2.length;
        while (cursor.pos > endPos)
          index2 = copyToBuffer(buffer2.start, data2, index2, inRepeat);
        node = new TreeBuffer(data2, end - buffer2.start, nodeSet, inRepeat < 0 ? NodeType.none : types2[inRepeat]);
        startPos = buffer2.start - parentStart;
      } else {
        let endPos = cursor.pos - size;
        cursor.next();
        let localChildren = [], localPositions = [];
        let localInRepeat = id >= minRepeatType ? id : -1;
        while (cursor.pos > endPos)
          takeNode(start, endPos, localChildren, localPositions, localInRepeat);
        localChildren.reverse();
        localPositions.reverse();
        if (localInRepeat > -1 && localChildren.length > BalanceBranchFactor)
          node = balanceRange(type, type, localChildren, localPositions, 0, localChildren.length, 0, maxBufferLength, end - start);
        else
          node = new Tree(type, localChildren, localPositions, end - start);
      }
      children2.push(node);
      positions2.push(startPos);
    }
    function findBufferSize(maxSize, inRepeat) {
      let fork = cursor.fork();
      let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
      let result = {size: 0, start: 0, skip: 0};
      scan:
        for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
          if (fork.id == inRepeat) {
            result.size = size;
            result.start = start;
            result.skip = skip;
            skip += 4;
            size += 4;
            fork.next();
            continue;
          }
          let nodeSize = fork.size, startPos = fork.pos - nodeSize;
          if (nodeSize < 0 || startPos < minPos || fork.start < minStart)
            break;
          let localSkipped = fork.id >= minRepeatType ? 4 : 0;
          let nodeStart2 = fork.start;
          fork.next();
          while (fork.pos > startPos) {
            if (fork.size < 0)
              break scan;
            if (fork.id >= minRepeatType)
              localSkipped += 4;
            fork.next();
          }
          start = nodeStart2;
          size += nodeSize;
          skip += localSkipped;
        }
      if (inRepeat < 0 || size == maxSize) {
        result.size = size;
        result.start = start;
        result.skip = skip;
      }
      return result.size > 4 ? result : void 0;
    }
    function copyToBuffer(bufferStart, buffer2, index2, inRepeat) {
      let {id, start, end, size} = cursor;
      cursor.next();
      if (id == inRepeat)
        return index2;
      let startIndex = index2;
      if (size > 4) {
        let endPos = cursor.pos - (size - 4);
        while (cursor.pos > endPos)
          index2 = copyToBuffer(bufferStart, buffer2, index2, inRepeat);
      }
      if (id < minRepeatType) {
        buffer2[--index2] = startIndex;
        buffer2[--index2] = end - bufferStart;
        buffer2[--index2] = start - bufferStart;
        buffer2[--index2] = id;
      }
      return index2;
    }
    let children = [], positions = [];
    while (cursor.pos > 0)
      takeNode(data.start || 0, 0, children, positions, -1);
    let length = (_a = data.length) !== null && _a !== void 0 ? _a : children.length ? positions[0] + children[0].length : 0;
    return new Tree(types2[topID], children.reverse(), positions.reverse(), length);
  }
  function balanceRange(outerType, innerType, children, positions, from, to, start, maxBufferLength, length) {
    let localChildren = [], localPositions = [];
    if (length <= maxBufferLength) {
      for (let i = from; i < to; i++) {
        localChildren.push(children[i]);
        localPositions.push(positions[i] - start);
      }
    } else {
      let maxChild = Math.max(maxBufferLength, Math.ceil(length * 1.5 / BalanceBranchFactor));
      for (let i = from; i < to; ) {
        let groupFrom = i, groupStart = positions[i];
        i++;
        for (; i < to; i++) {
          let nextEnd = positions[i] + children[i].length;
          if (nextEnd - groupStart > maxChild)
            break;
        }
        if (i == groupFrom + 1) {
          let only = children[groupFrom];
          if (only instanceof Tree && only.type == innerType && only.length > maxChild << 1) {
            for (let j = 0; j < only.children.length; j++) {
              localChildren.push(only.children[j]);
              localPositions.push(only.positions[j] + groupStart - start);
            }
            continue;
          }
          localChildren.push(only);
        } else if (i == groupFrom + 1) {
          localChildren.push(children[groupFrom]);
        } else {
          let inner = balanceRange(innerType, innerType, children, positions, groupFrom, i, groupStart, maxBufferLength, positions[i - 1] + children[i - 1].length - groupStart);
          if (innerType != NodeType.none && !containsType(inner.children, innerType))
            inner = new Tree(NodeType.none, inner.children, inner.positions, inner.length);
          localChildren.push(inner);
        }
        localPositions.push(groupStart - start);
      }
    }
    return new Tree(outerType, localChildren, localPositions, length);
  }
  function containsType(nodes, type) {
    for (let elt2 of nodes)
      if (elt2.type == type)
        return true;
    return false;
  }

  // node_modules/@codemirror/next/highlight/dist/index.js
  var nextTagID = 0;
  var Tag = class {
    constructor(set, base2, modified) {
      this.set = set;
      this.base = base2;
      this.modified = modified;
      this.id = nextTagID++;
    }
    static define(parent) {
      if (parent === null || parent === void 0 ? void 0 : parent.base)
        throw new Error("Can not derive from a modified tag");
      let tag = new Tag([], null, []);
      tag.set.push(tag);
      if (parent)
        for (let t2 of parent.set)
          tag.set.push(t2);
      return tag;
    }
    static defineModifier() {
      let mod = new Modifier();
      return (tag) => {
        if (tag.modified.indexOf(mod) > -1)
          return tag;
        return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
      };
    }
  };
  var nextModifierID = 0;
  var Modifier = class {
    constructor() {
      this.instances = [];
      this.id = nextModifierID++;
    }
    static get(base2, mods) {
      if (!mods.length)
        return base2;
      let exists = mods[0].instances.find((t2) => t2.base == base2 && sameArray2(mods, t2.modified));
      if (exists)
        return exists;
      let set = [], tag = new Tag(set, base2, mods);
      for (let m of mods)
        m.instances.push(tag);
      let configs = permute(mods);
      for (let parent of base2.set)
        for (let config2 of configs)
          set.push(Modifier.get(parent, config2));
      return tag;
    }
  };
  function sameArray2(a, b) {
    return a.length == b.length && a.every((x, i) => x == b[i]);
  }
  function permute(array) {
    let result = [array];
    for (let i = 0; i < array.length; i++) {
      for (let a of permute(array.slice(0, i).concat(array.slice(i + 1))))
        result.push(a);
    }
    return result;
  }
  var ruleNodeProp = new NodeProp();
  var highlightStyleProp = Facet.define({
    combine(stylings) {
      return stylings.length ? stylings[0] : null;
    }
  });
  function highlightStyle(...specs) {
    let styling = new Styling(specs);
    return [
      highlightStyleProp.of(styling),
      EditorView.styleModule.of(styling.module)
    ];
  }
  var Styling = class {
    constructor(spec) {
      this.map = Object.create(null);
      let modSpec = Object.create(null);
      for (let style of spec) {
        let cls = StyleModule.newName();
        modSpec["." + cls] = Object.assign({}, style, {tag: null});
        let tags2 = style.tag;
        if (!Array.isArray(tags2))
          tags2 = [tags2];
        for (let tag of tags2)
          this.map[tag.id] = cls;
      }
      this.module = new StyleModule(modSpec);
    }
    match(tag) {
      for (let t2 of tag.set) {
        let match = this.map[t2.id];
        if (match) {
          if (t2 != tag)
            this.map[tag.id] = match;
          return match;
        }
      }
      return this.map[tag.id] = null;
    }
  };
  var t = Tag.define;
  var comment = t();
  var name = t();
  var literal = t();
  var string = t(literal);
  var number = t(literal);
  var content = t();
  var heading = t(content);
  var keyword = t();
  var operator = t();
  var punctuation = t();
  var bracket = t(punctuation);
  var meta = t();
  var tags = {
    comment,
    lineComment: t(comment),
    blockComment: t(comment),
    docComment: t(comment),
    name,
    variableName: t(name),
    typeName: t(name),
    propertyName: t(name),
    className: t(name),
    labelName: t(name),
    namespace: t(name),
    macroName: t(name),
    literal,
    string,
    docString: t(string),
    character: t(string),
    number,
    integer: t(number),
    float: t(number),
    bool: t(literal),
    regexp: t(literal),
    escape: t(literal),
    color: t(literal),
    url: t(literal),
    keyword,
    self: t(keyword),
    null: t(keyword),
    atom: t(keyword),
    unit: t(keyword),
    modifier: t(keyword),
    operatorKeyword: t(keyword),
    controlKeyword: t(keyword),
    definitionKeyword: t(keyword),
    operator,
    derefOperator: t(operator),
    arithmeticOperator: t(operator),
    logicOperator: t(operator),
    bitwiseOperator: t(operator),
    compareOperator: t(operator),
    updateOperator: t(operator),
    definitionOperator: t(operator),
    typeOperator: t(operator),
    controlOperator: t(operator),
    punctuation,
    separator: t(punctuation),
    bracket,
    angleBracket: t(bracket),
    squareBracket: t(bracket),
    paren: t(bracket),
    brace: t(bracket),
    content,
    heading,
    heading1: t(heading),
    heading2: t(heading),
    heading3: t(heading),
    heading4: t(heading),
    heading5: t(heading),
    heading6: t(heading),
    list: t(content),
    quote: t(content),
    emphasis: t(content),
    strong: t(content),
    link: t(content),
    monospace: t(content),
    inserted: t(),
    deleted: t(),
    changed: t(),
    invalid: t(),
    meta,
    documentMeta: t(meta),
    annotation: t(meta),
    processingInstruction: t(meta),
    definition: Tag.defineModifier(),
    constant: Tag.defineModifier(),
    function: Tag.defineModifier(),
    standard: Tag.defineModifier(),
    local: Tag.defineModifier(),
    special: Tag.defineModifier()
  };
  var defaultHighlightStyle = precedence(highlightStyle({
    tag: tags.deleted,
    textDecoration: "line-through"
  }, {
    tag: [tags.inserted, tags.link],
    textDecoration: "underline"
  }, {
    tag: tags.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  }, {
    tag: tags.emphasis,
    fontStyle: "italic"
  }, {
    tag: tags.strong,
    fontWeight: "bold"
  }, {
    tag: tags.keyword,
    color: "#708"
  }, {
    tag: [tags.atom, tags.bool, tags.url],
    color: "#219"
  }, {
    tag: tags.number,
    color: "#164"
  }, {
    tag: tags.string,
    color: "#a11"
  }, {
    tag: [tags.regexp, tags.escape, tags.special(tags.string)],
    color: "#e40"
  }, {
    tag: tags.definition(tags.variableName),
    color: "#00f"
  }, {
    tag: tags.typeName,
    color: "#085"
  }, {
    tag: tags.className,
    color: "#167"
  }, {
    tag: tags.special(tags.variableName),
    color: "#256"
  }, {
    tag: tags.definition(tags.propertyName),
    color: "#00c"
  }, {
    tag: tags.comment,
    color: "#940"
  }, {
    tag: tags.meta,
    color: "#555"
  }, {
    tag: tags.invalid,
    color: "#f00"
  }), "fallback");

  // node_modules/@codemirror/next/language/dist/index.js
  var language = Facet.define();
  var languageDataProp = new NodeProp();
  function syntaxTree(state24) {
    let lang = state24.facet(language);
    return lang.length ? lang[0].getTree(state24) : Tree.empty;
  }
  var requestIdle = typeof window != "undefined" && window.requestIdleCallback || ((callback, {timeout}) => setTimeout(callback, timeout));
  var cancelIdle = typeof window != "undefined" && window.cancelIdleCallback || clearTimeout;
  var indentService = Facet.define();
  var indentUnit = Facet.define({
    combine: (values) => {
      if (!values.length)
        return "  ";
      if (!/^(?: +|\t+)$/.test(values[0]))
        throw new Error("Invalid indent unit: " + JSON.stringify(values[0]));
      return values[0];
    }
  });
  function getIndentUnit(state24) {
    let unit = state24.facet(indentUnit);
    return unit.charCodeAt(0) == 9 ? state24.tabSize * unit.length : unit.length;
  }
  function indentString(state24, cols) {
    let result = "", ts = state24.tabSize;
    if (state24.facet(indentUnit).charCodeAt(0) == 9)
      while (cols >= ts) {
        result += "	";
        cols -= ts;
      }
    for (let i = 0; i < cols; i++)
      result += " ";
    return result;
  }
  function getIndentation(context, pos) {
    if (context instanceof EditorState)
      context = new IndentContext(context);
    for (let service of context.state.facet(indentService)) {
      let result = service(context, pos);
      if (result != null)
        return result;
    }
    let tree = syntaxTree(context.state);
    return tree ? syntaxIndentation(context, tree, pos) : null;
  }
  var IndentContext = class {
    constructor(state24, options = {}) {
      this.state = state24;
      this.options = options;
      this.unit = getIndentUnit(state24);
    }
    textAfterPos(pos) {
      var _a, _b;
      let sim = (_a = this.options) === null || _a === void 0 ? void 0 : _a.simulateBreak;
      if (pos == sim && ((_b = this.options) === null || _b === void 0 ? void 0 : _b.simulateDoubleBreak))
        return "";
      return this.state.sliceDoc(pos, Math.min(pos + 100, sim != null && sim > pos ? sim : 1e9, this.state.doc.lineAt(pos).to));
    }
    countColumn(line, pos) {
      return countColumn(pos < 0 ? line : line.slice(0, pos), 0, this.state.tabSize);
    }
    lineIndent(line) {
      var _a;
      let override = (_a = this.options) === null || _a === void 0 ? void 0 : _a.overrideIndentation;
      if (override) {
        let overriden = override(line.from);
        if (overriden > -1)
          return overriden;
      }
      let text9 = line.slice(0, Math.min(100, line.length));
      return this.countColumn(text9, text9.search(/\S/));
    }
    column(pos) {
      var _a;
      let line = this.state.doc.lineAt(pos), text9 = line.slice(0, pos - line.from);
      let result = this.countColumn(text9, pos - line.from);
      let override = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.overrideIndentation) ? this.options.overrideIndentation(line.from) : -1;
      if (override > -1)
        result += override - this.countColumn(text9, text9.search(/\S/));
      return result;
    }
  };
  var indentNodeProp = new NodeProp();
  function syntaxIndentation(cx, ast, pos) {
    let tree = ast.resolve(pos);
    for (let scan = tree, scanPos = pos; ; ) {
      let last = scan.childBefore(scanPos);
      if (!last)
        break;
      if (last.type.isError && last.from == last.to) {
        tree = scan;
        scanPos = last.from;
      } else {
        scan = last;
        scanPos = scan.to + 1;
      }
    }
    for (; tree; tree = tree.parent) {
      let strategy = indentStrategy(tree);
      if (strategy)
        return strategy(new TreeIndentContext(cx, pos, tree));
    }
    return null;
  }
  function ignoreClosed(cx) {
    var _a, _b;
    return cx.pos == ((_a = cx.options) === null || _a === void 0 ? void 0 : _a.simulateBreak) && ((_b = cx.options) === null || _b === void 0 ? void 0 : _b.simulateDoubleBreak);
  }
  function indentStrategy(tree) {
    let strategy = tree.type.prop(indentNodeProp);
    if (strategy)
      return strategy;
    let first = tree.firstChild, close;
    if (first && (close = first.type.prop(NodeProp.closedBy))) {
      let last = tree.lastChild, closed = last && close.indexOf(last.name) > -1;
      return (cx) => delimitedStrategy(cx, true, 1, void 0, closed && !ignoreClosed(cx) ? last.from : void 0);
    }
    return tree.parent == null ? topIndent : null;
  }
  function topIndent() {
    return 0;
  }
  var TreeIndentContext = class extends IndentContext {
    constructor(base2, pos, node) {
      super(base2.state, base2.options);
      this.pos = pos;
      this.node = node;
    }
    get textAfter() {
      return this.textAfterPos(this.pos);
    }
    get baseIndent() {
      let line = this.state.doc.lineAt(this.node.from);
      for (; ; ) {
        let atBreak = this.node.resolve(line.from);
        while (atBreak.parent && atBreak.parent.from == atBreak.from)
          atBreak = atBreak.parent;
        if (isParent(atBreak, this.node))
          break;
        line = this.state.doc.lineAt(atBreak.from);
      }
      return this.lineIndent(line);
    }
  };
  function isParent(parent, of) {
    for (let cur2 = of; cur2; cur2 = cur2.parent)
      if (parent == cur2)
        return true;
    return false;
  }
  function bracketedAligned(context) {
    var _a;
    let tree = context.node;
    let openToken = tree.childAfter(tree.from), last = tree.lastChild;
    if (!openToken)
      return null;
    let sim = (_a = context.options) === null || _a === void 0 ? void 0 : _a.simulateBreak;
    let openLine = context.state.doc.lineAt(openToken.from);
    let lineEnd = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
    for (let pos = openToken.to; ; ) {
      let next = tree.childAfter(pos);
      if (!next || next == last)
        return null;
      if (!next.type.isSkipped)
        return next.from < lineEnd ? openToken : null;
      pos = next.to;
    }
  }
  function delimitedStrategy(context, align, units, closing2, closedAt) {
    let after = context.textAfter, space = after.match(/^\s*/)[0].length;
    let closed = closing2 && after.slice(space, space + closing2.length) == closing2 || closedAt == context.pos + space;
    let aligned = align ? bracketedAligned(context) : null;
    if (aligned)
      return closed ? context.column(aligned.from) : context.column(aligned.to);
    return context.baseIndent + (closed ? 0 : context.unit * units);
  }
  var DontIndentBeyond = 200;
  function indentOnInput() {
    return EditorState.transactionFilter.of((tr) => {
      if (!tr.docChanged || tr.annotation(Transaction.userEvent) != "input")
        return tr;
      let rules = tr.startState.languageDataAt("indentOnInput", tr.startState.selection.primary.head);
      if (!rules.length)
        return tr;
      let doc2 = tr.newDoc, {head} = tr.newSelection.primary, line = doc2.lineAt(head);
      if (head > line.from + DontIndentBeyond)
        return tr;
      let lineStart = doc2.sliceString(line.from, head);
      if (!rules.some((r) => r.test(lineStart)))
        return tr;
      let {state: state24} = tr, last = -1, changes = [];
      for (let {head: head2} of state24.selection.ranges) {
        let line2 = state24.doc.lineAt(head2);
        if (line2.from == last)
          continue;
        last = line2.from;
        let indent = getIndentation(state24, line2.from);
        if (indent == null)
          continue;
        let cur2 = /^\s*/.exec(line2.slice(0, Math.min(line2.length, DontIndentBeyond)))[0];
        let norm = indentString(state24, indent);
        if (cur2 != norm)
          changes.push({from: line2.from, to: line2.from + cur2.length, insert: norm});
      }
      return changes.length ? [tr, {changes}] : tr;
    });
  }
  var foldService = Facet.define();
  var foldNodeProp = new NodeProp();
  function syntaxFolding(state24, start, end) {
    let tree = syntaxTree(state24);
    if (tree.length == 0)
      return null;
    let inner = tree.resolve(end);
    let found = null;
    for (let cur2 = inner; cur2; cur2 = cur2.parent) {
      if (cur2.to <= end || cur2.from > end)
        continue;
      if (found && cur2.from < start)
        break;
      let prop = cur2.type.prop(foldNodeProp);
      if (prop) {
        let value = prop(cur2, state24);
        if (value && value.from <= end && value.from >= start && value.to > end)
          found = value;
      }
    }
    return found;
  }
  function foldable(state24, lineStart, lineEnd) {
    for (let service of state24.facet(foldService)) {
      let result = service(state24, lineStart, lineEnd);
      if (result)
        return result;
    }
    return syntaxFolding(state24, lineStart, lineEnd);
  }

  // node_modules/@codemirror/next/gutter/dist/index.js
  var GutterMarker = class extends RangeValue {
    compare(other) {
      return this == other || this.constructor == other.constructor && this.eq(other);
    }
    toDOM(_view) {
      return null;
    }
    at(pos) {
      return new Range(pos, pos, this);
    }
  };
  GutterMarker.prototype.elementClass = "";
  GutterMarker.prototype.mapMode = MapMode.TrackBefore;
  var defaults = {
    style: "",
    renderEmptyElements: false,
    elementStyle: "",
    markers: () => RangeSet.empty,
    lineMarker: () => null,
    initialSpacer: null,
    updateSpacer: null,
    domEventHandlers: {}
  };
  var activeGutters = Facet.define();
  function gutter(config2) {
    return [gutters(), activeGutters.of(Object.assign(Object.assign({}, defaults), config2))];
  }
  var baseTheme2 = EditorView.baseTheme({
    $gutters: {
      display: "flex",
      height: "100%",
      boxSizing: "border-box",
      left: 0
    },
    "$$light $gutters": {
      backgroundColor: "#f5f5f5",
      color: "#999",
      borderRight: "1px solid #ddd"
    },
    "$$dark $gutters": {
      backgroundColor: "#333338",
      color: "#ccc"
    },
    $gutter: {
      display: "flex !important",
      flexDirection: "column",
      flexShrink: 0,
      boxSizing: "border-box",
      height: "100%",
      overflow: "hidden"
    },
    $gutterElement: {
      boxSizing: "border-box"
    },
    "$gutterElement.lineNumber": {
      padding: "0 3px 0 5px",
      minWidth: "20px",
      textAlign: "right",
      whiteSpace: "nowrap"
    }
  });
  var unfixGutters = Facet.define({
    combine: (values) => values.some((x) => x)
  });
  function gutters(config2) {
    let result = [
      gutterView,
      baseTheme2
    ];
    if (config2 && config2.fixed === false)
      result.push(unfixGutters.of(true));
    return result;
  }
  var gutterView = ViewPlugin.fromClass(class {
    constructor(view22) {
      this.view = view22;
      this.dom = document.createElement("div");
      this.dom.className = themeClass("gutters");
      this.dom.setAttribute("aria-hidden", "true");
      this.gutters = view22.state.facet(activeGutters).map((conf) => new SingleGutterView(view22, conf));
      for (let gutter5 of this.gutters)
        this.dom.appendChild(gutter5.dom);
      this.fixed = !view22.state.facet(unfixGutters);
      if (this.fixed) {
        this.dom.style.position = "sticky";
      }
      view22.scrollDOM.insertBefore(this.dom, view22.contentDOM);
    }
    update(update) {
      if (!this.updateGutters(update))
        return;
      let contexts = this.gutters.map((gutter5) => new UpdateContext(gutter5, this.view.viewport));
      this.view.viewportLines((line) => {
        let text9;
        if (Array.isArray(line.type)) {
          for (let b of line.type)
            if (b.type == BlockType.Text) {
              text9 = b;
              break;
            }
        } else {
          text9 = line.type == BlockType.Text ? line : void 0;
        }
        if (!text9)
          return;
        for (let cx of contexts)
          cx.line(this.view, text9);
      }, 0);
      for (let cx of contexts)
        cx.finish();
      this.dom.style.minHeight = this.view.contentHeight + "px";
      if (update.state.facet(unfixGutters) != !this.fixed) {
        this.fixed = !this.fixed;
        this.dom.style.position = this.fixed ? "sticky" : "";
      }
    }
    updateGutters(update) {
      let prev = update.prevState.facet(activeGutters), cur2 = update.state.facet(activeGutters);
      let change = update.docChanged || update.heightChanged || update.viewportChanged;
      if (prev == cur2) {
        for (let gutter5 of this.gutters)
          if (gutter5.update(update))
            change = true;
      } else {
        change = true;
        let gutters2 = [];
        for (let conf of cur2) {
          let known = prev.indexOf(conf);
          if (known < 0) {
            gutters2.push(new SingleGutterView(this.view, conf));
          } else {
            this.gutters[known].update(update);
            gutters2.push(this.gutters[known]);
          }
        }
        for (let g of this.gutters)
          g.dom.remove();
        for (let g of gutters2)
          this.dom.appendChild(g.dom);
        this.gutters = gutters2;
      }
      return change;
    }
    destroy() {
      this.dom.remove();
    }
  }, {
    provide: PluginField.scrollMargins.from((value) => {
      if (value.gutters.length == 0 || !value.fixed)
        return null;
      return value.view.textDirection == Direction.LTR ? {left: value.dom.offsetWidth} : {right: value.dom.offsetWidth};
    })
  });
  var UpdateContext = class {
    constructor(gutter5, viewport) {
      this.gutter = gutter5;
      this.localMarkers = [];
      this.i = 0;
      this.height = 0;
      this.cursor = RangeSet.iter(Array.isArray(gutter5.markers) ? gutter5.markers : [gutter5.markers], viewport.from);
    }
    line(view22, line) {
      if (this.localMarkers.length)
        this.localMarkers = [];
      while (this.cursor.value && this.cursor.from <= line.from) {
        if (this.cursor.from == line.from)
          this.localMarkers.push(this.cursor.value);
        this.cursor.next();
      }
      let forLine = this.gutter.config.lineMarker(view22, line, this.localMarkers);
      if (forLine)
        this.localMarkers.unshift(forLine);
      let gutter5 = this.gutter;
      if (this.localMarkers.length == 0 && !gutter5.config.renderEmptyElements)
        return;
      let above = line.top - this.height;
      if (this.i == gutter5.elements.length) {
        let newElt = new GutterElement(view22, line.height, above, this.localMarkers, gutter5.elementClass);
        gutter5.elements.push(newElt);
        gutter5.dom.appendChild(newElt.dom);
      } else {
        let markers = this.localMarkers, elt2 = gutter5.elements[this.i];
        if (sameMarkers(markers, elt2.markers)) {
          markers = elt2.markers;
          this.localMarkers.length = 0;
        }
        elt2.update(view22, line.height, above, markers, gutter5.elementClass);
      }
      this.height = line.bottom;
      this.i++;
    }
    finish() {
      let gutter5 = this.gutter;
      while (gutter5.elements.length > this.i)
        gutter5.dom.removeChild(gutter5.elements.pop().dom);
    }
  };
  var SingleGutterView = class {
    constructor(view22, config2) {
      this.view = view22;
      this.config = config2;
      this.elements = [];
      this.spacer = null;
      this.dom = document.createElement("div");
      this.dom.className = themeClass("gutter" + (this.config.style ? "." + this.config.style : ""));
      this.elementClass = themeClass("gutterElement" + (this.config.style ? "." + this.config.style : ""));
      for (let prop in config2.domEventHandlers) {
        this.dom.addEventListener(prop, (event) => {
          let line = view22.visualLineAtHeight(event.clientY, view22.contentDOM.getBoundingClientRect().top);
          if (config2.domEventHandlers[prop](view22, line, event))
            event.preventDefault();
        });
      }
      this.markers = config2.markers(view22.state);
      if (config2.initialSpacer) {
        this.spacer = new GutterElement(view22, 0, 0, [config2.initialSpacer(view22)], this.elementClass);
        this.dom.appendChild(this.spacer.dom);
        this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none";
      }
    }
    update(update) {
      let prevMarkers = this.markers;
      this.markers = this.config.markers(update.state);
      if (this.spacer && this.config.updateSpacer) {
        let updated = this.config.updateSpacer(this.spacer.markers[0], update);
        if (updated != this.spacer.markers[0])
          this.spacer.update(update.view, 0, 0, [updated], this.elementClass);
      }
      return this.markers != prevMarkers;
    }
  };
  var GutterElement = class {
    constructor(view22, height, above, markers, eltClass) {
      this.height = -1;
      this.above = 0;
      this.dom = document.createElement("div");
      this.update(view22, height, above, markers, eltClass);
    }
    update(view22, height, above, markers, cssClass) {
      if (this.height != height)
        this.dom.style.height = (this.height = height) + "px";
      if (this.above != above)
        this.dom.style.marginTop = (this.above = above) ? above + "px" : "";
      if (this.markers != markers) {
        this.markers = markers;
        for (let ch; ch = this.dom.lastChild; )
          ch.remove();
        let cls = cssClass;
        for (let m of markers) {
          let dom6 = m.toDOM(view22);
          if (dom6)
            this.dom.appendChild(dom6);
          let c = m.elementClass;
          if (c)
            cls += " " + c;
        }
        this.dom.className = cls;
      }
    }
  };
  function sameMarkers(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++)
      if (!a[i].compare(b[i]))
        return false;
    return true;
  }
  var lineNumberMarkers = Facet.define();
  var lineNumberConfig = Facet.define({
    combine(values) {
      return combineConfig(values, {formatNumber: String, domEventHandlers: {}}, {
        domEventHandlers(a, b) {
          let result = Object.assign({}, a);
          for (let event in b) {
            let exists = result[event], add = b[event];
            result[event] = exists ? (view22, line, event2) => exists(view22, line, event2) || add(view22, line, event2) : add;
          }
          return result;
        }
      });
    }
  });
  var NumberMarker = class extends GutterMarker {
    constructor(number2) {
      super();
      this.number = number2;
    }
    eq(other) {
      return this.number == other.number;
    }
    toDOM(view22) {
      let config2 = view22.state.facet(lineNumberConfig);
      return document.createTextNode(config2.formatNumber(this.number));
    }
  };
  var lineNumberGutter = gutter({
    style: "lineNumber",
    markers(state24) {
      return state24.facet(lineNumberMarkers);
    },
    lineMarker(view22, line, others) {
      if (others.length)
        return null;
      return new NumberMarker(view22.state.doc.lineAt(line.from).number);
    },
    initialSpacer(view22) {
      return new NumberMarker(maxLineNumber(view22.state.doc.lines));
    },
    updateSpacer(spacer, update) {
      let max = maxLineNumber(update.view.state.doc.lines);
      return max == spacer.number ? spacer : new NumberMarker(max);
    }
  });
  function lineNumbers(config2 = {}) {
    return [
      lineNumberConfig.of(config2),
      lineNumberGutter
    ];
  }
  function maxLineNumber(lines) {
    let last = 9;
    while (last < lines)
      last = last * 10 + 9;
    return last;
  }

  // node_modules/@codemirror/next/fold/dist/index.js
  function mapRange(range, mapping) {
    let from = mapping.mapPos(range.from, 1), to = mapping.mapPos(range.to, -1);
    return from >= to ? void 0 : {from, to};
  }
  var foldEffect = StateEffect.define({map: mapRange});
  var unfoldEffect = StateEffect.define({map: mapRange});
  function selectedLines(view22) {
    let lines = [];
    for (let {head} of view22.state.selection.ranges) {
      if (lines.some((l) => l.from <= head && l.to >= head))
        continue;
      lines.push(view22.visualLineAt(head));
    }
    return lines;
  }
  var foldState = StateField.define({
    create() {
      return Decoration.none;
    },
    update(folded, tr) {
      folded = folded.map(tr.changes);
      for (let e of tr.effects) {
        if (e.is(foldEffect) && !foldExists(folded, e.value.from, e.value.to))
          folded = folded.update({add: [foldWidget.range(e.value.from, e.value.to)]});
        else if (e.is(unfoldEffect)) {
          folded = folded.update({
            filter: (from, to) => e.value.from != from || e.value.to != to,
            filterFrom: e.value.from,
            filterTo: e.value.to
          });
        }
      }
      if (tr.selection) {
        let onSelection = false, {head} = tr.selection.primary;
        folded.between(head, head, (a, b) => {
          if (a < head && b > head)
            onSelection = true;
        });
        if (onSelection)
          folded = folded.update({
            filterFrom: head,
            filterTo: head,
            filter: (a, b) => b <= head || a >= head
          });
      }
      return folded;
    },
    provide: [EditorView.decorations]
  });
  function foldInside(state24, from, to) {
    var _a;
    let found = null;
    (_a = state24.field(foldState, false)) === null || _a === void 0 ? void 0 : _a.between(from, to, (from2, to2) => {
      if (!found || found.from > from2)
        found = {from: from2, to: to2};
    });
    return found;
  }
  function foldExists(folded, from, to) {
    let found = false;
    folded.between(from, from, (a, b) => {
      if (a == from && b == to)
        found = true;
    });
    return found;
  }
  function maybeEnable(state24) {
    return state24.field(foldState, false) ? void 0 : {append: codeFolding()};
  }
  var foldCode = (view22) => {
    for (let line of selectedLines(view22)) {
      let range = foldable(view22.state, line.from, line.to);
      if (range) {
        view22.dispatch({
          effects: foldEffect.of(range),
          reconfigure: maybeEnable(view22.state)
        });
        return true;
      }
    }
    return false;
  };
  var unfoldCode = (view22) => {
    if (!view22.state.field(foldState, false))
      return false;
    let effects = [];
    for (let line of selectedLines(view22)) {
      let folded = foldInside(view22.state, line.from, line.to);
      if (folded)
        effects.push(unfoldEffect.of(folded));
    }
    if (effects.length)
      view22.dispatch({effects});
    return effects.length > 0;
  };
  var foldAll = (view22) => {
    let {state: state24} = view22, effects = [];
    for (let pos = 0; pos < state24.doc.length; ) {
      let line = view22.visualLineAt(pos), range = foldable(state24, line.from, line.to);
      if (range)
        effects.push(foldEffect.of(range));
      pos = (range ? view22.visualLineAt(range.to) : line).to + 1;
    }
    if (effects.length)
      view22.dispatch({effects, reconfigure: maybeEnable(view22.state)});
    return !!effects.length;
  };
  var unfoldAll = (view22) => {
    let field = view22.state.field(foldState, false);
    if (!field || !field.size)
      return false;
    let effects = [];
    field.between(0, view22.state.doc.length, (from, to) => {
      effects.push(unfoldEffect.of({from, to}));
    });
    view22.dispatch({effects});
    return true;
  };
  var foldKeymap = [
    {key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: foldCode},
    {key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: unfoldCode},
    {key: "Ctrl-Alt-[", run: foldAll},
    {key: "Ctrl-Alt-]", run: unfoldAll}
  ];
  var defaultConfig = {
    placeholderDOM: null,
    placeholderText: "\u2026"
  };
  var foldConfig = Facet.define({
    combine(values) {
      return combineConfig(values, defaultConfig);
    }
  });
  function codeFolding(config2) {
    let result = [foldState, baseTheme3];
    if (config2)
      result.push(foldConfig.of(config2));
    return result;
  }
  var foldWidget = Decoration.replace({widget: new class extends WidgetType {
    ignoreEvents() {
      return false;
    }
    toDOM(view22) {
      let {state: state24} = view22, conf = state24.facet(foldConfig);
      if (conf.placeholderDOM)
        return conf.placeholderDOM();
      let element = document.createElement("span");
      element.textContent = conf.placeholderText;
      element.setAttribute("aria-label", state24.phrase("folded code"));
      element.title = state24.phrase("unfold");
      element.className = themeClass("foldPlaceholder");
      element.onclick = (event) => {
        let line = view22.visualLineAt(view22.posAtDOM(event.target));
        let folded = foldInside(view22.state, line.from, line.to);
        if (folded)
          view22.dispatch({effects: unfoldEffect.of(folded)});
        event.preventDefault();
      };
      return element;
    }
  }()});
  var foldGutterDefaults = {
    openText: "\u2304",
    closedText: "\u203A"
  };
  var FoldMarker = class extends GutterMarker {
    constructor(config2, open) {
      super();
      this.config = config2;
      this.open = open;
    }
    eq(other) {
      return this.config == other.config && this.open == other.open;
    }
    toDOM(view22) {
      let span = document.createElement("span");
      span.textContent = this.open ? this.config.openText : this.config.closedText;
      span.title = view22.state.phrase(this.open ? "Fold line" : "Unfold line");
      return span;
    }
  };
  function foldGutter(config2 = {}) {
    let fullConfig = Object.assign(Object.assign({}, foldGutterDefaults), config2);
    let canFold = new FoldMarker(fullConfig, true), canUnfold = new FoldMarker(fullConfig, false);
    return [
      gutter({
        style: "foldGutter",
        lineMarker(view22, line) {
          let folded = foldInside(view22.state, line.from, line.to);
          if (folded)
            return canUnfold;
          if (foldable(view22.state, line.from, line.to))
            return canFold;
          return null;
        },
        initialSpacer() {
          return new FoldMarker(fullConfig, false);
        },
        domEventHandlers: {
          click: (view22, line) => {
            let folded = foldInside(view22.state, line.from, line.to);
            if (folded) {
              view22.dispatch({effects: unfoldEffect.of(folded)});
              return true;
            }
            let range = foldable(view22.state, line.from, line.to);
            if (range) {
              view22.dispatch({effects: foldEffect.of(range)});
              return true;
            }
            return false;
          }
        }
      }),
      codeFolding()
    ];
  }
  var baseTheme3 = EditorView.baseTheme({
    $foldPlaceholder: {
      backgroundColor: "#eee",
      border: "1px solid #ddd",
      color: "#888",
      borderRadius: ".2em",
      margin: "0 1px",
      padding: "0 1px",
      cursor: "pointer"
    },
    "$gutterElement.foldGutter": {
      padding: "0 1px",
      cursor: "pointer"
    }
  });

  // node_modules/@codemirror/next/matchbrackets/dist/index.js
  var baseTheme4 = EditorView.baseTheme({
    $matchingBracket: {color: "#0b0"},
    $nonmatchingBracket: {color: "#a22"}
  });
  var DefaultScanDist = 1e4;
  var DefaultBrackets = "()[]{}";
  var bracketMatchingConfig = Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        afterCursor: true,
        brackets: DefaultBrackets,
        maxScanDistance: DefaultScanDist
      });
    }
  });
  var matchingMark = Decoration.mark({class: themeClass("matchingBracket")});
  var nonmatchingMark = Decoration.mark({class: themeClass("nonmatchingBracket")});
  var bracketMatchingState = StateField.define({
    create() {
      return Decoration.none;
    },
    update(deco, tr) {
      if (!tr.docChanged && !tr.selection)
        return deco;
      let decorations4 = [];
      let config2 = tr.state.facet(bracketMatchingConfig);
      for (let range of tr.state.selection.ranges) {
        if (!range.empty)
          continue;
        let match = matchBrackets(tr.state, range.head, -1, config2) || range.head > 0 && matchBrackets(tr.state, range.head - 1, 1, config2) || config2.afterCursor && (matchBrackets(tr.state, range.head, 1, config2) || range.head < tr.state.doc.length && matchBrackets(tr.state, range.head + 1, -1, config2));
        if (!match)
          continue;
        let mark = match.matched ? matchingMark : nonmatchingMark;
        decorations4.push(mark.range(match.start.from, match.start.to));
        if (match.end)
          decorations4.push(mark.range(match.end.from, match.end.to));
      }
      return Decoration.set(decorations4, true);
    },
    provide: [EditorView.decorations]
  });
  var bracketMatchingUnique = [
    bracketMatchingState,
    baseTheme4
  ];
  function bracketMatching(config2 = {}) {
    return [bracketMatchingConfig.of(config2), bracketMatchingUnique];
  }
  function matchingNodes(node, dir, brackets) {
    let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
    if (byProp)
      return byProp;
    if (node.name.length == 1) {
      let index2 = brackets.indexOf(node.name);
      if (index2 > -1 && index2 % 2 == (dir < 0 ? 1 : 0))
        return [brackets[index2 + dir]];
    }
    return null;
  }
  function matchBrackets(state24, pos, dir, config2 = {}) {
    let maxScanDistance = config2.maxScanDistance || DefaultScanDist, brackets = config2.brackets || DefaultBrackets;
    let tree = syntaxTree(state24), sub = tree.resolve(pos, dir), matches;
    if (matches = matchingNodes(sub.type, dir, brackets))
      return matchMarkedBrackets(state24, pos, dir, sub, matches, brackets);
    else
      return matchPlainBrackets(state24, pos, dir, tree, sub.type, maxScanDistance, brackets);
  }
  function matchMarkedBrackets(_state, _pos, dir, token, matching, brackets) {
    let parent = token.parent, firstToken = {from: token.from, to: token.to};
    let depth2 = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor;
    if (cursor && (dir < 0 ? cursor.childBefore(token.from) : cursor.childAfter(token.to)))
      do {
        if (dir < 0 ? cursor.to <= token.from : cursor.from >= token.to) {
          if (depth2 == 0 && matching.indexOf(cursor.type.name) > -1) {
            return {start: firstToken, end: {from: cursor.from, to: cursor.to}, matched: true};
          } else if (matchingNodes(cursor.type, dir, brackets)) {
            depth2++;
          } else if (matchingNodes(cursor.type, -dir, brackets)) {
            depth2--;
            if (depth2 == 0)
              return {start: firstToken, end: {from: cursor.from, to: cursor.to}, matched: false};
          }
        }
      } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
    return {start: firstToken, matched: false};
  }
  function matchPlainBrackets(state24, pos, dir, tree, tokenType, maxScanDistance, brackets) {
    let startCh = dir < 0 ? state24.sliceDoc(pos - 1, pos) : state24.sliceDoc(pos, pos + 1);
    let bracket2 = brackets.indexOf(startCh);
    if (bracket2 < 0 || bracket2 % 2 == 0 != dir > 0)
      return null;
    let startToken = {from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos};
    let iter = state24.doc.iterRange(pos, dir > 0 ? state24.doc.length : 0), depth2 = 0;
    for (let distance = 0; !iter.next().done && distance <= maxScanDistance; ) {
      let text9 = iter.value;
      if (dir < 0)
        distance += text9.length;
      let basePos = pos + distance * dir;
      for (let pos2 = dir > 0 ? 0 : text9.length - 1, end = dir > 0 ? text9.length : -1; pos2 != end; pos2 += dir) {
        let found = brackets.indexOf(text9[pos2]);
        if (found < 0 || tree.resolve(basePos + pos2, 1).type != tokenType)
          continue;
        if (found % 2 == 0 == dir > 0) {
          depth2++;
        } else if (depth2 == 1) {
          return {start: startToken, end: {from: basePos + pos2, to: basePos + pos2 + 1}, matched: found >> 1 == bracket2 >> 1};
        } else {
          depth2--;
        }
      }
      if (dir > 0)
        distance += text9.length;
    }
    return iter.done ? {start: startToken, matched: false} : null;
  }

  // node_modules/@codemirror/next/commands/dist/index.js
  function updateSel(sel, by) {
    return EditorSelection.create(sel.ranges.map(by), sel.primaryIndex);
  }
  function setSel(state24, selection) {
    return state24.update({selection, scrollIntoView: true, annotations: Transaction.userEvent.of("keyboardselection")});
  }
  function moveSel({state: state24, dispatch: dispatch2}, how) {
    let selection = updateSel(state24.selection, how);
    if (selection.eq(state24.selection))
      return false;
    dispatch2(setSel(state24, selection));
    return true;
  }
  function rangeEnd(range, forward) {
    return EditorSelection.cursor(forward ? range.to : range.from);
  }
  function cursorByChar(view22, forward) {
    return moveSel(view22, (range) => range.empty ? view22.moveByChar(range, forward) : rangeEnd(range, forward));
  }
  var cursorCharLeft = (view22) => cursorByChar(view22, view22.textDirection != Direction.LTR);
  var cursorCharRight = (view22) => cursorByChar(view22, view22.textDirection == Direction.LTR);
  function cursorByGroup(view22, forward) {
    return moveSel(view22, (range) => range.empty ? view22.moveByGroup(range, forward) : rangeEnd(range, forward));
  }
  var cursorGroupLeft = (view22) => cursorByGroup(view22, view22.textDirection != Direction.LTR);
  var cursorGroupRight = (view22) => cursorByGroup(view22, view22.textDirection == Direction.LTR);
  var cursorGroupForward = (view22) => cursorByGroup(view22, true);
  var cursorGroupBackward = (view22) => cursorByGroup(view22, false);
  function interestingNode(state24, node, bracketProp) {
    if (node.type.prop(bracketProp))
      return true;
    let len = node.to - node.from;
    return len && (len > 2 || /[^\s,.;:]/.test(state24.sliceDoc(node.from, node.to))) || node.firstChild;
  }
  function moveBySyntax(state24, start, forward) {
    let pos = syntaxTree(state24).resolve(start.head);
    let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
    for (let at = start.head; ; ) {
      let next = forward ? pos.childAfter(at) : pos.childBefore(at);
      if (!next)
        break;
      if (interestingNode(state24, next, bracketProp))
        pos = next;
      else
        at = forward ? next.to : next.from;
    }
    let bracket2 = pos.type.prop(bracketProp), match, newPos;
    if (bracket2 && (match = forward ? matchBrackets(state24, pos.from, 1) : matchBrackets(state24, pos.to, -1)) && match.matched)
      newPos = forward ? match.end.to : match.end.from;
    else
      newPos = forward ? pos.to : pos.from;
    return EditorSelection.cursor(newPos, forward ? -1 : 1);
  }
  var cursorSyntaxLeft = (view22) => moveSel(view22, (range) => moveBySyntax(view22.state, range, view22.textDirection != Direction.LTR));
  var cursorSyntaxRight = (view22) => moveSel(view22, (range) => moveBySyntax(view22.state, range, view22.textDirection == Direction.LTR));
  function cursorByLine(view22, forward) {
    return moveSel(view22, (range) => range.empty ? view22.moveVertically(range, forward) : rangeEnd(range, forward));
  }
  var cursorLineUp = (view22) => cursorByLine(view22, false);
  var cursorLineDown = (view22) => cursorByLine(view22, true);
  function cursorByPage(view22, forward) {
    return moveSel(view22, (range) => range.empty ? view22.moveVertically(range, forward, view22.dom.clientHeight) : rangeEnd(range, forward));
  }
  var cursorPageUp = (view22) => cursorByPage(view22, false);
  var cursorPageDown = (view22) => cursorByPage(view22, true);
  function moveByLineBoundary(view22, start, forward) {
    let line = view22.visualLineAt(start.head), moved = view22.moveToLineBoundary(start, forward);
    if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
      moved = view22.moveToLineBoundary(start, forward, false);
    if (!forward && moved.head == line.from && line.length) {
      let space = /^\s*/.exec(view22.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
      if (space && start.head > line.from + space)
        moved = EditorSelection.cursor(line.from + space);
    }
    return moved;
  }
  var cursorLineBoundaryForward = (view22) => moveSel(view22, (range) => moveByLineBoundary(view22, range, true));
  var cursorLineBoundaryBackward = (view22) => moveSel(view22, (range) => moveByLineBoundary(view22, range, false));
  var cursorLineStart = (view22) => moveSel(view22, (range) => EditorSelection.cursor(view22.visualLineAt(range.head).from, 1));
  var cursorLineEnd = (view22) => moveSel(view22, (range) => EditorSelection.cursor(view22.visualLineAt(range.head).to, -1));
  function toMatchingBracket(state24, dispatch2, extend2) {
    let found = false, selection = updateSel(state24.selection, (range) => {
      let matching = matchBrackets(state24, range.head, -1) || matchBrackets(state24, range.head, 1) || range.head > 0 && matchBrackets(state24, range.head - 1, 1) || range.head < state24.doc.length && matchBrackets(state24, range.head + 1, -1);
      if (!matching || !matching.end)
        return range;
      found = true;
      let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
      return extend2 ? EditorSelection.range(range.anchor, head) : EditorSelection.cursor(head);
    });
    if (!found)
      return false;
    dispatch2(setSel(state24, selection));
    return true;
  }
  var cursorMatchingBracket = ({state: state24, dispatch: dispatch2}) => toMatchingBracket(state24, dispatch2, false);
  function extendSel(view22, how) {
    let selection = updateSel(view22.state.selection, (range) => {
      let head = how(range);
      return EditorSelection.range(range.anchor, head.head, head.goalColumn);
    });
    if (selection.eq(view22.state.selection))
      return false;
    view22.dispatch(setSel(view22.state, selection));
    return true;
  }
  function selectByChar(view22, forward) {
    return extendSel(view22, (range) => view22.moveByChar(range, forward));
  }
  var selectCharLeft = (view22) => selectByChar(view22, view22.textDirection != Direction.LTR);
  var selectCharRight = (view22) => selectByChar(view22, view22.textDirection == Direction.LTR);
  function selectByGroup(view22, forward) {
    return extendSel(view22, (range) => view22.moveByGroup(range, forward));
  }
  var selectGroupLeft = (view22) => selectByGroup(view22, view22.textDirection != Direction.LTR);
  var selectGroupRight = (view22) => selectByGroup(view22, view22.textDirection == Direction.LTR);
  var selectGroupForward = (view22) => selectByGroup(view22, true);
  var selectGroupBackward = (view22) => selectByGroup(view22, false);
  var selectSyntaxLeft = (view22) => extendSel(view22, (range) => moveBySyntax(view22.state, range, view22.textDirection != Direction.LTR));
  var selectSyntaxRight = (view22) => extendSel(view22, (range) => moveBySyntax(view22.state, range, view22.textDirection == Direction.LTR));
  function selectByLine(view22, forward) {
    return extendSel(view22, (range) => view22.moveVertically(range, forward));
  }
  var selectLineUp = (view22) => selectByLine(view22, false);
  var selectLineDown = (view22) => selectByLine(view22, true);
  function selectByPage(view22, forward) {
    return extendSel(view22, (range) => view22.moveVertically(range, forward, view22.dom.clientHeight));
  }
  var selectPageUp = (view22) => selectByPage(view22, false);
  var selectPageDown = (view22) => selectByPage(view22, true);
  var selectLineBoundaryForward = (view22) => extendSel(view22, (range) => moveByLineBoundary(view22, range, true));
  var selectLineBoundaryBackward = (view22) => extendSel(view22, (range) => moveByLineBoundary(view22, range, false));
  var selectLineStart = (view22) => extendSel(view22, (range) => EditorSelection.cursor(view22.visualLineAt(range.head).from));
  var selectLineEnd = (view22) => extendSel(view22, (range) => EditorSelection.cursor(view22.visualLineAt(range.head).to));
  var cursorDocStart = ({state: state24, dispatch: dispatch2}) => {
    dispatch2(setSel(state24, {anchor: 0}));
    return true;
  };
  var cursorDocEnd = ({state: state24, dispatch: dispatch2}) => {
    dispatch2(setSel(state24, {anchor: state24.doc.length}));
    return true;
  };
  var selectDocStart = ({state: state24, dispatch: dispatch2}) => {
    dispatch2(setSel(state24, {anchor: state24.selection.primary.anchor, head: 0}));
    return true;
  };
  var selectDocEnd = ({state: state24, dispatch: dispatch2}) => {
    dispatch2(setSel(state24, {anchor: state24.selection.primary.anchor, head: state24.doc.length}));
    return true;
  };
  var selectAll = ({state: state24, dispatch: dispatch2}) => {
    dispatch2(state24.update({selection: {anchor: 0, head: state24.doc.length}, annotations: Transaction.userEvent.of("keyboardselection")}));
    return true;
  };
  var selectLine = ({state: state24, dispatch: dispatch2}) => {
    let ranges = selectedLineBlocks(state24).map(({from, to}) => EditorSelection.range(from, Math.min(to + 1, state24.doc.length)));
    dispatch2(state24.update({selection: new EditorSelection(ranges), annotations: Transaction.userEvent.of("keyboardselection")}));
    return true;
  };
  var selectParentSyntax = ({state: state24, dispatch: dispatch2}) => {
    let selection = updateSel(state24.selection, (range) => {
      var _a;
      let context = syntaxTree(state24).resolve(range.head, 1);
      while (!(context.from < range.from && context.to >= range.to || context.to > range.to && context.from <= range.from || !((_a = context.parent) === null || _a === void 0 ? void 0 : _a.parent)))
        context = context.parent;
      return EditorSelection.range(context.to, context.from);
    });
    dispatch2(setSel(state24, selection));
    return true;
  };
  var simplifySelection = ({state: state24, dispatch: dispatch2}) => {
    let cur2 = state24.selection, selection = null;
    if (cur2.ranges.length > 1)
      selection = new EditorSelection([cur2.primary]);
    else if (!cur2.primary.empty)
      selection = new EditorSelection([EditorSelection.cursor(cur2.primary.head)]);
    if (!selection)
      return false;
    dispatch2(setSel(state24, selection));
    return true;
  };
  function deleteBy(view22, by) {
    let {state: state24} = view22, changes = state24.changeByRange((range) => {
      let {from, to} = range;
      if (from == to) {
        let towards = by(from);
        from = Math.min(from, towards);
        to = Math.max(to, towards);
      }
      return from == to ? {range} : {changes: {from, to}, range: EditorSelection.cursor(from)};
    });
    if (changes.changes.empty)
      return false;
    view22.dispatch(changes, {scrollIntoView: true, annotations: Transaction.userEvent.of("delete")});
    return true;
  }
  var deleteByChar = (view22, forward, codePoint) => deleteBy(view22, (pos) => {
    let {state: state24} = view22, line = state24.doc.lineAt(pos), before;
    if (!forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.slice(0, pos - line.from))) {
      if (before[before.length - 1] == "	")
        return pos - 1;
      let col = countColumn(before, 0, state24.tabSize), drop = col % getIndentUnit(state24) || getIndentUnit(state24);
      for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
        pos--;
      return pos;
    }
    let target;
    if (codePoint) {
      let next = line.slice(pos - line.from + (forward ? 0 : -2), pos - line.from + (forward ? 2 : 0));
      let size = next ? codePointSize(codePointAt(next, 0)) : 1;
      target = forward ? Math.min(state24.doc.length, pos + size) : Math.max(0, pos - size);
    } else {
      target = line.findClusterBreak(pos - line.from, forward) + line.from;
    }
    if (target == pos && line.number != (forward ? state24.doc.lines : 1))
      target += forward ? 1 : -1;
    return target;
  });
  var deleteCodePointBackward = (view22) => deleteByChar(view22, false, true);
  var deleteCharBackward = (view22) => deleteByChar(view22, false, false);
  var deleteCharForward = (view22) => deleteByChar(view22, true, false);
  var deleteByGroup = (view22, forward) => deleteBy(view22, (pos) => {
    let {state: state24} = view22, line = state24.doc.lineAt(pos), categorize = state24.charCategorizer(pos);
    for (let cat = null; ; ) {
      let next, nextChar2;
      if (pos == (forward ? line.to : line.from)) {
        if (line.number == (forward ? state24.doc.lines : 1))
          break;
        line = state24.doc.line(line.number + (forward ? 1 : -1));
        next = forward ? line.from : line.to;
        nextChar2 = "\n";
      } else {
        next = line.findClusterBreak(pos - line.from, forward) + line.from;
        nextChar2 = line.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
      }
      let nextCat = categorize(nextChar2);
      if (cat != null && nextCat != cat)
        break;
      if (nextCat != CharCategory.Space)
        cat = nextCat;
      pos = next;
    }
    return pos;
  });
  var deleteGroupBackward = (view22) => deleteByGroup(view22, false);
  var deleteGroupForward = (view22) => deleteByGroup(view22, true);
  var deleteToLineEnd = (view22) => deleteBy(view22, (pos) => {
    let lineEnd = view22.visualLineAt(pos).to;
    if (pos < lineEnd)
      return lineEnd;
    return Math.max(view22.state.doc.length, pos + 1);
  });
  var splitLine = ({state: state24, dispatch: dispatch2}) => {
    let changes = state24.changeByRange((range) => {
      return {
        changes: {from: range.from, to: range.to, insert: Text.of(["", ""])},
        range: EditorSelection.cursor(range.from)
      };
    });
    dispatch2(state24.update(changes, {scrollIntoView: true, annotations: Transaction.userEvent.of("input")}));
    return true;
  };
  var transposeChars = ({state: state24, dispatch: dispatch2}) => {
    let changes = state24.changeByRange((range) => {
      if (!range.empty || range.from == 0 || range.from == state24.doc.length)
        return {range};
      let pos = range.from, line = state24.doc.lineAt(pos);
      let from = pos == line.from ? pos - 1 : line.findClusterBreak(pos - line.from, false) + line.from;
      let to = pos == line.to ? pos + 1 : line.findClusterBreak(pos - line.from, true) + line.from;
      return {
        changes: {from, to, insert: state24.doc.slice(pos, to).append(state24.doc.slice(from, pos))},
        range: EditorSelection.cursor(to)
      };
    });
    if (changes.changes.empty)
      return false;
    dispatch2(state24.update(changes, {scrollIntoView: true}));
    return true;
  };
  function selectedLineBlocks(state24) {
    let blocks = [], upto = -1;
    for (let range of state24.selection.ranges) {
      let startLine = state24.doc.lineAt(range.from), endLine = state24.doc.lineAt(range.to);
      if (upto == startLine.number)
        blocks[blocks.length - 1].to = endLine.to;
      else
        blocks.push({from: startLine.from, to: endLine.to});
      upto = endLine.number;
    }
    return blocks;
  }
  function moveLine(state24, dispatch2, forward) {
    let changes = [];
    for (let block of selectedLineBlocks(state24)) {
      if (forward ? block.to == state24.doc.length : block.from == 0)
        continue;
      let nextLine = state24.doc.lineAt(forward ? block.to + 1 : block.from - 1);
      if (forward)
        changes.push({from: block.to, to: nextLine.to}, {from: block.from, insert: nextLine.slice() + state24.lineBreak});
      else
        changes.push({from: nextLine.from, to: block.from}, {from: block.to, insert: state24.lineBreak + nextLine.slice()});
    }
    if (!changes.length)
      return false;
    dispatch2(state24.update({changes, scrollIntoView: true}));
    return true;
  }
  var moveLineUp = ({state: state24, dispatch: dispatch2}) => moveLine(state24, dispatch2, false);
  var moveLineDown = ({state: state24, dispatch: dispatch2}) => moveLine(state24, dispatch2, true);
  function copyLine(state24, dispatch2, forward) {
    let changes = [];
    for (let block of selectedLineBlocks(state24)) {
      if (forward)
        changes.push({from: block.from, insert: state24.doc.slice(block.from, block.to) + state24.lineBreak});
      else
        changes.push({from: block.to, insert: state24.lineBreak + state24.doc.slice(block.from, block.to)});
    }
    dispatch2(state24.update({changes, scrollIntoView: true}));
    return true;
  }
  var copyLineUp = ({state: state24, dispatch: dispatch2}) => copyLine(state24, dispatch2, false);
  var copyLineDown = ({state: state24, dispatch: dispatch2}) => copyLine(state24, dispatch2, true);
  var deleteLine = (view22) => {
    let {state: state24} = view22, changes = state24.changes(selectedLineBlocks(state24).map(({from, to}) => {
      if (from > 0)
        from--;
      else if (to < state24.doc.length)
        to++;
      return {from, to};
    }));
    let selection = updateSel(state24.selection, (range) => view22.moveVertically(range, true)).map(changes);
    view22.dispatch({changes, selection, scrollIntoView: true});
    return true;
  };
  function isBetweenBrackets(state24, pos) {
    if (/\(\)|\[\]|\{\}/.test(state24.sliceDoc(pos - 1, pos + 1)))
      return {from: pos, to: pos};
    let context = syntaxTree(state24).resolve(pos);
    let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
    if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1)
      return {from: before.to, to: after.from};
    return null;
  }
  var insertNewlineAndIndent = ({state: state24, dispatch: dispatch2}) => {
    let changes = state24.changeByRange(({from, to}) => {
      let explode = from == to && isBetweenBrackets(state24, from);
      let cx = new IndentContext(state24, {simulateBreak: from, simulateDoubleBreak: !!explode});
      let indent = getIndentation(cx, from);
      if (indent == null)
        indent = /^\s*/.exec(state24.doc.lineAt(from).slice(0, 50))[0].length;
      let line = state24.doc.lineAt(from);
      while (to < line.to && /\s/.test(line.slice(to - line.from, to + 1 - line.from)))
        to++;
      if (explode)
        ({from, to} = explode);
      else if (from > line.from && from < line.from + 100 && !/\S/.test(line.slice(0, from)))
        from = line.from;
      let insert2 = ["", indentString(state24, indent)];
      if (explode)
        insert2.push(indentString(state24, cx.lineIndent(line)));
      return {
        changes: {from, to, insert: Text.of(insert2)},
        range: EditorSelection.cursor(from + 1 + indent)
      };
    });
    dispatch2(state24.update(changes, {scrollIntoView: true}));
    return true;
  };
  function changeBySelectedLine(state24, f) {
    let atLine = -1;
    return state24.changeByRange((range) => {
      let changes = [];
      for (let line = state24.doc.lineAt(range.from); ; ) {
        if (line.number > atLine) {
          f(line, changes, range);
          atLine = line.number;
        }
        if (range.to <= line.to)
          break;
        line = state24.doc.lineAt(line.to + 1);
      }
      let changeSet = state24.changes(changes);
      return {
        changes,
        range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1))
      };
    });
  }
  var indentSelection = ({state: state24, dispatch: dispatch2}) => {
    let updated = Object.create(null);
    let context = new IndentContext(state24, {overrideIndentation: (start) => {
      let found = updated[start];
      return found == null ? -1 : found;
    }});
    let changes = changeBySelectedLine(state24, (line, changes2, range) => {
      let indent = getIndentation(context, line.from);
      if (indent == null)
        return;
      let cur2 = /^\s*/.exec(line.slice(0, Math.min(line.length, 200)))[0];
      let norm = indentString(state24, indent);
      if (cur2 != norm || range.from < line.from + cur2.length) {
        updated[line.from] = indent;
        changes2.push({from: line.from, to: line.from + cur2.length, insert: norm});
      }
    });
    if (!changes.changes.empty)
      dispatch2(state24.update(changes));
    return true;
  };
  var indentMore = ({state: state24, dispatch: dispatch2}) => {
    dispatch2(state24.update(changeBySelectedLine(state24, (line, changes) => {
      changes.push({from: line.from, insert: state24.facet(indentUnit)});
    })));
    return true;
  };
  var indentLess = ({state: state24, dispatch: dispatch2}) => {
    dispatch2(state24.update(changeBySelectedLine(state24, (line, changes) => {
      let lineStart = line.slice(0, Math.min(line.length, 200));
      let space = /^\s*/.exec(lineStart)[0];
      if (!space)
        return;
      let col = countColumn(space, 0, state24.tabSize), keep = 0;
      let insert2 = indentString(state24, Math.max(0, col - getIndentUnit(state24)));
      while (keep < space.length && keep < insert2.length && space.charCodeAt(keep) == insert2.charCodeAt(keep))
        keep++;
      changes.push({from: line.from + keep, to: line.from + space.length, insert: insert2.slice(keep)});
    })));
    return true;
  };
  var emacsStyleKeymap = [
    {key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft},
    {key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight},
    {key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp},
    {key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown},
    {key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart},
    {key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd},
    {key: "Ctrl-d", run: deleteCharForward},
    {key: "Ctrl-h", run: deleteCharBackward},
    {key: "Ctrl-k", run: deleteToLineEnd},
    {key: "Alt-d", run: deleteGroupForward},
    {key: "Ctrl-Alt-h", run: deleteGroupBackward},
    {key: "Ctrl-o", run: splitLine},
    {key: "Ctrl-t", run: transposeChars},
    {key: "Alt-f", run: cursorGroupForward, shift: selectGroupForward},
    {key: "Alt-b", run: cursorGroupBackward, shift: selectGroupBackward},
    {key: "Alt-<", run: cursorDocStart},
    {key: "Alt->", run: cursorDocEnd},
    {key: "Ctrl-v", run: cursorPageDown},
    {key: "Alt-v", run: cursorPageUp}
  ];
  var standardKeymap = [
    {key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft},
    {key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft},
    {mac: "Cmd-ArrowLeft", run: cursorLineStart, shift: selectLineStart},
    {key: "ArrowRight", run: cursorCharRight, shift: selectCharRight},
    {key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight},
    {mac: "Cmd-ArrowRight", run: cursorLineEnd, shift: selectLineEnd},
    {key: "ArrowUp", run: cursorLineUp, shift: selectLineUp},
    {mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart},
    {mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp},
    {key: "ArrowDown", run: cursorLineDown, shift: selectLineDown},
    {mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd},
    {mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown},
    {key: "PageUp", run: cursorPageUp, shift: selectPageUp},
    {key: "PageDown", run: cursorPageDown, shift: selectPageDown},
    {key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward},
    {key: "Mod-Home", run: cursorDocStart, shift: selectDocStart},
    {key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward},
    {key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd},
    {key: "Enter", run: insertNewlineAndIndent},
    {key: "Mod-a", run: selectAll},
    {key: "Backspace", run: deleteCodePointBackward},
    {key: "Delete", run: deleteCharForward},
    {key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward},
    {key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward}
  ].concat(emacsStyleKeymap.map((b) => ({mac: b.key, run: b.run, shift: b.shift})));
  var defaultKeymap = [
    {key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft},
    {key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight},
    {key: "Alt-ArrowUp", run: moveLineUp},
    {key: "Shift-Alt-ArrowUp", run: copyLineUp},
    {key: "Alt-ArrowDown", run: moveLineDown},
    {key: "Shift-Alt-ArrowDown", run: copyLineDown},
    {key: "Escape", run: simplifySelection},
    {key: "Mod-l", run: selectLine},
    {key: "Mod-i", run: selectParentSyntax},
    {key: "Mod-[", run: indentLess},
    {key: "Mod-]", run: indentMore},
    {key: "Mod-Alt-\\", run: indentSelection},
    {key: "Shift-Mod-k", run: deleteLine},
    {key: "Shift-Mod-\\", run: cursorMatchingBracket}
  ].concat(standardKeymap);

  // node_modules/@codemirror/next/closebrackets/dist/index.js
  var defaults2 = {
    brackets: ["(", "[", "{", "'", '"'],
    before: `)]}'":;>`
  };
  var closeBracketEffect = StateEffect.define({
    map(value, mapping) {
      let mapped = mapping.mapPos(value, -1, MapMode.TrackAfter);
      return mapped == null ? void 0 : mapped;
    }
  });
  var skipBracketEffect = StateEffect.define({
    map(value, mapping) {
      return mapping.mapPos(value);
    }
  });
  var closedBracket = new class extends RangeValue {
  }();
  closedBracket.startSide = 1;
  closedBracket.endSide = -1;
  var bracketState = StateField.define({
    create() {
      return RangeSet.empty;
    },
    update(value, tr) {
      if (tr.selection) {
        let lineStart = tr.state.doc.lineAt(tr.selection.primary.head).from;
        let prevLineStart = tr.startState.doc.lineAt(tr.startState.selection.primary.head).from;
        if (lineStart != tr.changes.mapPos(prevLineStart, -1))
          value = RangeSet.empty;
      }
      value = value.map(tr.changes);
      for (let effect of tr.effects) {
        if (effect.is(closeBracketEffect))
          value = value.update({add: [closedBracket.range(effect.value, effect.value + 1)]});
        else if (effect.is(skipBracketEffect))
          value = value.update({filter: (from) => from != effect.value});
      }
      return value;
    }
  });
  function closeBrackets() {
    return [EditorView.inputHandler.of(handleInput), bracketState];
  }
  var definedClosing = "()[]{}<>";
  function closing(ch) {
    for (let i = 0; i < definedClosing.length; i += 2)
      if (definedClosing.charCodeAt(i) == ch)
        return definedClosing.charAt(i + 1);
    return fromCodePoint(ch < 128 ? ch : ch + 1);
  }
  function config(state24, pos) {
    return state24.languageDataAt("closeBrackets", pos)[0] || defaults2;
  }
  function handleInput(view22, from, to, insert2) {
    if (view22.composing)
      return false;
    let sel = view22.state.selection.primary;
    if (insert2.length > 2 || insert2.length == 2 && codePointSize(codePointAt(insert2, 0)) == 1 || from != sel.from || to != sel.to)
      return false;
    let tr = handleInsertion(view22.state, insert2);
    if (!tr)
      return false;
    view22.dispatch(tr);
    return true;
  }
  var deleteBracketPair = ({state: state24, dispatch: dispatch2}) => {
    let conf = config(state24, state24.selection.primary.head);
    let tokens = conf.brackets || defaults2.brackets;
    let dont = null, changes = state24.changeByRange((range) => {
      if (range.empty) {
        let before = prevChar(state24.doc, range.head);
        for (let token of tokens) {
          if (token == before && nextChar(state24.doc, range.head) == closing(codePointAt(token, 0)))
            return {
              changes: {from: range.head - token.length, to: range.head + token.length},
              range: EditorSelection.cursor(range.head - token.length),
              annotations: Transaction.userEvent.of("delete")
            };
        }
      }
      return {range: dont = range};
    });
    if (!dont)
      dispatch2(state24.update(changes, {scrollIntoView: true}));
    return !dont;
  };
  var closeBracketsKeymap = [
    {key: "Backspace", run: deleteBracketPair}
  ];
  function handleInsertion(state24, ch) {
    let conf = config(state24, state24.selection.primary.head);
    let tokens = conf.brackets || defaults2.brackets;
    for (let tok of tokens) {
      let closed = closing(codePointAt(tok, 0));
      if (ch == tok)
        return closed == tok ? handleSame(state24, tok, tokens.indexOf(tok + tok + tok) > -1) : handleOpen(state24, tok, closed, conf.before || defaults2.before);
      if (ch == closed && closedBracketAt(state24, state24.selection.primary.from))
        return handleClose(state24, tok, closed);
    }
    return null;
  }
  function closedBracketAt(state24, pos) {
    let found = false;
    state24.field(bracketState).between(0, state24.doc.length, (from) => {
      if (from == pos)
        found = true;
    });
    return found;
  }
  function nextChar(doc2, pos) {
    let next = doc2.sliceString(pos, pos + 2);
    return next.slice(0, codePointSize(codePointAt(next, 0)));
  }
  function prevChar(doc2, pos) {
    let prev = doc2.sliceString(pos - 2, pos);
    return codePointSize(codePointAt(prev, 0)) == prev.length ? prev : prev.slice(1);
  }
  function handleOpen(state24, open, close, closeBefore) {
    let dont = null, changes = state24.changeByRange((range) => {
      if (!range.empty)
        return {
          changes: [{insert: open, from: range.from}, {insert: close, from: range.to}],
          effects: closeBracketEffect.of(range.to + open.length),
          range: EditorSelection.range(range.anchor + open.length, range.head + open.length)
        };
      let next = nextChar(state24.doc, range.head);
      if (!next || /\s/.test(next) || closeBefore.indexOf(next) > -1)
        return {
          changes: {insert: open + close, from: range.head},
          effects: closeBracketEffect.of(range.head + open.length),
          range: EditorSelection.cursor(range.head + open.length)
        };
      return {range: dont = range};
    });
    return dont ? null : state24.update(changes, {
      scrollIntoView: true,
      annotations: Transaction.userEvent.of("input")
    });
  }
  function handleClose(state24, _open, close) {
    let dont = null, moved = state24.selection.ranges.map((range) => {
      if (range.empty && nextChar(state24.doc, range.head) == close)
        return EditorSelection.cursor(range.head + close.length);
      return dont = range;
    });
    return dont ? null : state24.update({
      selection: EditorSelection.create(moved, state24.selection.primaryIndex),
      scrollIntoView: true,
      effects: state24.selection.ranges.map(({from}) => skipBracketEffect.of(from))
    });
  }
  function handleSame(state24, token, allowTriple) {
    let dont = null, changes = state24.changeByRange((range) => {
      if (!range.empty)
        return {
          changes: [{insert: token, from: range.from}, {insert: token, from: range.to}],
          effects: closeBracketEffect.of(range.to + token.length),
          range: EditorSelection.range(range.anchor + token.length, range.head + token.length)
        };
      let pos = range.head, next = nextChar(state24.doc, pos);
      if (next == token) {
        if (nodeStart(state24, pos)) {
          return {
            changes: {insert: token + token, from: pos},
            effects: closeBracketEffect.of(pos + token.length),
            range: EditorSelection.cursor(pos + token.length)
          };
        } else if (closedBracketAt(state24, pos)) {
          let isTriple = allowTriple && state24.sliceDoc(pos, pos + token.length * 3) == token + token + token;
          return {
            range: EditorSelection.cursor(pos + token.length * (isTriple ? 3 : 1)),
            effects: skipBracketEffect.of(pos)
          };
        }
      } else if (allowTriple && state24.sliceDoc(pos - 2 * token.length, pos) == token + token && nodeStart(state24, pos - 2 * token.length)) {
        return {
          changes: {insert: token + token + token + token, from: pos},
          effects: closeBracketEffect.of(pos + token.length),
          range: EditorSelection.cursor(pos + token.length)
        };
      } else if (state24.charCategorizer(pos)(next) != CharCategory.Word) {
        let prev = state24.sliceDoc(pos - 1, pos);
        if (prev != token && state24.charCategorizer(pos)(prev) != CharCategory.Word)
          return {
            changes: {insert: token + token, from: pos},
            effects: closeBracketEffect.of(pos + token.length),
            range: EditorSelection.cursor(pos + token.length)
          };
      }
      return {range: dont = range};
    });
    return dont ? null : state24.update(changes, {
      scrollIntoView: true,
      annotations: Transaction.userEvent.of("input")
    });
  }
  function nodeStart(state24, pos) {
    let tree = syntaxTree(state24).resolve(pos + 1);
    return tree.parent && tree.from == pos;
  }

  // node_modules/@codemirror/next/panel/dist/index.js
  var panelConfig = Facet.define({
    combine(configs) {
      let topContainer, bottomContainer;
      for (let c of configs) {
        topContainer = topContainer || c.topContainer;
        bottomContainer = bottomContainer || c.bottomContainer;
      }
      return {topContainer, bottomContainer};
    }
  });
  function panels(config2) {
    let ext = [panelPlugin, baseTheme5];
    if (config2)
      ext.push(panelConfig.of(config2));
    return ext;
  }
  var showPanel = Facet.define();
  function getPanel(view22, panel4) {
    let plugin = view22.plugin(panelPlugin);
    let index2 = view22.state.facet(showPanel).indexOf(panel4);
    return plugin && index2 > -1 ? plugin.panels[index2] : null;
  }
  var panelPlugin = ViewPlugin.fromClass(class {
    constructor(view22) {
      this.specs = view22.state.facet(showPanel);
      this.panels = this.specs.map((spec) => spec(view22));
      let conf = view22.state.facet(panelConfig);
      this.top = new PanelGroup(view22, true, conf.topContainer);
      this.bottom = new PanelGroup(view22, false, conf.bottomContainer);
      this.top.sync(this.panels.filter((p) => p.top));
      this.bottom.sync(this.panels.filter((p) => !p.top));
      for (let p of this.panels) {
        p.dom.className += " " + panelClass(p);
        if (p.mount)
          p.mount();
      }
    }
    update(update) {
      let conf = update.state.facet(panelConfig);
      if (this.top.container != conf.topContainer) {
        this.top.sync([]);
        this.top = new PanelGroup(update.view, true, conf.topContainer);
      }
      if (this.bottom.container != conf.bottomContainer) {
        this.bottom.sync([]);
        this.bottom = new PanelGroup(update.view, false, conf.bottomContainer);
      }
      this.top.syncClasses();
      this.bottom.syncClasses();
      let specs = update.state.facet(showPanel);
      if (specs != this.specs) {
        let panels2 = [], top2 = [], bottom = [], mount = [];
        for (let spec of specs) {
          let known = this.specs.indexOf(spec), panel4;
          if (known < 0) {
            panel4 = spec(update.view);
            mount.push(panel4);
          } else {
            panel4 = this.panels[known];
            if (panel4.update)
              panel4.update(update);
          }
          panels2.push(panel4);
          (panel4.top ? top2 : bottom).push(panel4);
        }
        this.specs = specs;
        this.panels = panels2;
        this.top.sync(top2);
        this.bottom.sync(bottom);
        for (let p of mount) {
          p.dom.className += " " + panelClass(p);
          if (p.mount)
            p.mount();
        }
      } else {
        for (let p of this.panels)
          if (p.update)
            p.update(update);
      }
    }
    destroy() {
      this.top.sync([]);
      this.bottom.sync([]);
    }
  }, {
    provide: PluginField.scrollMargins.from((value) => ({top: value.top.scrollMargin(), bottom: value.bottom.scrollMargin()}))
  });
  function panelClass(panel4) {
    return themeClass(panel4.style ? `panel.${panel4.style}` : "panel");
  }
  var PanelGroup = class {
    constructor(view22, top2, container) {
      this.view = view22;
      this.top = top2;
      this.container = container;
      this.dom = void 0;
      this.classes = "";
      this.panels = [];
      this.syncClasses();
    }
    sync(panels2) {
      this.panels = panels2;
      this.syncDOM();
    }
    syncDOM() {
      if (this.panels.length == 0) {
        if (this.dom) {
          this.dom.remove();
          this.dom = void 0;
        }
        return;
      }
      if (!this.dom) {
        this.dom = document.createElement("div");
        this.dom.className = themeClass(this.top ? "panels.top" : "panels.bottom");
        this.dom.style[this.top ? "top" : "bottom"] = "0";
        let parent = this.container || this.view.dom;
        parent.insertBefore(this.dom, this.top ? parent.firstChild : null);
      }
      let curDOM = this.dom.firstChild;
      for (let panel4 of this.panels) {
        if (panel4.dom.parentNode == this.dom) {
          while (curDOM != panel4.dom)
            curDOM = rm2(curDOM);
          curDOM = curDOM.nextSibling;
        } else {
          this.dom.insertBefore(panel4.dom, curDOM);
        }
      }
      while (curDOM)
        curDOM = rm2(curDOM);
    }
    scrollMargin() {
      return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - this.view.scrollDOM.getBoundingClientRect().top : this.view.scrollDOM.getBoundingClientRect().bottom - this.dom.getBoundingClientRect().top);
    }
    syncClasses() {
      if (!this.container || this.classes == this.view.themeClasses)
        return;
      for (let cls of this.classes.split(" "))
        if (cls)
          this.container.classList.remove(cls);
      for (let cls of (this.classes = this.view.themeClasses).split(" "))
        if (cls)
          this.container.classList.add(cls);
    }
  };
  function rm2(node) {
    let next = node.nextSibling;
    node.remove();
    return next;
  }
  var baseTheme5 = EditorView.baseTheme({
    $panels: {
      boxSizing: "border-box",
      position: "sticky",
      left: 0,
      right: 0
    },
    "$$light $panels": {
      backgroundColor: "#f5f5f5",
      color: "black"
    },
    "$$light $panels.top": {
      borderBottom: "1px solid #ddd"
    },
    "$$light $panels.bottom": {
      borderTop: "1px solid #ddd"
    },
    "$$dark $panels": {
      backgroundColor: "#333338",
      color: "white"
    }
  });

  // node_modules/@codemirror/next/search/dist/index.js
  var basicNormalize = typeof String.prototype.normalize == "function" ? (x) => x.normalize("NFKD") : (x) => x;
  var SearchCursor = class {
    constructor(text9, query, from = 0, to = text9.length, normalize) {
      this.value = {from: 0, to: 0};
      this.done = false;
      this.matches = [];
      this.buffer = "";
      this.bufferPos = 0;
      this.iter = text9.iterRange(from, to);
      this.bufferStart = from;
      this.normalize = normalize ? (x) => normalize(basicNormalize(x)) : basicNormalize;
      this.query = this.normalize(query);
    }
    peek() {
      if (this.bufferPos == this.buffer.length) {
        this.bufferStart += this.buffer.length;
        this.iter.next();
        if (this.iter.done)
          return -1;
        this.bufferPos = 0;
        this.buffer = this.iter.value;
      }
      return this.buffer.charCodeAt(this.bufferPos);
    }
    next() {
      for (; ; ) {
        let next = this.peek();
        if (next < 0) {
          this.done = true;
          return this;
        }
        let str = String.fromCharCode(next), start = this.bufferStart + this.bufferPos;
        this.bufferPos++;
        for (; ; ) {
          let peek = this.peek();
          if (peek < 56320 || peek >= 57344)
            break;
          this.bufferPos++;
          str += String.fromCharCode(peek);
        }
        let norm = this.normalize(str);
        for (let i = 0, pos = start; ; i++) {
          let code = norm.charCodeAt(i);
          let match = this.match(code, pos);
          if (match) {
            this.value = match;
            return this;
          }
          if (i == norm.length - 1)
            break;
          if (pos == start && i < str.length && str.charCodeAt(i) == code)
            pos++;
        }
      }
    }
    match(code, pos) {
      let match = null;
      for (let i = 0; i < this.matches.length; i += 2) {
        let index2 = this.matches[i], keep = false;
        if (this.query.charCodeAt(index2) == code) {
          if (index2 == this.query.length - 1) {
            match = {from: this.matches[i + 1], to: pos + 1};
          } else {
            this.matches[i]++;
            keep = true;
          }
        }
        if (!keep) {
          this.matches.splice(i, 2);
          i -= 2;
        }
      }
      if (this.query.charCodeAt(0) == code) {
        if (this.query.length == 1)
          match = {from: pos, to: pos + 1};
        else
          this.matches.push(1, pos);
      }
      return match;
    }
  };
  var Query = class {
    constructor(search3, replace, caseInsensitive) {
      this.search = search3;
      this.replace = replace;
      this.caseInsensitive = caseInsensitive;
    }
    eq(other) {
      return this.search == other.search && this.replace == other.replace && this.caseInsensitive == other.caseInsensitive;
    }
    cursor(doc2, from = 0, to = doc2.length) {
      return new SearchCursor(doc2, this.search, from, to, this.caseInsensitive ? (x) => x.toLowerCase() : void 0);
    }
    get valid() {
      return !!this.search;
    }
  };
  var setQuery = StateEffect.define();
  var togglePanel = StateEffect.define();
  var searchState = StateField.define({
    create() {
      return new SearchState(new Query("", "", false), []);
    },
    update(value, tr) {
      for (let effect of tr.effects) {
        if (effect.is(setQuery))
          value = new SearchState(effect.value, value.panel);
        else if (effect.is(togglePanel))
          value = new SearchState(value.query, effect.value ? [createSearchPanel] : []);
      }
      return value;
    },
    provide: [showPanel.nFrom((s) => s.panel)]
  });
  var SearchState = class {
    constructor(query, panel4) {
      this.query = query;
      this.panel = panel4;
    }
  };
  var matchMark = Decoration.mark({class: themeClass("searchMatch")});
  var selectedMatchMark = Decoration.mark({class: themeClass("searchMatch.selected")});
  var searchHighlighter = ViewPlugin.fromClass(class {
    constructor(view22) {
      this.view = view22;
      this.decorations = this.highlight(view22.state.field(searchState));
    }
    update(update) {
      let state24 = update.state.field(searchState);
      if (state24 != update.prevState.field(searchState) || update.docChanged || update.selectionSet)
        this.decorations = this.highlight(state24);
    }
    highlight({query, panel: panel4}) {
      if (!panel4.length || !query.valid)
        return Decoration.none;
      let state24 = this.view.state, viewport = this.view.viewport;
      let cursor = query.cursor(state24.doc, Math.max(0, viewport.from - query.search.length), Math.min(viewport.to + query.search.length, state24.doc.length));
      let builder = new RangeSetBuilder();
      while (!cursor.next().done) {
        let {from, to} = cursor.value;
        let selected = state24.selection.ranges.some((r) => r.from == from && r.to == to);
        builder.add(from, to, selected ? selectedMatchMark : matchMark);
      }
      return builder.finish();
    }
  }, {
    decorations: (v) => v.decorations
  });
  function searchCommand(f) {
    return (view22) => {
      let state24 = view22.state.field(searchState, false);
      return state24 && state24.query.valid ? f(view22, state24) : openSearchPanel(view22);
    };
  }
  function findNextMatch(doc2, from, query) {
    let cursor = query.cursor(doc2, from).next();
    if (cursor.done) {
      cursor = query.cursor(doc2, 0, from + query.search.length - 1).next();
      if (cursor.done)
        return null;
    }
    return cursor.value;
  }
  var findNext = searchCommand((view22, state24) => {
    let {from, to} = view22.state.selection.primary;
    let next = findNextMatch(view22.state.doc, view22.state.selection.primary.from + 1, state24.query);
    if (!next || next.from == from && next.to == to)
      return false;
    view22.dispatch({selection: {anchor: next.from, head: next.to}, scrollIntoView: true});
    maybeAnnounceMatch(view22);
    return true;
  });
  var FindPrevChunkSize = 1e4;
  function findPrevInRange(query, doc2, from, to) {
    for (let pos = to; ; ) {
      let start = Math.max(from, pos - FindPrevChunkSize - query.search.length);
      let cursor = query.cursor(doc2, start, pos), range = null;
      while (!cursor.next().done)
        range = cursor.value;
      if (range)
        return range;
      if (start == from)
        return null;
      pos -= FindPrevChunkSize;
    }
  }
  var findPrevious = searchCommand((view22, {query}) => {
    let {state: state24} = view22;
    let range = findPrevInRange(query, state24.doc, 0, state24.selection.primary.to - 1) || findPrevInRange(query, state24.doc, state24.selection.primary.from + 1, state24.doc.length);
    if (!range)
      return false;
    view22.dispatch({selection: {anchor: range.from, head: range.to}, scrollIntoView: true});
    maybeAnnounceMatch(view22);
    return true;
  });
  var selectMatches = searchCommand((view22, {query}) => {
    let cursor = query.cursor(view22.state.doc), ranges = [];
    while (!cursor.next().done)
      ranges.push(EditorSelection.range(cursor.value.from, cursor.value.to));
    if (!ranges.length)
      return false;
    view22.dispatch({selection: EditorSelection.create(ranges)});
    return true;
  });
  var selectSelectionMatches = ({state: state24, dispatch: dispatch2}) => {
    let sel = state24.selection;
    if (sel.ranges.length > 1 || sel.primary.empty)
      return false;
    let {from, to} = sel.primary;
    let ranges = [], primary = 0;
    for (let cur2 = new SearchCursor(state24.doc, state24.sliceDoc(from, to)); !cur2.next().done; ) {
      if (ranges.length > 1e3)
        return false;
      if (cur2.value.from == from)
        primary = ranges.length;
      ranges.push(EditorSelection.range(cur2.value.from, cur2.value.to));
    }
    dispatch2(state24.update({selection: new EditorSelection(ranges, primary)}));
    return true;
  };
  var replaceNext = searchCommand((view22, {query}) => {
    let {state: state24} = view22, next = findNextMatch(state24.doc, state24.selection.primary.from, query);
    if (!next)
      return false;
    let {from, to} = state24.selection.primary, changes = [], selection;
    if (next.from == from && next.to == to) {
      changes.push({from: next.from, to: next.to, insert: query.replace});
      next = findNextMatch(state24.doc, next.to, query);
    }
    if (next) {
      let off = changes.length == 0 || changes[0].from >= next.to ? 0 : next.to - next.from - query.replace.length;
      selection = {anchor: next.from - off, head: next.to - off};
    }
    view22.dispatch({changes, selection, scrollIntoView: !!selection});
    if (next)
      maybeAnnounceMatch(view22);
    return true;
  });
  var replaceAll = searchCommand((view22, {query}) => {
    let cursor = query.cursor(view22.state.doc), changes = [];
    while (!cursor.next().done) {
      let {from, to} = cursor.value;
      changes.push({from, to, insert: query.replace});
    }
    if (!changes.length)
      return false;
    view22.dispatch({changes});
    return true;
  });
  function createSearchPanel(view22) {
    let {query} = view22.state.field(searchState);
    return {
      dom: buildPanel({
        view: view22,
        query,
        updateQuery(q) {
          if (!query.eq(q)) {
            query = q;
            view22.dispatch({effects: setQuery.of(query)});
          }
        }
      }),
      mount() {
        this.dom.querySelector("[name=search]").select();
      },
      pos: 80,
      style: "search"
    };
  }
  var openSearchPanel = (view22) => {
    let state24 = view22.state.field(searchState, false);
    if (state24 && state24.panel.length) {
      let panel4 = getPanel(view22, createSearchPanel);
      if (!panel4)
        return false;
      panel4.dom.querySelector("[name=search]").focus();
    } else {
      view22.dispatch({
        effects: togglePanel.of(true),
        reconfigure: state24 ? void 0 : {append: searchExtensions}
      });
    }
    return true;
  };
  var closeSearchPanel = (view22) => {
    let state24 = view22.state.field(searchState, false);
    if (!state24 || !state24.panel.length)
      return false;
    let panel4 = getPanel(view22, createSearchPanel);
    if (panel4 && panel4.dom.contains(view22.root.activeElement))
      view22.focus();
    view22.dispatch({effects: togglePanel.of(false)});
    return true;
  };
  var searchKeymap = [
    {key: "Mod-f", run: openSearchPanel, scope: "editor search-panel"},
    {key: "F3", run: findNext, shift: findPrevious, scope: "editor search-panel"},
    {key: "Mod-g", run: findNext, shift: findPrevious, scope: "editor search-panel"},
    {key: "Escape", run: closeSearchPanel, scope: "editor search-panel"},
    {key: "Mod-Shift-l", run: selectSelectionMatches}
  ];
  function elt(name2, props = null, children = []) {
    let e = document.createElement(name2);
    if (props)
      for (let prop in props) {
        let value = props[prop];
        if (typeof value == "string")
          e.setAttribute(prop, value);
        else
          e[prop] = value;
      }
    for (let child of children)
      e.appendChild(typeof child == "string" ? document.createTextNode(child) : child);
    return e;
  }
  function buildPanel(conf) {
    function p(phrase) {
      return conf.view.state.phrase(phrase);
    }
    let searchField = elt("input", {
      value: conf.query.search,
      placeholder: p("Find"),
      "aria-label": p("Find"),
      class: themeClass("textfield"),
      name: "search",
      onchange: update,
      onkeyup: update
    });
    let replaceField = elt("input", {
      value: conf.query.replace,
      placeholder: p("Replace"),
      "aria-label": p("Replace"),
      class: themeClass("textfield"),
      name: "replace",
      onchange: update,
      onkeyup: update
    });
    let caseField = elt("input", {
      type: "checkbox",
      name: "case",
      checked: !conf.query.caseInsensitive,
      onchange: update
    });
    function update() {
      conf.updateQuery(new Query(searchField.value, replaceField.value, !caseField.checked));
    }
    function keydown(e) {
      if (runScopeHandlers(conf.view, e, "search-panel")) {
        e.preventDefault();
      } else if (e.keyCode == 13 && e.target == searchField) {
        e.preventDefault();
        (e.shiftKey ? findPrevious : findNext)(conf.view);
      } else if (e.keyCode == 13 && e.target == replaceField) {
        e.preventDefault();
        replaceNext(conf.view);
      }
    }
    function button(name2, onclick, content2) {
      return elt("button", {class: themeClass("button"), name: name2, onclick}, content2);
    }
    let panel4 = elt("div", {onkeydown: keydown}, [
      searchField,
      button("next", () => findNext(conf.view), [p("next")]),
      button("prev", () => findPrevious(conf.view), [p("previous")]),
      button("select", () => selectMatches(conf.view), [p("all")]),
      elt("label", null, [caseField, "match case"]),
      elt("br"),
      replaceField,
      button("replace", () => replaceNext(conf.view), [p("replace")]),
      button("replaceAll", () => replaceAll(conf.view), [p("replace all")]),
      elt("button", {name: "close", onclick: () => closeSearchPanel(conf.view), "aria-label": p("close")}, ["\xD7"]),
      elt("div", {style: "position: absolute; top: -10000px", "aria-live": "polite"})
    ]);
    return panel4;
  }
  var AnnounceMargin = 30;
  var Break = /[\s\.,:;?!]/;
  function maybeAnnounceMatch(view22) {
    let {from, to} = view22.state.selection.primary;
    let lineStart = view22.state.doc.lineAt(from).from, lineEnd = view22.state.doc.lineAt(to).to;
    let start = Math.max(lineStart, from - AnnounceMargin), end = Math.min(lineEnd, to + AnnounceMargin);
    let text9 = view22.state.sliceDoc(start, end);
    if (start != lineStart) {
      for (let i = 0; i < AnnounceMargin; i++)
        if (!Break.test(text9[i + 1]) && Break.test(text9[i])) {
          text9 = text9.slice(i);
          break;
        }
    }
    if (end != lineEnd) {
      for (let i = text9.length - 1; i > text9.length - AnnounceMargin; i--)
        if (!Break.test(text9[i - 1]) && Break.test(text9[i])) {
          text9 = text9.slice(0, i);
          break;
        }
    }
    let panel4 = getPanel(view22, createSearchPanel);
    if (!panel4 || !panel4.dom.contains(view22.root.activeElement))
      return;
    let live2 = panel4.dom.querySelector("div[aria-live]");
    live2.textContent = view22.state.phrase("current match") + ". " + text9;
  }
  var baseTheme6 = EditorView.baseTheme({
    "$panel.search": {
      padding: "2px 6px 4px",
      position: "relative",
      "& [name=close]": {
        position: "absolute",
        top: "0",
        right: "4px",
        backgroundColor: "inherit",
        border: "none",
        font: "inherit",
        padding: 0,
        margin: 0
      },
      "& input, & button": {
        margin: ".2em .5em .2em 0"
      },
      "& label": {
        fontSize: "80%"
      }
    },
    "$$light $searchMatch": {backgroundColor: "#ffff0054"},
    "$$dark $searchMatch": {backgroundColor: "#00ffff8a"},
    "$$light $searchMatch.selected": {backgroundColor: "#ff6a0054"},
    "$$dark $searchMatch.selected": {backgroundColor: "#ff00ff8a"}
  });
  var searchExtensions = [
    searchState,
    precedence(searchHighlighter, "override"),
    panels(),
    baseTheme6
  ];

  // node_modules/@codemirror/next/tooltip/dist/index.js
  var Outside = "-10000px";
  var tooltipPlugin = ViewPlugin.fromClass(class {
    constructor(view22) {
      this.view = view22;
      this.inView = true;
      this.measureReq = {read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this};
      this.tooltips = view22.state.facet(showTooltip);
      this.tooltipViews = this.tooltips.map((tp) => this.createTooltip(tp));
    }
    update(update) {
      let tooltips2 = update.state.facet(showTooltip);
      if (tooltips2 == this.tooltips) {
        for (let t2 of this.tooltipViews)
          if (t2.update)
            t2.update(update);
      } else {
        let views = [];
        for (let i = 0; i < tooltips2.length; i++) {
          let tip = tooltips2[i], known = -1;
          for (let i2 = 0; i2 < this.tooltips.length; i2++)
            if (this.tooltips[i2].create == tip.create)
              known = i2;
          if (known < 0) {
            views[i] = this.createTooltip(tip);
          } else {
            let tooltipView = views[i] = this.tooltipViews[known];
            if (tooltipView.update)
              tooltipView.update(update);
          }
        }
        for (let t2 of this.tooltipViews)
          if (views.indexOf(t2) < 0)
            t2.dom.remove();
        this.tooltips = tooltips2;
        this.tooltipViews = views;
        this.maybeMeasure();
      }
    }
    createTooltip(tooltip3) {
      let tooltipView = tooltip3.create(this.view);
      tooltipView.dom.className = themeClass("tooltip" + (tooltip3.style ? "." + tooltip3.style : ""));
      this.view.dom.appendChild(tooltipView.dom);
      if (tooltipView.mount)
        tooltipView.mount(this.view);
      return tooltipView;
    }
    destroy() {
      for (let {dom: dom6} of this.tooltipViews)
        dom6.remove();
    }
    readMeasure() {
      return {
        editor: this.view.dom.getBoundingClientRect(),
        pos: this.tooltips.map((t2) => this.view.coordsAtPos(t2.pos)),
        size: this.tooltipViews.map(({dom: dom6}) => dom6.getBoundingClientRect()),
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      };
    }
    writeMeasure(measured) {
      let {editor} = measured;
      for (let i = 0; i < this.tooltipViews.length; i++) {
        let tooltip3 = this.tooltips[i], tView = this.tooltipViews[i], {dom: dom6} = tView;
        let pos = measured.pos[i], size = measured.size[i];
        if (!pos || pos.bottom <= editor.top || pos.top >= editor.bottom || pos.right <= editor.left || pos.left >= editor.right) {
          dom6.style.top = Outside;
          continue;
        }
        let width = size.right - size.left, height = size.bottom - size.top;
        let left = this.view.textDirection == Direction.LTR ? Math.min(pos.left, measured.innerWidth - width) : Math.max(0, pos.left - width);
        let above = !!tooltip3.above;
        if (!tooltip3.strictSide && (above ? pos.top - (size.bottom - size.top) < 0 : pos.bottom + (size.bottom - size.top) > measured.innerHeight))
          above = !above;
        dom6.style.top = (above ? pos.top - height : pos.bottom) + "px";
        dom6.style.left = left + "px";
        dom6.classList.toggle("cm-tooltip-above", above);
        dom6.classList.toggle("cm-tooltip-below", !above);
        if (tView.positioned)
          tView.positioned();
      }
    }
    maybeMeasure() {
      if (this.tooltips.length) {
        if (this.view.inView || this.inView)
          this.view.requestMeasure(this.measureReq);
        this.inView = this.view.inView;
      }
    }
  }, {
    eventHandlers: {
      scroll() {
        this.maybeMeasure();
      }
    }
  });
  var baseTheme7 = EditorView.baseTheme({
    $tooltip: {
      position: "fixed",
      border: "1px solid #ddd",
      backgroundColor: "#f5f5f5",
      zIndex: 100
    }
  });
  function tooltips() {
    return [tooltipPlugin, baseTheme7];
  }
  var showTooltip = Facet.define();
  var HoverTime = 750;
  var HoverMaxDist = 10;
  var HoverPlugin = class {
    constructor(view22, source, field, setHover) {
      this.view = view22;
      this.source = source;
      this.field = field;
      this.setHover = setHover;
      this.lastMouseMove = null;
      this.hoverTimeout = -1;
      this.mouseInside = false;
      this.checkHover = this.checkHover.bind(this);
      view22.dom.addEventListener("mouseenter", this.mouseenter = this.mouseenter.bind(this));
      view22.dom.addEventListener("mouseleave", this.mouseleave = this.mouseleave.bind(this));
      view22.dom.addEventListener("mousemove", this.mousemove = this.mousemove.bind(this));
    }
    get active() {
      return this.view.state.field(this.field);
    }
    checkHover() {
      this.hoverTimeout = -1;
      if (!this.mouseInside || this.active)
        return;
      let now = Date.now(), lastMove = this.lastMouseMove;
      if (now - lastMove.timeStamp < HoverTime) {
        this.hoverTimeout = setTimeout(this.checkHover, HoverTime - (now - lastMove.timeStamp));
        return;
      }
      let pos = this.view.contentDOM.contains(lastMove.target) ? this.view.posAtCoords({x: lastMove.clientX, y: lastMove.clientY}) : -1;
      let open = pos == null ? null : this.source(this.view, (from, to) => {
        return from <= pos && to >= pos && (from == to || isOverRange(this.view, from, to, lastMove.clientX, lastMove.clientY));
      });
      if (open)
        this.view.dispatch({effects: this.setHover.of(open)});
    }
    mousemove(event) {
      var _a;
      this.lastMouseMove = event;
      if (this.hoverTimeout < 0)
        this.hoverTimeout = setTimeout(this.checkHover, HoverTime);
      let tooltip3 = this.active;
      if (tooltip3 && !isInTooltip(event.target)) {
        let {pos} = tooltip3, end = (_a = tooltip3.end) !== null && _a !== void 0 ? _a : pos;
        if (pos == end ? this.view.posAtCoords({x: event.clientX, y: event.clientY}) != pos : !isOverRange(this.view, pos, end, event.clientX, event.clientY, HoverMaxDist))
          this.view.dispatch({effects: this.setHover.of(null)});
      }
    }
    mouseenter() {
      this.mouseInside = true;
    }
    mouseleave() {
      this.mouseInside = false;
      if (this.active)
        this.view.dispatch({effects: this.setHover.of(null)});
    }
    destroy() {
      clearTimeout(this.hoverTimeout);
      this.view.dom.removeEventListener("mouseenter", this.mouseenter);
      this.view.dom.removeEventListener("mouseleave", this.mouseleave);
      this.view.dom.removeEventListener("mousemove", this.mousemove);
    }
  };
  function isInTooltip(elt2) {
    for (let cur2 = elt2; cur2; cur2 = cur2.parentNode)
      if (cur2.nodeType == 1 && cur2.classList.contains("cm-tooltip"))
        return true;
    return false;
  }
  function isOverRange(view22, from, to, x, y, margin = 0) {
    let range = document.createRange();
    let fromDOM = view22.domAtPos(from), toDOM = view22.domAtPos(to);
    range.setEnd(toDOM.node, toDOM.offset);
    range.setStart(fromDOM.node, fromDOM.offset);
    let rects = range.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      let dist = Math.max(rect.top - y, y - rect.bottom, rect.left - x, x - rect.right);
      if (dist <= margin)
        return true;
    }
    return false;
  }
  function hoverTooltip(source, options = {}) {
    const setHover = StateEffect.define();
    const hoverState = StateField.define({
      create() {
        return null;
      },
      update(value, tr) {
        if (value && (options.hideOnChange && (tr.docChanged || tr.selection)))
          return null;
        for (let effect of tr.effects)
          if (effect.is(setHover))
            return effect.value;
        if (value && tr.docChanged) {
          let newPos = tr.changes.mapPos(value.pos, -1, MapMode.TrackDel);
          if (newPos == null)
            return null;
          let copy = Object.assign(Object.create(null), value);
          copy.pos = newPos;
          if (value.end != null)
            copy.end = tr.changes.mapPos(value.end);
          return copy;
        }
        return value;
      },
      provide: [showTooltip.nFrom((v) => v ? [v] : [])]
    });
    return [
      hoverState,
      ViewPlugin.define((view22) => new HoverPlugin(view22, source, hoverState, setHover)),
      tooltips()
    ];
  }

  // node_modules/@codemirror/next/autocomplete/dist/index.js
  var CompletionContext = class {
    constructor(state24, pos, explicit) {
      this.state = state24;
      this.pos = pos;
      this.explicit = explicit;
      this.abortListeners = [];
    }
    tokenBefore(types2) {
      let token = syntaxTree(this.state).resolve(this.pos, -1);
      while (token && types2.indexOf(token.name) < 0)
        token = token.parent;
      return token ? {
        from: token.from,
        to: this.pos,
        text: this.state.sliceDoc(token.from, this.pos),
        type: token.type
      } : null;
    }
    matchBefore(expr) {
      let line = this.state.doc.lineAt(this.pos);
      let start = Math.max(line.from, this.pos - 250);
      let str = line.slice(start - line.from, this.pos - line.from);
      let found = str.search(ensureAnchor(expr, false));
      return found < 0 ? null : {from: start + found, to: this.pos, text: str.slice(found)};
    }
    get aborted() {
      return this.abortListeners == null;
    }
    addEventListener(_type, listener) {
      if (this.abortListeners)
        this.abortListeners.push(listener);
    }
  };
  var Option = class {
    constructor(completion, source, match) {
      this.completion = completion;
      this.source = source;
      this.match = match;
    }
  };
  function cur(state24) {
    return state24.selection.primary.head;
  }
  function ensureAnchor(expr, start) {
    var _a;
    let {source} = expr;
    let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
    if (!addStart && !addEnd)
      return expr;
    return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a = expr.flags) !== null && _a !== void 0 ? _a : expr.ignoreCase ? "i" : "");
  }
  function applyCompletion(view22, option) {
    let apply = option.completion.apply || option.completion.label;
    let result = option.source;
    if (typeof apply == "string") {
      view22.dispatch({
        changes: {from: result.from, to: result.to, insert: apply},
        selection: {anchor: result.from + apply.length}
      });
    } else {
      apply(view22, option.completion, result.from, result.to);
    }
  }
  var FuzzyMatcher = class {
    constructor(pattern) {
      this.pattern = pattern;
      this.chars = [];
      this.folded = [];
      this.any = [];
      this.precise = [];
      this.byWord = [];
      for (let p = 0; p < pattern.length; ) {
        let char = codePointAt(pattern, p), size = codePointSize(char);
        this.chars.push(char);
        let part3 = pattern.slice(p, p + size), upper = part3.toUpperCase();
        this.folded.push(codePointAt(upper == part3 ? part3.toLowerCase() : upper, 0));
        p += size;
      }
      this.astral = pattern.length != this.chars.length;
    }
    match(word) {
      if (this.pattern.length == 0)
        return [0];
      if (word.length < this.pattern.length)
        return null;
      let {chars, folded, any, precise, byWord} = this;
      if (chars.length == 1) {
        let first = codePointAt(word, 0);
        return first == chars[0] ? [0, 0, codePointSize(first)] : first == folded[0] ? [-200, 0, codePointSize(first)] : null;
      }
      let direct = word.indexOf(this.pattern);
      if (direct == 0)
        return [0, 0, this.pattern.length];
      let len = chars.length, anyTo = 0;
      if (direct < 0) {
        for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len; ) {
          let next = codePointAt(word, i);
          if (next == chars[anyTo] || next == folded[anyTo])
            any[anyTo++] = i;
          i += codePointSize(next);
        }
        if (anyTo < len)
          return null;
      }
      let preciseTo = 0;
      let byWordTo = 0, byWordFolded = false;
      let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
      for (let i = 0, e = Math.min(word.length, 200), prevType = 0; i < e && byWordTo < len; ) {
        let next = codePointAt(word, i);
        if (direct < 0) {
          if (preciseTo < len && next == chars[preciseTo])
            precise[preciseTo++] = i;
          if (adjacentTo < len) {
            if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
              if (adjacentTo == 0)
                adjacentStart = i;
              adjacentEnd = i;
              adjacentTo++;
            } else {
              adjacentTo = 0;
            }
          }
        }
        let ch, type = next < 255 ? next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 : next >= 65 && next <= 90 ? 1 : 0 : (ch = fromCodePoint(next)) != ch.toLowerCase() ? 1 : ch != ch.toUpperCase() ? 2 : 0;
        if (type == 1 || prevType == 0 && type != 0 && (this.chars[byWordTo] == next || this.folded[byWordTo] == next && (byWordFolded = true)))
          byWord[byWordTo++] = i;
        prevType = type;
        i += codePointSize(next);
      }
      if (byWordTo == len && byWord[0] == 0)
        return this.result(-100 + (byWordFolded ? -200 : 0), byWord, word);
      if (adjacentTo == len && adjacentStart == 0)
        return [-200, 0, adjacentEnd];
      if (direct > -1)
        return [-700, direct, direct + this.pattern.length];
      if (adjacentTo == len)
        return [-200 + -700, adjacentStart, adjacentEnd];
      if (byWordTo == len)
        return this.result(-100 + (byWordFolded ? -200 : 0) + -700, byWord, word);
      return chars.length == 2 ? null : this.result((any[0] ? -700 : 0) + -200 + -1100, any, word);
    }
    result(score, positions, word) {
      let result = [score], i = 1;
      for (let pos of positions) {
        let to = pos + (this.astral ? codePointSize(codePointAt(word, pos)) : 1);
        if (i > 1 && result[i - 1] == pos)
          result[i - 1] = to;
        else {
          result[i++] = pos;
          result[i++] = to;
        }
      }
      return result;
    }
  };
  var completionConfig = Facet.define({
    combine(configs) {
      return combineConfig(configs, {
        activateOnTyping: true,
        override: null,
        maxRenderedOptions: 100
      });
    }
  });
  var MaxInfoWidth = 300;
  var baseTheme8 = EditorView.baseTheme({
    "$tooltip.autocomplete": {
      "& > ul": {
        fontFamily: "monospace",
        overflowY: "auto",
        whiteSpace: "nowrap",
        maxHeight: "10em",
        listStyle: "none",
        margin: 0,
        padding: 0,
        "& > li": {
          cursor: "pointer",
          padding: "1px 1em 1px 3px",
          lineHeight: 1.2
        },
        "& > li[aria-selected]": {
          background_fallback: "#bdf",
          backgroundColor: "Highlight",
          color_fallback: "white",
          color: "HighlightText"
        }
      }
    },
    "$completionListIncompleteTop:before, $completionListIncompleteBottom:after": {
      content: '"\xB7\xB7\xB7"',
      opacity: 0.5,
      display: "block",
      textAlign: "center"
    },
    "$tooltip.completionInfo": {
      position: "absolute",
      padding: "3px 9px",
      width: "max-content",
      maxWidth: MaxInfoWidth + "px"
    },
    "$tooltip.completionInfo.left": {right: "100%"},
    "$tooltip.completionInfo.right": {left: "100%"},
    "$$light $snippetField": {backgroundColor: "#ddd"},
    "$$dark $snippetField": {backgroundColor: "#333"},
    $snippetFieldPosition: {
      verticalAlign: "text-top",
      width: 0,
      height: "1.15em",
      margin: "0 -0.7px -.7em",
      borderLeft: "1.4px dotted #888"
    },
    $completionMatchedText: {
      textDecoration: "underline"
    },
    $completionDetail: {
      marginLeft: "0.5em",
      fontStyle: "italic"
    },
    $completionIcon: {
      fontSize: "90%",
      width: ".8em",
      display: "inline-block",
      textAlign: "center",
      paddingRight: ".6em",
      opacity: "0.6"
    },
    "$completionIcon.function, $completionIcon.method": {
      "&:after": {content: "'\u0192'"}
    },
    "$completionIcon.class": {
      "&:after": {content: "'\u25CB'"}
    },
    "$completionIcon.interface": {
      "&:after": {content: "'\u25CC'"}
    },
    "$completionIcon.variable": {
      "&:after": {content: "'\u{1D465}'"}
    },
    "$completionIcon.constant": {
      "&:after": {content: "'\u{1D436}'"}
    },
    "$completionIcon.type": {
      "&:after": {content: "'\u{1D461}'"}
    },
    "$completionIcon.enum": {
      "&:after": {content: "'\u222A'"}
    },
    "$completionIcon.property": {
      "&:after": {content: "'\u25A1'"}
    },
    "$completionIcon.keyword": {
      "&:after": {content: "'\u{1F511}\uFE0E'"}
    },
    "$completionIcon.namespace": {
      "&:after": {content: "'\u25A2'"}
    },
    "$completionIcon.text": {
      "&:after": {content: "'abc'", fontSize: "50%", verticalAlign: "middle"}
    }
  });
  function createListBox(options, id, range) {
    const ul = document.createElement("ul");
    ul.id = id;
    ul.setAttribute("role", "listbox");
    ul.setAttribute("aria-expanded", "true");
    for (let i = range.from; i < range.to; i++) {
      let {completion, match} = options[i];
      const li = ul.appendChild(document.createElement("li"));
      li.id = id + "-" + i;
      let icon = li.appendChild(document.createElement("div"));
      icon.className = themeClass("completionIcon" + (completion.type ? "." + completion.type : ""));
      icon.setAttribute("aria-hidden", "true");
      let labelElt = li.appendChild(document.createElement("span"));
      labelElt.className = themeClass("completionLabel");
      let {label, detail} = completion, off = 0;
      for (let j = 1; j < match.length; ) {
        let from = match[j++], to = match[j++];
        if (from > off)
          labelElt.appendChild(document.createTextNode(label.slice(off, from)));
        let span = labelElt.appendChild(document.createElement("span"));
        span.appendChild(document.createTextNode(label.slice(from, to)));
        span.className = themeClass("completionMatchedText");
        off = to;
      }
      if (off < label.length)
        labelElt.appendChild(document.createTextNode(label.slice(off)));
      if (detail) {
        let detailElt = li.appendChild(document.createElement("span"));
        detailElt.className = themeClass("completionDetail");
        detailElt.textContent = detail;
      }
      li.setAttribute("role", "option");
    }
    if (range.from)
      ul.classList.add(themeClass("completionListIncompleteTop"));
    if (range.to < options.length)
      ul.classList.add(themeClass("completionListIncompleteBottom"));
    return ul;
  }
  function createInfoDialog(option) {
    let dom6 = document.createElement("div");
    dom6.className = themeClass("tooltip.completionInfo");
    let {info} = option.completion;
    if (typeof info == "string")
      dom6.textContent = info;
    else
      dom6.appendChild(info(option.completion));
    return dom6;
  }
  function rangeAroundSelected(total, selected, max) {
    if (total <= max)
      return {from: 0, to: total};
    if (selected <= total >> 1) {
      let off2 = Math.floor(selected / max);
      return {from: off2 * max, to: (off2 + 1) * max};
    }
    let off = Math.floor((total - selected) / max);
    return {from: total - (off + 1) * max, to: total - off * max};
  }
  var CompletionTooltip = class {
    constructor(view22, stateField) {
      this.view = view22;
      this.stateField = stateField;
      this.info = null;
      this.placeInfo = {
        read: () => this.measureInfo(),
        write: (pos) => this.positionInfo(pos),
        key: this
      };
      let cState = view22.state.field(stateField);
      let {options, selected} = cState.open;
      let config2 = view22.state.facet(completionConfig);
      this.range = rangeAroundSelected(options.length, selected, config2.maxRenderedOptions);
      this.dom = document.createElement("div");
      this.dom.addEventListener("mousedown", (e) => {
        for (let dom6 = e.target, match; dom6 && dom6 != this.dom; dom6 = dom6.parentNode) {
          if (dom6.nodeName == "LI" && (match = /-(\d+)$/.exec(dom6.id)) && +match[1] < options.length) {
            applyCompletion(view22, options[+match[1]]);
            e.preventDefault();
            return;
          }
        }
      });
      this.list = this.dom.appendChild(createListBox(options, cState.id, this.range));
      this.list.addEventListener("scroll", () => {
        if (this.info)
          this.view.requestMeasure(this.placeInfo);
      });
    }
    mount() {
      this.updateSel();
    }
    update(update) {
      if (update.state.field(this.stateField) != update.prevState.field(this.stateField))
        this.updateSel();
    }
    positioned() {
      if (this.info)
        this.view.requestMeasure(this.placeInfo);
    }
    updateSel() {
      let cState = this.view.state.field(this.stateField), open = cState.open;
      if (open.selected < this.range.from || open.selected >= this.range.to) {
        this.range = rangeAroundSelected(open.options.length, open.selected, this.view.state.facet(completionConfig).maxRenderedOptions);
        this.list.remove();
        this.list = this.dom.appendChild(createListBox(open.options, cState.id, this.range));
        this.list.addEventListener("scroll", () => {
          if (this.info)
            this.view.requestMeasure(this.placeInfo);
        });
      }
      if (this.updateSelectedOption(open.selected)) {
        if (this.info) {
          this.info.remove();
          this.info = null;
        }
        let option = open.options[open.selected];
        if (option.completion.info) {
          this.info = this.dom.appendChild(createInfoDialog(option));
          this.view.requestMeasure(this.placeInfo);
        }
      }
    }
    updateSelectedOption(selected) {
      let set = null;
      for (let opt = this.list.firstChild, i = this.range.from; opt; opt = opt.nextSibling, i++) {
        if (i == selected) {
          if (!opt.hasAttribute("aria-selected")) {
            opt.setAttribute("aria-selected", "true");
            set = opt;
          }
        } else {
          if (opt.hasAttribute("aria-selected"))
            opt.removeAttribute("aria-selected");
        }
      }
      if (set)
        scrollIntoView(this.list, set);
      return set;
    }
    measureInfo() {
      let sel = this.dom.querySelector("[aria-selected]");
      if (!sel)
        return null;
      let rect = this.dom.getBoundingClientRect();
      let top2 = sel.getBoundingClientRect().top - rect.top;
      if (top2 < 0 || top2 > this.list.clientHeight - 10)
        return null;
      let left = this.view.textDirection == Direction.RTL;
      let spaceLeft = rect.left, spaceRight = innerWidth - rect.right;
      if (left && spaceLeft < Math.min(MaxInfoWidth, spaceRight))
        left = false;
      else if (!left && spaceRight < Math.min(MaxInfoWidth, spaceLeft))
        left = true;
      return {top: top2, left};
    }
    positionInfo(pos) {
      if (this.info && pos) {
        this.info.style.top = pos.top + "px";
        this.info.classList.toggle("cm-tooltip-completionInfo-left", pos.left);
        this.info.classList.toggle("cm-tooltip-completionInfo-right", !pos.left);
      }
    }
  };
  function completionTooltip(stateField) {
    return (view22) => new CompletionTooltip(view22, stateField);
  }
  function scrollIntoView(container, element) {
    let parent = container.getBoundingClientRect();
    let self2 = element.getBoundingClientRect();
    if (self2.top < parent.top)
      container.scrollTop -= parent.top - self2.top;
    else if (self2.bottom > parent.bottom)
      container.scrollTop += self2.bottom - parent.bottom;
  }
  var MaxOptions = 300;
  function sortOptions(active, state24) {
    let options = [];
    for (let a of active)
      if (a.hasResult()) {
        let matcher = new FuzzyMatcher(state24.sliceDoc(a.from, a.to)), match;
        for (let option of a.result.options)
          if (match = matcher.match(option.label)) {
            if (option.boost != null)
              match[0] += option.boost;
            options.push(new Option(option, a, match));
          }
      }
    options.sort(cmpOption);
    return options.length > MaxOptions ? options.slice(0, MaxOptions) : options;
  }
  var CompletionDialog = class {
    constructor(options, attrs, tooltip3, timestamp, selected) {
      this.options = options;
      this.attrs = attrs;
      this.tooltip = tooltip3;
      this.timestamp = timestamp;
      this.selected = selected;
    }
    setSelected(selected, id) {
      return selected == this.selected || selected >= this.options.length ? this : new CompletionDialog(this.options, makeAttrs(id, selected), this.tooltip, this.timestamp, selected);
    }
    static build(active, state24, id, prev) {
      let options = sortOptions(active, state24);
      if (!options.length)
        return null;
      let selected = 0;
      if (prev) {
        let selectedValue = prev.options[prev.selected].completion;
        for (let i = 0; i < options.length && !selected; i++) {
          if (options[i].completion == selectedValue)
            selected = i;
        }
      }
      return new CompletionDialog(options, makeAttrs(id, selected), [{
        pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
        style: "autocomplete",
        create: completionTooltip(completionState)
      }], prev ? prev.timestamp : Date.now(), selected);
    }
    map(changes) {
      return new CompletionDialog(this.options, this.attrs, [Object.assign(Object.assign({}, this.tooltip[0]), {pos: changes.mapPos(this.tooltip[0].pos)})], this.timestamp, this.selected);
    }
  };
  var CompletionState = class {
    constructor(active, id, open) {
      this.active = active;
      this.id = id;
      this.open = open;
    }
    static start() {
      return new CompletionState(none4, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
    }
    update(tr) {
      let {state: state24} = tr, conf = state24.facet(completionConfig);
      let sources = conf.override || state24.languageDataAt("autocomplete", cur(state24));
      let active = sources.map((source) => {
        let value = this.active.find((s) => s.source == source) || new ActiveSource(source, 0, false);
        return value.update(tr, conf);
      });
      if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
        active = this.active;
      let open = tr.selection || active.some((a) => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) || !sameResults(active, this.active) ? CompletionDialog.build(active, state24, this.id, this.open) : this.open && tr.docChanged ? this.open.map(tr.changes) : this.open;
      for (let effect of tr.effects)
        if (effect.is(setSelectedEffect))
          open = open && open.setSelected(effect.value, this.id);
      return active == this.active && open == this.open ? this : new CompletionState(active, this.id, open);
    }
    get tooltip() {
      return this.open ? this.open.tooltip : none4;
    }
    get attrs() {
      return this.open ? this.open.attrs : baseAttrs;
    }
  };
  function sameResults(a, b) {
    if (a == b)
      return true;
    for (let iA = 0, iB = 0; ; ) {
      while (iA < a.length && !a[iA].hasResult)
        iA++;
      while (iB < b.length && !b[iB].hasResult)
        iB++;
      let endA = iA == a.length, endB = iB == b.length;
      if (endA || endB)
        return endA == endB;
      if (a[iA++].result != b[iB++].result)
        return false;
    }
  }
  function makeAttrs(id, selected) {
    return {
      "aria-autocomplete": "list",
      "aria-activedescendant": id + "-" + selected,
      "aria-owns": id
    };
  }
  var baseAttrs = {"aria-autocomplete": "list"};
  var none4 = [];
  function cmpOption(a, b) {
    let dScore = b.match[0] - a.match[0];
    if (dScore)
      return dScore;
    let lA = a.completion.label, lB = b.completion.label;
    return lA < lB ? -1 : lA == lB ? 0 : 1;
  }
  var ActiveSource = class {
    constructor(source, state24, explicit) {
      this.source = source;
      this.state = state24;
      this.explicit = explicit;
    }
    hasResult() {
      return false;
    }
    update(tr, conf) {
      let event = tr.annotation(Transaction.userEvent), value = this;
      if (event == "input" || event == "delete")
        value = value.handleUserEvent(tr, event, conf);
      else if (tr.docChanged)
        value = value.handleChange(tr);
      else if (tr.selection && value.state != 0)
        value = new ActiveSource(value.source, 0, false);
      for (let effect of tr.effects) {
        if (effect.is(startCompletionEffect))
          value = new ActiveSource(value.source, 1, effect.value);
        else if (effect.is(closeCompletionEffect))
          value = new ActiveSource(value.source, 0, false);
        else if (effect.is(setActiveEffect)) {
          for (let active of effect.value)
            if (active.source == value.source)
              value = active;
        }
      }
      return value;
    }
    handleUserEvent(_tr, type, conf) {
      return type == "delete" || !conf.activateOnTyping ? this : new ActiveSource(this.source, 1, false);
    }
    handleChange(tr) {
      return tr.changes.touchesRange(cur(tr.startState)) ? new ActiveSource(this.source, 0, false) : this;
    }
  };
  var ActiveResult = class extends ActiveSource {
    constructor(source, explicit, result, from, to, span) {
      super(source, 2, explicit);
      this.result = result;
      this.from = from;
      this.to = to;
      this.span = span;
    }
    hasResult() {
      return true;
    }
    handleUserEvent(tr, type, conf) {
      let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
      let pos = cur(tr.state);
      if ((this.explicit ? pos < from : pos <= from) || pos > to)
        return new ActiveSource(this.source, type == "input" && conf.activateOnTyping ? 1 : 0, false);
      if (this.span && (from == to || this.span.test(tr.state.sliceDoc(from, to))))
        return new ActiveResult(this.source, this.explicit, this.result, from, to, this.span);
      return new ActiveSource(this.source, 1, this.explicit);
    }
    handleChange(tr) {
      return tr.changes.touchesRange(this.from, this.to) ? new ActiveSource(this.source, 0, false) : new ActiveResult(this.source, this.explicit, this.result, tr.changes.mapPos(this.from), tr.changes.mapPos(this.to, 1), this.span);
    }
    map(mapping) {
      return new ActiveResult(this.source, this.explicit, this.result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1), this.span);
    }
  };
  var startCompletionEffect = StateEffect.define();
  var closeCompletionEffect = StateEffect.define();
  var setActiveEffect = StateEffect.define({
    map(sources, mapping) {
      return sources.map((s) => s.hasResult() && !mapping.empty ? s.map(mapping) : s);
    }
  });
  var setSelectedEffect = StateEffect.define();
  var completionState = StateField.define({
    create() {
      return CompletionState.start();
    },
    update(value, tr) {
      return value.update(tr);
    },
    provide: [
      showTooltip.nFrom((state24) => state24.tooltip),
      EditorView.contentAttributes.from((state24) => state24.attrs)
    ]
  });
  var CompletionInteractMargin = 75;
  function moveCompletionSelection(forward, by = "option") {
    return (view22) => {
      let cState = view22.state.field(completionState, false);
      if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
        return false;
      let step = 1, tooltip3;
      if (by == "page" && (tooltip3 = view22.dom.querySelector(".cm-tooltip-autocomplete")))
        step = Math.max(2, Math.floor(tooltip3.offsetHeight / tooltip3.firstChild.offsetHeight));
      let selected = cState.open.selected + step * (forward ? 1 : -1), {length} = cState.open.options;
      if (selected < 0)
        selected = by == "page" ? 0 : length - 1;
      else if (selected >= length)
        selected = by == "page" ? length - 1 : 0;
      view22.dispatch({effects: setSelectedEffect.of(selected)});
      return true;
    };
  }
  var acceptCompletion = (view22) => {
    let cState = view22.state.field(completionState, false);
    if (!cState || !cState.open || Date.now() - cState.open.timestamp < CompletionInteractMargin)
      return false;
    applyCompletion(view22, cState.open.options[cState.open.selected]);
    return true;
  };
  var startCompletion = (view22) => {
    let cState = view22.state.field(completionState, false);
    if (!cState)
      return false;
    view22.dispatch({effects: startCompletionEffect.of(true)});
    return true;
  };
  var closeCompletion = (view22) => {
    let cState = view22.state.field(completionState, false);
    if (!cState || !cState.active.some((a) => a.state != 0))
      return false;
    view22.dispatch({effects: closeCompletionEffect.of(null)});
    return true;
  };
  var RunningQuery = class {
    constructor(source, context) {
      this.source = source;
      this.context = context;
      this.time = Date.now();
      this.updates = [];
      this.done = void 0;
    }
  };
  var DebounceTime = 50;
  var MaxUpdateCount = 50;
  var MinAbortTime = 1e3;
  var completionPlugin = ViewPlugin.fromClass(class {
    constructor(view22) {
      this.view = view22;
      this.debounceUpdate = -1;
      this.running = [];
      this.debounceAccept = -1;
      this.composing = 0;
      for (let active of view22.state.field(completionState).active)
        if (active.state == 1)
          this.startQuery(active);
    }
    update(update) {
      let cState = update.state.field(completionState);
      if (!update.selectionSet && !update.docChanged && update.prevState.field(completionState) == cState)
        return;
      let doesReset = update.transactions.some((tr) => {
        let event = tr.annotation(Transaction.userEvent);
        return (tr.selection || tr.docChanged) && event != "input" && event != "delete";
      });
      for (let i = 0; i < this.running.length; i++) {
        let query = this.running[i];
        if (doesReset || query.updates.length + update.transactions.length > MaxUpdateCount && query.time - Date.now() > MinAbortTime) {
          for (let handler of query.context.abortListeners) {
            try {
              handler();
            } catch (e) {
              logException(this.view.state, e);
            }
          }
          query.context.abortListeners = null;
          this.running.splice(i--, 1);
        } else {
          query.updates.push(...update.transactions);
        }
      }
      if (this.debounceUpdate > -1)
        clearTimeout(this.debounceUpdate);
      this.debounceUpdate = cState.active.some((a) => a.state == 1 && !this.running.some((q) => q.source == a.source)) ? setTimeout(() => this.startUpdate(), DebounceTime) : -1;
      if (this.composing != 0)
        for (let tr of update.transactions) {
          if (tr.annotation(Transaction.userEvent) == "input")
            this.composing = 2;
          else if (this.composing == 2 && tr.selection)
            this.composing = 3;
        }
    }
    startUpdate() {
      this.debounceUpdate = -1;
      let {state: state24} = this.view, cState = state24.field(completionState);
      for (let active of cState.active) {
        if (active.state == 1 && !this.running.some((r) => r.source == active.source))
          this.startQuery(active);
      }
    }
    startQuery(active) {
      let {state: state24} = this.view, pos = cur(state24);
      let context = new CompletionContext(state24, pos, active.explicit);
      let pending = new RunningQuery(active.source, context);
      this.running.push(pending);
      Promise.resolve(active.source(context)).then((result) => {
        if (!pending.context.aborted) {
          pending.done = result || null;
          this.scheduleAccept();
        }
      }, (err) => {
        this.view.dispatch({effects: closeCompletionEffect.of(null)});
        logException(this.view.state, err);
      });
    }
    scheduleAccept() {
      if (this.running.every((q) => q.done !== void 0))
        this.accept();
      else if (this.debounceAccept < 0)
        this.debounceAccept = setTimeout(() => this.accept(), DebounceTime);
    }
    accept() {
      var _a;
      if (this.debounceAccept > -1)
        clearTimeout(this.debounceAccept);
      this.debounceAccept = -1;
      let updated = [];
      let conf = this.view.state.facet(completionConfig);
      for (let i = 0; i < this.running.length; i++) {
        let query = this.running[i];
        if (query.done === void 0)
          continue;
        this.running.splice(i--, 1);
        if (query.done) {
          let active = new ActiveResult(query.source, query.context.explicit, query.done, query.done.from, (_a = query.done.to) !== null && _a !== void 0 ? _a : cur(query.updates.length ? query.updates[0].startState : this.view.state), query.done.span ? ensureAnchor(query.done.span, true) : null);
          for (let tr of query.updates)
            active = active.update(tr, conf);
          if (active.hasResult()) {
            updated.push(active);
            continue;
          }
        }
        let current = this.view.state.field(completionState).active.find((a) => a.source == query.source);
        if (current && current.state == 1) {
          if (query.done == null) {
            let active = new ActiveSource(query.source, 0, false);
            for (let tr of query.updates)
              active = active.update(tr, conf);
            if (active.state != 1)
              updated.push(active);
          } else {
            this.startQuery(current);
          }
        }
      }
      if (updated.length)
        this.view.dispatch({effects: setActiveEffect.of(updated)});
    }
  }, {
    eventHandlers: {
      compositionstart() {
        this.composing = 1;
      },
      compositionend() {
        if (this.composing == 3)
          this.view.dispatch({effects: startCompletionEffect.of(false)});
        this.composing = 0;
      }
    }
  });
  var fieldMarker = Decoration.widget({widget: new class extends WidgetType {
    toDOM() {
      let span = document.createElement("span");
      span.className = themeClass("snippetFieldPosition");
      return span;
    }
    ignoreEvent() {
      return false;
    }
  }()});
  var fieldRange = Decoration.mark({class: themeClass("snippetField")});
  var ActiveSnippet = class {
    constructor(ranges, active) {
      this.ranges = ranges;
      this.active = active;
      this.deco = Decoration.set(ranges.map((r) => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)));
    }
    map(changes) {
      return new ActiveSnippet(this.ranges.map((r) => r.map(changes)), this.active);
    }
    selectionInsideField(sel) {
      return sel.ranges.every((range) => this.ranges.some((r) => r.field == this.active && r.from <= range.from && r.to >= range.to));
    }
  };
  var setActive = StateEffect.define({
    map(value, changes) {
      return value && value.map(changes);
    }
  });
  var moveToField = StateEffect.define();
  var snippetState = StateField.define({
    create() {
      return null;
    },
    update(value, tr) {
      for (let effect of tr.effects) {
        if (effect.is(setActive))
          return effect.value;
        if (effect.is(moveToField) && value)
          return new ActiveSnippet(value.ranges, effect.value);
      }
      if (value && tr.docChanged)
        value = value.map(tr.changes);
      if (value && tr.selection && !value.selectionInsideField(tr.selection))
        value = null;
      return value;
    },
    provide: [EditorView.decorations.from((val) => val ? val.deco : Decoration.none)]
  });
  function fieldSelection(ranges, field) {
    return EditorSelection.create(ranges.filter((r) => r.field == field).map((r) => EditorSelection.range(r.from, r.to)));
  }
  function moveField(dir) {
    return ({state: state24, dispatch: dispatch2}) => {
      let active = state24.field(snippetState, false);
      if (!active || dir < 0 && active.active == 0)
        return false;
      let next = active.active + dir, last = dir > 0 && !active.ranges.some((r) => r.field == next + dir);
      dispatch2(state24.update({
        selection: fieldSelection(active.ranges, next),
        effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next))
      }));
      return true;
    };
  }
  var clearSnippet = ({state: state24, dispatch: dispatch2}) => {
    let active = state24.field(snippetState, false);
    if (!active)
      return false;
    dispatch2(state24.update({effects: setActive.of(null)}));
    return true;
  };
  var snippetKeymap = precedence(keymap([
    {key: "Tab", run: moveField(1), shift: moveField(-1)},
    {key: "Escape", run: clearSnippet}
  ]), "override");
  function autocompletion(config2 = {}) {
    return [
      completionState,
      completionConfig.of(config2),
      completionPlugin,
      baseTheme8,
      tooltips(),
      precedence(keymap([
        {key: "ArrowDown", run: moveCompletionSelection(true)},
        {key: "ArrowUp", run: moveCompletionSelection(false)},
        {key: "PageDown", run: moveCompletionSelection(true, "page")},
        {key: "PageUp", run: moveCompletionSelection(false, "page")},
        {key: "Enter", run: acceptCompletion}
      ]), "override")
    ];
  }
  var completionKeymap = [
    {key: "Mod-Space", run: startCompletion},
    {key: "Escape", run: closeCompletion}
  ];

  // node_modules/@codemirror/next/comment/dist/index.js
  var toggleLineComment = (target) => {
    return dispatch(toggleLineCommentWithOption(CommentOption.Toggle), target);
  };
  var toggleBlockComment = (target) => {
    return dispatch(toggleBlockCommentWithOption(CommentOption.Toggle), target);
  };
  var commentKeymap = [
    {key: "Mod-/", run: toggleLineComment},
    {key: "Alt-A", run: toggleBlockComment}
  ];
  function dispatch(cmd2, target) {
    const tr = cmd2(target.state);
    if (!tr)
      return false;
    target.dispatch(tr);
    return true;
  }
  var CommentOption;
  (function(CommentOption2) {
    CommentOption2[CommentOption2["Toggle"] = 0] = "Toggle";
    CommentOption2[CommentOption2["OnlyComment"] = 1] = "OnlyComment";
    CommentOption2[CommentOption2["OnlyUncomment"] = 2] = "OnlyUncomment";
  })(CommentOption || (CommentOption = {}));
  function getConfig(state24, pos = state24.selection.primary.head) {
    return state24.languageDataAt("commentTokens", pos)[0] || {};
  }
  var toggleBlockCommentWithOption = (option) => (state24) => {
    const config2 = getConfig(state24);
    return config2.block ? new BlockCommenter(config2.block.open, config2.block.close).toggle(option, state24) : null;
  };
  var toggleLineCommentWithOption = (option) => (state24) => {
    const config2 = getConfig(state24);
    return config2.line ? new LineCommenter(config2.line).toggle(option, state24) : null;
  };
  var BlockCommenter = class {
    constructor(open, close, margin = " ") {
      this.open = open;
      this.close = close;
      this.margin = margin;
    }
    toggle(option, state24) {
      const selectionCommented = this.isSelectionCommented(state24);
      if (selectionCommented !== null) {
        if (option !== CommentOption.OnlyComment) {
          return state24.update({
            changes: selectionCommented.map(({open, close}) => [
              {from: open.pos - this.open.length, to: open.pos + open.margin},
              {from: close.pos - close.margin, to: close.pos + this.close.length}
            ])
          });
        }
      } else {
        if (option !== CommentOption.OnlyUncomment) {
          return state24.update(state24.changeByRange((range) => {
            const shift2 = (this.open + this.margin).length;
            return {
              changes: [
                {from: range.from, insert: this.open + this.margin},
                {from: range.to, insert: this.margin + this.close}
              ],
              range: EditorSelection.range(range.anchor + shift2, range.head + shift2)
            };
          }));
        }
      }
      return null;
    }
    isSelectionCommented(state24) {
      let result = [];
      for (const range of state24.selection.ranges) {
        const x = this.isRangeCommented(state24, range);
        if (x === null)
          return null;
        result.push(x);
      }
      return result;
    }
    isRangeCommented(state24, range) {
      let textBefore = state24.sliceDoc(range.from - SearchMargin, range.from);
      let textAfter = state24.sliceDoc(range.to, range.to + SearchMargin);
      let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
      let beforeOff = textBefore.length - spaceBefore;
      if (textBefore.slice(beforeOff - this.open.length, beforeOff) == this.open && textAfter.slice(spaceAfter, spaceAfter + this.close.length) == this.close) {
        return {
          open: {pos: range.from - spaceBefore, margin: spaceBefore && 1},
          close: {pos: range.to + spaceAfter, margin: spaceAfter && 1}
        };
      }
      let startText, endText;
      if (range.to - range.from <= 2 * SearchMargin) {
        startText = endText = state24.sliceDoc(range.from, range.to);
      } else {
        startText = state24.sliceDoc(range.from, range.from + SearchMargin);
        endText = state24.sliceDoc(range.to - SearchMargin, range.to);
      }
      let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
      let endOff = endText.length - endSpace - this.close.length;
      if (startText.slice(startSpace, startSpace + this.open.length) == this.open && endText.slice(endOff, endOff + this.close.length) == this.close) {
        return {
          open: {
            pos: range.from + startSpace + this.open.length,
            margin: /\s/.test(startText.charAt(startSpace + this.open.length)) ? 1 : 0
          },
          close: {
            pos: range.to - endSpace - this.close.length,
            margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0
          }
        };
      }
      return null;
    }
  };
  var SearchMargin = 50;
  var LineCommenter = class {
    constructor(lineCommentToken, margin = " ") {
      this.lineCommentToken = lineCommentToken;
      this.margin = margin;
    }
    toggle(option, state24) {
      const linesAcrossSelection = [];
      const linesAcrossRange = {};
      for (let i = 0; i < state24.selection.ranges.length; i++) {
        const lines = getLinesInRange(state24.doc, state24.selection.ranges[i]);
        linesAcrossSelection.push(...lines);
        linesAcrossRange[i] = lines;
      }
      const column = this.isRangeCommented(state24, linesAcrossSelection);
      if (column.isRangeLineSkipped) {
        if (option != CommentOption.OnlyComment) {
          let changes = [];
          for (let i = 0; i < state24.selection.ranges.length; i++) {
            const lines = linesAcrossRange[i];
            for (const line of lines) {
              if (lines.length > 1 && column.isLineSkipped[line.number])
                continue;
              const pos = line.from + column.minCol;
              const posAfter = column.minCol + this.lineCommentToken.length;
              const marginLen = line.slice(posAfter, posAfter + 1) == " " ? 1 : 0;
              changes.push({from: pos, to: pos + this.lineCommentToken.length + marginLen});
            }
          }
          return state24.update({changes});
        }
      } else {
        if (option != CommentOption.OnlyUncomment) {
          let changes = [];
          for (let i = 0; i < state24.selection.ranges.length; i++) {
            const lines = linesAcrossRange[i];
            for (const line of lines) {
              if (lines.length <= 1 || !column.isLineSkipped[line.number])
                changes.push({from: line.from + column.minCol, insert: this.lineCommentToken + this.margin});
            }
          }
          return state24.update({changes});
        }
      }
      return null;
    }
    isRangeCommented(_state, lines) {
      let minCol = Infinity;
      let isRangeLineDiscarded = true;
      const isLineSkipped = [];
      for (const line of lines) {
        const str = line.slice(0, Math.min(line.length, SearchMargin));
        const col = /^\s*/.exec(str)[0].length;
        if ((lines.length == 1 || col < str.length) && col < minCol) {
          minCol = col;
        }
        if (isRangeLineDiscarded && (lines.length == 1 || col < str.length) && str.slice(col, col + this.lineCommentToken.length) != this.lineCommentToken) {
          isRangeLineDiscarded = false;
        }
        isLineSkipped[line.number] = col == str.length;
      }
      return {minCol, isRangeLineSkipped: isRangeLineDiscarded, isLineSkipped};
    }
  };
  function getLinesInRange(doc2, range) {
    let line = doc2.lineAt(range.from);
    const lines = [];
    while (line.from + line.length < range.to || line.from <= range.to && range.to <= line.to) {
      lines.push(line);
      if (line.number + 1 <= doc2.lines) {
        line = doc2.line(line.number + 1);
      } else {
        break;
      }
    }
    return lines;
  }

  // node_modules/@codemirror/next/rectangular-selection/dist/index.js
  var MaxOff = 2e3;
  function rectangleFor(state24, a, b) {
    let startLine = Math.min(a.line, b.line), endLine = Math.max(a.line, b.line);
    let ranges = [];
    if (a.off > MaxOff || b.off > MaxOff || a.col < 0 || b.col < 0) {
      let startOff = Math.min(a.off, b.off), endOff = Math.max(a.off, b.off);
      for (let i = startLine; i <= endLine; i++) {
        let line = state24.doc.line(i);
        if (line.length <= endOff)
          ranges.push(EditorSelection.range(line.from + startOff, line.to + endOff));
      }
    } else {
      let startCol = Math.min(a.col, b.col), endCol = Math.max(a.col, b.col);
      for (let i = startLine; i <= endLine; i++) {
        let line = state24.doc.line(i), str = line.length > MaxOff ? line.slice(0, 2 * endCol) : line.slice();
        let start = findColumn(str, 0, startCol, state24.tabSize), end = findColumn(str, 0, endCol, state24.tabSize);
        if (!start.leftOver)
          ranges.push(EditorSelection.range(line.from + start.offset, line.from + end.offset));
      }
    }
    return ranges;
  }
  function absoluteColumn(view22, x) {
    let ref = view22.coordsAtPos(view22.viewport.from);
    return ref ? Math.round(Math.abs((ref.left - x) / view22.defaultCharacterWidth)) : -1;
  }
  function getPos(view22, event) {
    let offset = view22.posAtCoords({x: event.clientX, y: event.clientY});
    if (offset == null)
      return null;
    let line = view22.state.doc.lineAt(offset), off = offset - line.from;
    let col = off > MaxOff ? -1 : off == line.length ? absoluteColumn(view22, event.clientX) : countColumn(line.slice(0, offset - line.from), 0, view22.state.tabSize);
    return {line: line.number, col, off};
  }
  function rectangleSelectionStyle(view22, event) {
    let start = getPos(view22, event), startSel = view22.state.selection;
    if (!start)
      return null;
    return {
      update(update) {
        if (update.docChanged) {
          let newStart = update.changes.mapPos(update.prevState.doc.line(start.line).from);
          let newLine = update.state.doc.lineAt(newStart);
          start = {line: newLine.number, col: start.col, off: Math.min(start.off, newLine.length)};
          startSel = startSel.map(update.changes);
        }
      },
      get(event2, _extend, multiple) {
        let cur2 = getPos(view22, event2);
        if (!cur2)
          return startSel;
        let ranges = rectangleFor(view22.state, start, cur2);
        if (!ranges.length)
          return startSel;
        if (multiple)
          return EditorSelection.create(ranges.concat(startSel.ranges));
        else
          return EditorSelection.create(ranges);
      }
    };
  }
  function rectangularSelection(eventFilter) {
    let filter = eventFilter || ((e) => e.altKey && e.button == 0);
    return EditorView.mouseSelectionStyle.of((view22, event) => filter(event) ? rectangleSelectionStyle(view22, event) : null);
  }

  // node_modules/@codemirror/next/goto-line/dist/index.js
  var extTag = typeof Symbol == "undefined" ? "__goto-line" : Symbol("goto-line");
  function createLineDialog(view22) {
    let dom6 = document.createElement("form");
    dom6.innerHTML = `<label>${view22.state.phrase("Go to line:")} <input class=${themeClass("textfield")} name=line></label>
<button class=${themeClass("button")} type=submit>${view22.state.phrase("go")}</button>`;
    let input = dom6.querySelector("input");
    function go() {
      let n = parseInt(input.value, 10);
      view22.dispatch({
        reconfigure: {[extTag]: [baseTheme9]},
        selection: !isNaN(n) && n > 0 && n <= view22.state.doc.lines ? EditorSelection.cursor(view22.state.doc.line(n).from) : void 0,
        scrollIntoView: true
      });
      view22.focus();
    }
    dom6.addEventListener("keydown", (event) => {
      if (event.keyCode == 27) {
        event.preventDefault();
        view22.dispatch({reconfigure: {append: [baseTheme9]}});
        view22.focus();
      } else if (event.keyCode == 13) {
        event.preventDefault();
        go();
      }
    });
    dom6.addEventListener("submit", go);
    return {dom: dom6, style: "gotoLine", pos: -10};
  }
  var gotoLine = (view22) => {
    let panel4 = getPanel(view22, createLineDialog);
    if (!panel4) {
      view22.dispatch({reconfigure: {append: [panels(), showPanel.of(createLineDialog), baseTheme9]}});
      panel4 = getPanel(view22, createLineDialog);
    }
    if (panel4)
      panel4.dom.querySelector("input").focus();
    return true;
  };
  var baseTheme9 = EditorView.baseTheme({
    "$panel.gotoLine": {
      padding: "2px 6px 4px",
      "& label": {fontSize: "80%"}
    }
  });
  var gotoLineKeymap = [
    {key: "Alt-g", run: gotoLine}
  ];

  // node_modules/@codemirror/next/highlight-selection/dist/index.js
  function highlightActiveLine() {
    return [defaultTheme, activeLineHighlighter];
  }
  var lineDeco = Decoration.line({attributes: {class: themeClass("activeLine")}});
  var activeLineHighlighter = ViewPlugin.fromClass(class {
    constructor(view22) {
      this.decorations = this.getDeco(view22);
    }
    update(update) {
      if (update.docChanged || update.selectionSet)
        this.decorations = this.getDeco(update.view);
    }
    getDeco(view22) {
      let lastLineStart = -1, deco = [];
      for (let r of view22.state.selection.ranges) {
        if (!r.empty)
          continue;
        let line = view22.visualLineAt(r.head);
        if (line.from > lastLineStart) {
          deco.push(lineDeco.range(line.from));
          lastLineStart = line.from;
        }
      }
      return Decoration.set(deco);
    }
  }, {
    decorations: (v) => v.decorations
  });
  var defaultHighlightOptions = {
    highlightWordAroundCursor: false,
    minSelectionLength: 1,
    maxMatches: 100
  };
  var highlightConfig = Facet.define({
    combine(options) {
      return combineConfig(options, defaultHighlightOptions, {
        highlightWordAroundCursor: (a, b) => a || b,
        minSelectionLength: Math.min,
        maxMatches: Math.min
      });
    }
  });
  function highlightSelectionMatches(options) {
    let ext = [defaultTheme, matchHighlighter];
    if (options)
      ext.push(highlightConfig.of(options));
    return ext;
  }
  function wordAt(doc2, pos, check) {
    let line = doc2.lineAt(pos);
    let from = pos - line.from, to = pos - line.from;
    while (from > 0) {
      let prev = line.findClusterBreak(from, false);
      if (check(line.slice(prev, from)) != CharCategory.Word)
        break;
      from = prev;
    }
    while (to < line.length) {
      let next = line.findClusterBreak(to, true);
      if (check(line.slice(to, next)) != CharCategory.Word)
        break;
      to = next;
    }
    return from == to ? null : line.slice(from, to);
  }
  var matchDeco = Decoration.mark({class: themeClass("selectionMatch")});
  var mainMatchDeco = Decoration.mark({class: themeClass("selectionMatch.main")});
  var matchHighlighter = ViewPlugin.fromClass(class {
    constructor(view22) {
      this.decorations = this.getDeco(view22);
    }
    update(update) {
      if (update.selectionSet || update.docChanged || update.viewportChanged)
        this.decorations = this.getDeco(update.view);
    }
    getDeco(view22) {
      let conf = view22.state.facet(highlightConfig);
      let {state: state24} = view22, sel = state24.selection;
      if (sel.ranges.length > 1)
        return Decoration.none;
      let range = sel.primary, query, check = null;
      if (range.empty) {
        if (!conf.highlightWordAroundCursor)
          return Decoration.none;
        check = state24.charCategorizer(range.head);
        query = wordAt(state24.doc, range.head, check);
        if (!query)
          return Decoration.none;
      } else {
        let len = range.to - range.from;
        if (len < conf.minSelectionLength || len > 200)
          return Decoration.none;
        query = state24.sliceDoc(range.from, range.to).trim();
        if (!query)
          return Decoration.none;
      }
      let deco = [];
      for (let part3 of view22.visibleRanges) {
        let cursor = new SearchCursor(state24.doc, query, part3.from, part3.to);
        while (!cursor.next().done) {
          let {from, to} = cursor.value;
          if (!check || (from == 0 || check(state24.sliceDoc(from - 1, from)) != CharCategory.Word) && (to == state24.doc.length || check(state24.sliceDoc(to, to + 1)) != CharCategory.Word)) {
            if (check && from <= range.from && to >= range.to)
              deco.push(mainMatchDeco.range(from, to));
            else if (from >= range.to || to <= range.from)
              deco.push(matchDeco.range(from, to));
            if (deco.length > conf.maxMatches)
              return Decoration.none;
          }
        }
      }
      return Decoration.set(deco);
    }
  }, {
    decorations: (v) => v.decorations
  });
  var defaultTheme = EditorView.baseTheme({
    "$$light $activeLine": {backgroundColor: "#f3f9ff"},
    "$$dark $activeLine": {backgroundColor: "#223039"},
    $selectionMatch: {backgroundColor: "#99ff7780"},
    "$searchMatch $selectionMatch": {backgroundColor: "transparent"}
  });

  // node_modules/@codemirror/next/lint/dist/index.js
  var SelectedDiagnostic = class {
    constructor(from, to, diagnostic) {
      this.from = from;
      this.to = to;
      this.diagnostic = diagnostic;
    }
  };
  var LintState = class {
    constructor(diagnostics, panel4, selected) {
      this.diagnostics = diagnostics;
      this.panel = panel4;
      this.selected = selected;
    }
  };
  function findDiagnostic(diagnostics, diagnostic = null, after = 0) {
    let found = null;
    diagnostics.between(after, diagnostics.length, (from, to, {spec}) => {
      if (diagnostic && spec.diagnostic != diagnostic)
        return;
      found = new SelectedDiagnostic(from, to, spec.diagnostic);
      return false;
    });
    return found;
  }
  function maybeEnableLint(state24) {
    return state24.field(lintState, false) ? void 0 : {append: [
      lintState,
      EditorView.decorations.compute([lintState], (state25) => {
        let {selected, panel: panel4} = state25.field(lintState);
        return !selected || !panel4 || selected.from == selected.to ? Decoration.none : Decoration.set([
          activeMark.range(selected.from, selected.to)
        ]);
      }),
      panels(),
      hoverTooltip(lintTooltip),
      baseTheme10
    ]};
  }
  var setDiagnosticsEffect = StateEffect.define();
  var togglePanel2 = StateEffect.define();
  var movePanelSelection = StateEffect.define();
  var lintState = StateField.define({
    create() {
      return new LintState(Decoration.none, null, null);
    },
    update(value, tr) {
      if (tr.docChanged) {
        let mapped = value.diagnostics.map(tr.changes), selected = null;
        if (value.selected) {
          let selPos = tr.changes.mapPos(value.selected.from, 1);
          selected = findDiagnostic(mapped, value.selected.diagnostic, selPos) || findDiagnostic(mapped, null, selPos);
        }
        value = new LintState(mapped, value.panel, selected);
      }
      for (let effect of tr.effects) {
        if (effect.is(setDiagnosticsEffect)) {
          let ranges = Decoration.set(effect.value.map((d) => {
            return d.from < d.to ? Decoration.mark({
              attributes: {class: themeClass("lintRange." + d.severity)},
              diagnostic: d
            }).range(d.from, d.to) : Decoration.widget({
              widget: new DiagnosticWidget(d),
              diagnostic: d
            }).range(d.from);
          }));
          value = new LintState(ranges, value.panel, findDiagnostic(ranges));
        } else if (effect.is(togglePanel2)) {
          value = new LintState(value.diagnostics, effect.value ? LintPanel.open : null, value.selected);
        } else if (effect.is(movePanelSelection)) {
          value = new LintState(value.diagnostics, value.panel, effect.value);
        }
      }
      return value;
    },
    provide: [
      showPanel.nFrom((s) => s.panel ? [s.panel] : []),
      EditorView.decorations.from((s) => s.diagnostics)
    ]
  });
  var activeMark = Decoration.mark({class: themeClass("lintRange.active")});
  function lintTooltip(view22, check) {
    let {diagnostics} = view22.state.field(lintState);
    let found = [], stackStart = 2e8, stackEnd = 0;
    diagnostics.between(0, view22.state.doc.length, (start, end, {spec}) => {
      if (check(start, end)) {
        found.push(spec.diagnostic);
        stackStart = Math.min(start, stackStart);
        stackEnd = Math.max(end, stackEnd);
      }
    });
    if (!found.length)
      return null;
    return {
      pos: stackStart,
      end: stackEnd,
      above: view22.state.doc.lineAt(stackStart).to < stackEnd,
      style: "lint",
      create() {
        let dom6 = document.createElement("ul");
        for (let d of found)
          dom6.appendChild(renderDiagnostic(view22, d));
        return {dom: dom6};
      }
    };
  }
  var openLintPanel = (view22) => {
    let field = view22.state.field(lintState, false);
    if (!field || !field.panel)
      view22.dispatch({
        effects: togglePanel2.of(true),
        reconfigure: maybeEnableLint(view22.state)
      });
    let panel4 = getPanel(view22, LintPanel.open);
    if (panel4)
      panel4.dom.querySelector(".cm-panel-lint ul").focus();
    return true;
  };
  var closeLintPanel = (view22) => {
    let field = view22.state.field(lintState, false);
    if (!field || !field.panel)
      return false;
    view22.dispatch({effects: togglePanel2.of(false)});
    return true;
  };
  var nextDiagnostic = (view22) => {
    let field = view22.state.field(lintState, false);
    if (!field)
      return false;
    let sel = view22.state.selection.primary, next = field.diagnostics.iter(sel.to + 1);
    if (!next.value) {
      next = field.diagnostics.iter(0);
      if (!next.value || next.from == sel.from && next.to == sel.to)
        return false;
    }
    view22.dispatch({selection: {anchor: next.from, head: next.to}, scrollIntoView: true});
    return true;
  };
  var lintKeymap = [
    {key: "Mod-Shift-m", run: openLintPanel},
    {key: "F8", run: nextDiagnostic}
  ];
  function renderDiagnostic(view22, diagnostic) {
    let dom6 = document.createElement("li");
    dom6.textContent = diagnostic.message;
    dom6.className = themeClass("diagnostic." + diagnostic.severity);
    if (diagnostic.actions)
      for (let action of diagnostic.actions) {
        let button = dom6.appendChild(document.createElement("button"));
        button.className = themeClass("diagnosticAction");
        button.textContent = action.name;
        button.onclick = button.onmousedown = (e) => {
          e.preventDefault();
          let found = findDiagnostic(view22.state.field(lintState).diagnostics, diagnostic);
          if (found)
            action.apply(view22, found.from, found.to);
        };
      }
    return dom6;
  }
  var DiagnosticWidget = class extends WidgetType {
    constructor(diagnostic) {
      super();
      this.diagnostic = diagnostic;
    }
    eq(other) {
      return other.diagnostic == this.diagnostic;
    }
    toDOM() {
      let elt2 = document.createElement("span");
      elt2.className = themeClass("lintPoint." + this.diagnostic.severity);
      return elt2;
    }
  };
  var PanelItem = class {
    constructor(view22, diagnostic) {
      this.diagnostic = diagnostic;
      this.id = "item_" + Math.floor(Math.random() * 4294967295).toString(16);
      this.dom = renderDiagnostic(view22, diagnostic);
      this.dom.setAttribute("role", "option");
    }
  };
  var LintPanel = class {
    constructor(view22) {
      this.view = view22;
      this.items = [];
      this.dom = document.createElement("div");
      this.list = this.dom.appendChild(document.createElement("ul"));
      this.list.tabIndex = 0;
      this.list.setAttribute("role", "listbox");
      this.list.setAttribute("aria-label", this.view.state.phrase("Diagnostics"));
      this.list.addEventListener("keydown", (event) => {
        if (event.keyCode == 27) {
          event.preventDefault();
          closeLintPanel(this.view);
          this.view.focus();
        } else if (event.keyCode == 38) {
          event.preventDefault();
          this.moveSelection((this.selectedIndex - 1 + this.items.length) % this.items.length);
        } else if (event.keyCode == 40) {
          event.preventDefault();
          this.moveSelection((this.selectedIndex + 1) % this.items.length);
        } else if (event.keyCode == 36) {
          event.preventDefault();
          this.moveSelection(0);
        } else if (event.keyCode == 35) {
          event.preventDefault();
          this.moveSelection(this.items.length - 1);
        } else if (event.keyCode == 13) {
          event.preventDefault();
          this.view.focus();
        }
      });
      this.list.addEventListener("click", (event) => {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].dom.contains(event.target))
            this.moveSelection(i);
        }
      });
      let close = this.dom.appendChild(document.createElement("button"));
      close.setAttribute("name", "close");
      close.setAttribute("aria-label", this.view.state.phrase("close"));
      close.textContent = "\xD7";
      close.addEventListener("click", () => closeLintPanel(this.view));
      this.update();
    }
    get selectedIndex() {
      let selected = this.view.state.field(lintState).selected;
      if (!selected)
        return -1;
      for (let i = 0; i < this.items.length; i++)
        if (this.items[i].diagnostic == selected.diagnostic)
          return i;
      return -1;
    }
    update() {
      let {diagnostics, selected} = this.view.state.field(lintState);
      let i = 0, needsSync = false, newSelectedItem = null;
      diagnostics.between(0, this.view.state.doc.length, (_start, _end, {spec}) => {
        let found = -1, item;
        for (let j = i; j < this.items.length; j++)
          if (this.items[j].diagnostic == spec.diagnostic) {
            found = j;
            break;
          }
        if (found < 0) {
          item = new PanelItem(this.view, spec.diagnostic);
          this.items.splice(i, 0, item);
          needsSync = true;
        } else {
          item = this.items[found];
          if (found > i) {
            this.items.splice(i, found - i);
            needsSync = true;
          }
        }
        if (selected && item.diagnostic == selected.diagnostic) {
          if (!item.dom.hasAttribute("aria-selected")) {
            item.dom.setAttribute("aria-selected", "true");
            newSelectedItem = item;
          }
        } else if (item.dom.hasAttribute("aria-selected")) {
          item.dom.removeAttribute("aria-selected");
        }
        i++;
      });
      while (i < this.items.length && !(this.items.length == 1 && this.items[0].diagnostic.from < 0)) {
        needsSync = true;
        this.items.pop();
      }
      if (this.items.length == 0) {
        this.items.push(new PanelItem(this.view, {
          from: -1,
          to: -1,
          severity: "info",
          message: this.view.state.phrase("No diagnostics")
        }));
        needsSync = true;
      }
      if (newSelectedItem) {
        this.list.setAttribute("aria-activedescendant", newSelectedItem.id);
        this.view.requestMeasure({
          key: this,
          read: () => ({sel: newSelectedItem.dom.getBoundingClientRect(), panel: this.list.getBoundingClientRect()}),
          write: ({sel, panel: panel4}) => {
            if (sel.top < panel4.top)
              this.list.scrollTop -= panel4.top - sel.top;
            else if (sel.bottom > panel4.bottom)
              this.list.scrollTop += sel.bottom - panel4.bottom;
          }
        });
      } else if (!this.items.length) {
        this.list.removeAttribute("aria-activedescendant");
      }
      if (needsSync)
        this.sync();
    }
    sync() {
      let domPos = this.list.firstChild;
      function rm3() {
        let prev = domPos;
        domPos = prev.nextSibling;
        prev.remove();
      }
      for (let item of this.items) {
        if (item.dom.parentNode == this.list) {
          while (domPos != item.dom)
            rm3();
          domPos = item.dom.nextSibling;
        } else {
          this.list.insertBefore(item.dom, domPos);
        }
      }
      while (domPos)
        rm3();
      if (!this.list.firstChild)
        this.list.appendChild(renderDiagnostic(this.view, {
          severity: "info",
          message: this.view.state.phrase("No diagnostics")
        }));
    }
    moveSelection(selectedIndex) {
      if (this.items.length == 0)
        return;
      let field = this.view.state.field(lintState);
      let selection = findDiagnostic(field.diagnostics, this.items[selectedIndex].diagnostic);
      if (!selection)
        return;
      this.view.dispatch({
        selection: {anchor: selection.from, head: selection.to},
        scrollIntoView: true,
        effects: movePanelSelection.of(selection)
      });
    }
    get style() {
      return "lint";
    }
    static open(view22) {
      return new LintPanel(view22);
    }
  };
  function underline(color) {
    if (typeof btoa != "function")
      return "none";
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="6" height="3">
    <path d="m0 3 l2 -2 l1 0 l2 2 l1 0" stroke="${color}" fill="none" stroke-width=".7"/>
  </svg>`;
    return `url('data:image/svg+xml;base64,${btoa(svg)}')`;
  }
  var baseTheme10 = EditorView.baseTheme({
    $diagnostic: {
      padding: "3px 6px 3px 8px",
      marginLeft: "-1px",
      display: "block"
    },
    "$diagnostic.error": {borderLeft: "5px solid #d11"},
    "$diagnostic.warning": {borderLeft: "5px solid orange"},
    "$diagnostic.info": {borderLeft: "5px solid #999"},
    $diagnosticAction: {
      font: "inherit",
      border: "none",
      padding: "2px 4px",
      backgroundColor: "#444",
      color: "white",
      borderRadius: "3px",
      marginLeft: "8px"
    },
    $lintRange: {
      backgroundPosition: "left bottom",
      backgroundRepeat: "repeat-x"
    },
    "$lintRange.error": {backgroundImage: underline("#d11")},
    "$lintRange.warning": {backgroundImage: underline("orange")},
    "$lintRange.info": {backgroundImage: underline("#999")},
    "$lintRange.active": {backgroundColor: "#ffdd9980"},
    $lintPoint: {
      position: "relative",
      "&:after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: "-2px",
        borderLeft: "3px solid transparent",
        borderRight: "3px solid transparent",
        borderBottom: "4px solid #d11"
      }
    },
    "$lintPoint.warning": {
      "&:after": {borderBottomColor: "orange"}
    },
    "$lintPoint.info": {
      "&:after": {borderBottomColor: "#999"}
    },
    "$panel.lint": {
      position: "relative",
      "& ul": {
        maxHeight: "100px",
        overflowY: "auto",
        "& [aria-selected]": {
          backgroundColor: "#ddd"
        },
        "&:focus [aria-selected]": {
          background_fallback: "#bdf",
          backgroundColor: "Highlight",
          color_fallback: "white",
          color: "HighlightText"
        },
        padding: 0,
        margin: 0
      },
      "& [name=close]": {
        position: "absolute",
        top: "0",
        right: "2px",
        background: "inherit",
        border: "none",
        font: "inherit",
        padding: 0,
        margin: 0
      }
    },
    "$tooltip.lint": {
      padding: 0,
      margin: 0
    }
  });

  // node_modules/@codemirror/next/basic-setup/dist/index.js
  var basicSetup = [
    lineNumbers(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    defaultHighlightStyle,
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...commentKeymap,
      ...gotoLineKeymap,
      ...completionKeymap,
      ...lintKeymap
    ])
  ];

  // node_modules/lit-html/lib/directive.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var directives = new WeakMap();
  var isDirective = (o) => {
    return typeof o === "function" && directives.has(o);
  };

  // node_modules/lit-html/lib/dom.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var isCEPolyfill = typeof window !== "undefined" && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== void 0;
  var removeNodes = (container, start, end = null) => {
    while (start !== end) {
      const n = start.nextSibling;
      container.removeChild(start);
      start = n;
    }
  };

  // node_modules/lit-html/lib/part.js
  /**
   * @license
   * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var noChange = {};
  var nothing = {};

  // node_modules/lit-html/lib/template.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var marker = `{{lit-${String(Math.random()).slice(2)}}}`;
  var nodeMarker = `<!--${marker}-->`;
  var markerRegex = new RegExp(`${marker}|${nodeMarker}`);
  var boundAttributeSuffix = "$lit$";
  var Template = class {
    constructor(result, element) {
      this.parts = [];
      this.element = element;
      const nodesToRemove = [];
      const stack = [];
      const walker = document.createTreeWalker(element.content, 133, null, false);
      let lastPartIndex = 0;
      let index2 = -1;
      let partIndex = 0;
      const {strings, values: {length}} = result;
      while (partIndex < length) {
        const node = walker.nextNode();
        if (node === null) {
          walker.currentNode = stack.pop();
          continue;
        }
        index2++;
        if (node.nodeType === 1) {
          if (node.hasAttributes()) {
            const attributes = node.attributes;
            const {length: length2} = attributes;
            let count = 0;
            for (let i = 0; i < length2; i++) {
              if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                count++;
              }
            }
            while (count-- > 0) {
              const stringForPart = strings[partIndex];
              const name2 = lastAttributeNameRegex.exec(stringForPart)[2];
              const attributeLookupName = name2.toLowerCase() + boundAttributeSuffix;
              const attributeValue = node.getAttribute(attributeLookupName);
              node.removeAttribute(attributeLookupName);
              const statics = attributeValue.split(markerRegex);
              this.parts.push({type: "attribute", index: index2, name: name2, strings: statics});
              partIndex += statics.length - 1;
            }
          }
          if (node.tagName === "TEMPLATE") {
            stack.push(node);
            walker.currentNode = node.content;
          }
        } else if (node.nodeType === 3) {
          const data = node.data;
          if (data.indexOf(marker) >= 0) {
            const parent = node.parentNode;
            const strings2 = data.split(markerRegex);
            const lastIndex = strings2.length - 1;
            for (let i = 0; i < lastIndex; i++) {
              let insert2;
              let s = strings2[i];
              if (s === "") {
                insert2 = createMarker();
              } else {
                const match = lastAttributeNameRegex.exec(s);
                if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                  s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                }
                insert2 = document.createTextNode(s);
              }
              parent.insertBefore(insert2, node);
              this.parts.push({type: "node", index: ++index2});
            }
            if (strings2[lastIndex] === "") {
              parent.insertBefore(createMarker(), node);
              nodesToRemove.push(node);
            } else {
              node.data = strings2[lastIndex];
            }
            partIndex += lastIndex;
          }
        } else if (node.nodeType === 8) {
          if (node.data === marker) {
            const parent = node.parentNode;
            if (node.previousSibling === null || index2 === lastPartIndex) {
              index2++;
              parent.insertBefore(createMarker(), node);
            }
            lastPartIndex = index2;
            this.parts.push({type: "node", index: index2});
            if (node.nextSibling === null) {
              node.data = "";
            } else {
              nodesToRemove.push(node);
              index2--;
            }
            partIndex++;
          } else {
            let i = -1;
            while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
              this.parts.push({type: "node", index: -1});
              partIndex++;
            }
          }
        }
      }
      for (const n of nodesToRemove) {
        n.parentNode.removeChild(n);
      }
    }
  };
  var endsWith = (str, suffix) => {
    const index2 = str.length - suffix.length;
    return index2 >= 0 && str.slice(index2) === suffix;
  };
  var isTemplatePartActive = (part3) => part3.index !== -1;
  var createMarker = () => document.createComment("");
  var lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

  // node_modules/lit-html/lib/template-instance.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var TemplateInstance = class {
    constructor(template6, processor, options) {
      this.__parts = [];
      this.template = template6;
      this.processor = processor;
      this.options = options;
    }
    update(values) {
      let i = 0;
      for (const part3 of this.__parts) {
        if (part3 !== void 0) {
          part3.setValue(values[i]);
        }
        i++;
      }
      for (const part3 of this.__parts) {
        if (part3 !== void 0) {
          part3.commit();
        }
      }
    }
    _clone() {
      const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
      const stack = [];
      const parts5 = this.template.parts;
      const walker = document.createTreeWalker(fragment, 133, null, false);
      let partIndex = 0;
      let nodeIndex = 0;
      let part3;
      let node = walker.nextNode();
      while (partIndex < parts5.length) {
        part3 = parts5[partIndex];
        if (!isTemplatePartActive(part3)) {
          this.__parts.push(void 0);
          partIndex++;
          continue;
        }
        while (nodeIndex < part3.index) {
          nodeIndex++;
          if (node.nodeName === "TEMPLATE") {
            stack.push(node);
            walker.currentNode = node.content;
          }
          if ((node = walker.nextNode()) === null) {
            walker.currentNode = stack.pop();
            node = walker.nextNode();
          }
        }
        if (part3.type === "node") {
          const part4 = this.processor.handleTextExpression(this.options);
          part4.insertAfterNode(node.previousSibling);
          this.__parts.push(part4);
        } else {
          this.__parts.push(...this.processor.handleAttributeExpressions(node, part3.name, part3.strings, this.options));
        }
        partIndex++;
      }
      if (isCEPolyfill) {
        document.adoptNode(fragment);
        customElements.upgrade(fragment);
      }
      return fragment;
    }
  };

  // node_modules/lit-html/lib/template-result.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var policy = window.trustedTypes && trustedTypes.createPolicy("lit-html", {createHTML: (s) => s});
  var commentMarker = ` ${marker} `;
  var TemplateResult = class {
    constructor(strings, values, type, processor) {
      this.strings = strings;
      this.values = values;
      this.type = type;
      this.processor = processor;
    }
    getHTML() {
      const l = this.strings.length - 1;
      let html2 = "";
      let isCommentBinding = false;
      for (let i = 0; i < l; i++) {
        const s = this.strings[i];
        const commentOpen = s.lastIndexOf("<!--");
        isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf("-->", commentOpen + 1) === -1;
        const attributeMatch = lastAttributeNameRegex.exec(s);
        if (attributeMatch === null) {
          html2 += s + (isCommentBinding ? commentMarker : nodeMarker);
        } else {
          html2 += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
        }
      }
      html2 += this.strings[l];
      return html2;
    }
    getTemplateElement() {
      const template6 = document.createElement("template");
      let value = this.getHTML();
      if (policy !== void 0) {
        value = policy.createHTML(value);
      }
      template6.innerHTML = value;
      return template6;
    }
  };

  // node_modules/lit-html/lib/parts.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var isPrimitive = (value) => {
    return value === null || !(typeof value === "object" || typeof value === "function");
  };
  var isIterable = (value) => {
    return Array.isArray(value) || !!(value && value[Symbol.iterator]);
  };
  var AttributeCommitter = class {
    constructor(element, name2, strings) {
      this.dirty = true;
      this.element = element;
      this.name = name2;
      this.strings = strings;
      this.parts = [];
      for (let i = 0; i < strings.length - 1; i++) {
        this.parts[i] = this._createPart();
      }
    }
    _createPart() {
      return new AttributePart(this);
    }
    _getValue() {
      const strings = this.strings;
      const l = strings.length - 1;
      const parts5 = this.parts;
      if (l === 1 && strings[0] === "" && strings[1] === "") {
        const v = parts5[0].value;
        if (typeof v === "symbol") {
          return String(v);
        }
        if (typeof v === "string" || !isIterable(v)) {
          return v;
        }
      }
      let text9 = "";
      for (let i = 0; i < l; i++) {
        text9 += strings[i];
        const part3 = parts5[i];
        if (part3 !== void 0) {
          const v = part3.value;
          if (isPrimitive(v) || !isIterable(v)) {
            text9 += typeof v === "string" ? v : String(v);
          } else {
            for (const t2 of v) {
              text9 += typeof t2 === "string" ? t2 : String(t2);
            }
          }
        }
      }
      text9 += strings[l];
      return text9;
    }
    commit() {
      if (this.dirty) {
        this.dirty = false;
        this.element.setAttribute(this.name, this._getValue());
      }
    }
  };
  var AttributePart = class {
    constructor(committer) {
      this.value = void 0;
      this.committer = committer;
    }
    setValue(value) {
      if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
        this.value = value;
        if (!isDirective(value)) {
          this.committer.dirty = true;
        }
      }
    }
    commit() {
      while (isDirective(this.value)) {
        const directive4 = this.value;
        this.value = noChange;
        directive4(this);
      }
      if (this.value === noChange) {
        return;
      }
      this.committer.commit();
    }
  };
  var NodePart = class {
    constructor(options) {
      this.value = void 0;
      this.__pendingValue = void 0;
      this.options = options;
    }
    appendInto(container) {
      this.startNode = container.appendChild(createMarker());
      this.endNode = container.appendChild(createMarker());
    }
    insertAfterNode(ref) {
      this.startNode = ref;
      this.endNode = ref.nextSibling;
    }
    appendIntoPart(part3) {
      part3.__insert(this.startNode = createMarker());
      part3.__insert(this.endNode = createMarker());
    }
    insertAfterPart(ref) {
      ref.__insert(this.startNode = createMarker());
      this.endNode = ref.endNode;
      ref.endNode = this.startNode;
    }
    setValue(value) {
      this.__pendingValue = value;
    }
    commit() {
      if (this.startNode.parentNode === null) {
        return;
      }
      while (isDirective(this.__pendingValue)) {
        const directive4 = this.__pendingValue;
        this.__pendingValue = noChange;
        directive4(this);
      }
      const value = this.__pendingValue;
      if (value === noChange) {
        return;
      }
      if (isPrimitive(value)) {
        if (value !== this.value) {
          this.__commitText(value);
        }
      } else if (value instanceof TemplateResult) {
        this.__commitTemplateResult(value);
      } else if (value instanceof Node) {
        this.__commitNode(value);
      } else if (isIterable(value)) {
        this.__commitIterable(value);
      } else if (value === nothing) {
        this.value = nothing;
        this.clear();
      } else {
        this.__commitText(value);
      }
    }
    __insert(node) {
      this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
      if (this.value === value) {
        return;
      }
      this.clear();
      this.__insert(value);
      this.value = value;
    }
    __commitText(value) {
      const node = this.startNode.nextSibling;
      value = value == null ? "" : value;
      const valueAsString = typeof value === "string" ? value : String(value);
      if (node === this.endNode.previousSibling && node.nodeType === 3) {
        node.data = valueAsString;
      } else {
        this.__commitNode(document.createTextNode(valueAsString));
      }
      this.value = value;
    }
    __commitTemplateResult(value) {
      const template6 = this.options.templateFactory(value);
      if (this.value instanceof TemplateInstance && this.value.template === template6) {
        this.value.update(value.values);
      } else {
        const instance = new TemplateInstance(template6, value.processor, this.options);
        const fragment = instance._clone();
        instance.update(value.values);
        this.__commitNode(fragment);
        this.value = instance;
      }
    }
    __commitIterable(value) {
      if (!Array.isArray(this.value)) {
        this.value = [];
        this.clear();
      }
      const itemParts = this.value;
      let partIndex = 0;
      let itemPart;
      for (const item of value) {
        itemPart = itemParts[partIndex];
        if (itemPart === void 0) {
          itemPart = new NodePart(this.options);
          itemParts.push(itemPart);
          if (partIndex === 0) {
            itemPart.appendIntoPart(this);
          } else {
            itemPart.insertAfterPart(itemParts[partIndex - 1]);
          }
        }
        itemPart.setValue(item);
        itemPart.commit();
        partIndex++;
      }
      if (partIndex < itemParts.length) {
        itemParts.length = partIndex;
        this.clear(itemPart && itemPart.endNode);
      }
    }
    clear(startNode = this.startNode) {
      removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
  };
  var BooleanAttributePart = class {
    constructor(element, name2, strings) {
      this.value = void 0;
      this.__pendingValue = void 0;
      if (strings.length !== 2 || strings[0] !== "" || strings[1] !== "") {
        throw new Error("Boolean attributes can only contain a single expression");
      }
      this.element = element;
      this.name = name2;
      this.strings = strings;
    }
    setValue(value) {
      this.__pendingValue = value;
    }
    commit() {
      while (isDirective(this.__pendingValue)) {
        const directive4 = this.__pendingValue;
        this.__pendingValue = noChange;
        directive4(this);
      }
      if (this.__pendingValue === noChange) {
        return;
      }
      const value = !!this.__pendingValue;
      if (this.value !== value) {
        if (value) {
          this.element.setAttribute(this.name, "");
        } else {
          this.element.removeAttribute(this.name);
        }
        this.value = value;
      }
      this.__pendingValue = noChange;
    }
  };
  var PropertyCommitter = class extends AttributeCommitter {
    constructor(element, name2, strings) {
      super(element, name2, strings);
      this.single = strings.length === 2 && strings[0] === "" && strings[1] === "";
    }
    _createPart() {
      return new PropertyPart(this);
    }
    _getValue() {
      if (this.single) {
        return this.parts[0].value;
      }
      return super._getValue();
    }
    commit() {
      if (this.dirty) {
        this.dirty = false;
        this.element[this.name] = this._getValue();
      }
    }
  };
  var PropertyPart = class extends AttributePart {
  };
  var eventOptionsSupported = false;
  (() => {
    try {
      const options = {
        get capture() {
          eventOptionsSupported = true;
          return false;
        }
      };
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (_e) {
    }
  })();
  var EventPart = class {
    constructor(element, eventName, eventContext) {
      this.value = void 0;
      this.__pendingValue = void 0;
      this.element = element;
      this.eventName = eventName;
      this.eventContext = eventContext;
      this.__boundHandleEvent = (e) => this.handleEvent(e);
    }
    setValue(value) {
      this.__pendingValue = value;
    }
    commit() {
      while (isDirective(this.__pendingValue)) {
        const directive4 = this.__pendingValue;
        this.__pendingValue = noChange;
        directive4(this);
      }
      if (this.__pendingValue === noChange) {
        return;
      }
      const newListener = this.__pendingValue;
      const oldListener = this.value;
      const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
      const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
      if (shouldRemoveListener) {
        this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
      }
      if (shouldAddListener) {
        this.__options = getOptions(newListener);
        this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
      }
      this.value = newListener;
      this.__pendingValue = noChange;
    }
    handleEvent(event) {
      if (typeof this.value === "function") {
        this.value.call(this.eventContext || this.element, event);
      } else {
        this.value.handleEvent(event);
      }
    }
  };
  var getOptions = (o) => o && (eventOptionsSupported ? {capture: o.capture, passive: o.passive, once: o.once} : o.capture);

  // node_modules/lit-html/lib/default-template-processor.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var DefaultTemplateProcessor = class {
    handleAttributeExpressions(element, name2, strings, options) {
      const prefix = name2[0];
      if (prefix === ".") {
        const committer2 = new PropertyCommitter(element, name2.slice(1), strings);
        return committer2.parts;
      }
      if (prefix === "@") {
        return [new EventPart(element, name2.slice(1), options.eventContext)];
      }
      if (prefix === "?") {
        return [new BooleanAttributePart(element, name2.slice(1), strings)];
      }
      const committer = new AttributeCommitter(element, name2, strings);
      return committer.parts;
    }
    handleTextExpression(options) {
      return new NodePart(options);
    }
  };
  var defaultTemplateProcessor = new DefaultTemplateProcessor();

  // node_modules/lit-html/lib/template-factory.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === void 0) {
      templateCache = {
        stringsArray: new WeakMap(),
        keyString: new Map()
      };
      templateCaches.set(result.type, templateCache);
    }
    let template6 = templateCache.stringsArray.get(result.strings);
    if (template6 !== void 0) {
      return template6;
    }
    const key = result.strings.join(marker);
    template6 = templateCache.keyString.get(key);
    if (template6 === void 0) {
      template6 = new Template(result, result.getTemplateElement());
      templateCache.keyString.set(key, template6);
    }
    templateCache.stringsArray.set(result.strings, template6);
    return template6;
  }
  var templateCaches = new Map();

  // node_modules/lit-html/lib/render.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  var parts3 = new WeakMap();
  var render = (result, container, options) => {
    let part3 = parts3.get(container);
    if (part3 === void 0) {
      removeNodes(container, container.firstChild);
      parts3.set(container, part3 = new NodePart(Object.assign({templateFactory}, options)));
      part3.appendInto(container);
    }
    part3.setValue(result);
    part3.commit();
  };

  // node_modules/lit-html/lit-html.js
  /**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */
  if (typeof window !== "undefined") {
    (window["litHtmlVersions"] || (window["litHtmlVersions"] = [])).push("1.3.0");
  }
  var html = (strings, ...values) => new TemplateResult(strings, values, "html", defaultTemplateProcessor);

  // apply_chunk.mjs
  var TemplateGutterMarker = class extends GutterMarker {
    constructor(template6) {
      super();
      this._template = template6;
    }
    eq(other) {
      return this === other;
    }
    toDOM(view22) {
      let div = document.createElement("DIV");
      render(this._template, div);
      console.assert(div.firstElementChild === div.lastElementChild);
      return div.firstElementChild;
    }
  };
  var revertMarker = function revertMarker2(view22, chunk, applyChunk) {
    return new TemplateGutterMarker(html`<button aria-label="revert" @click=${applyChunk}>✗</button>`);
  };
  function applyChunkGutter(changeSetField, applyChunkMarker) {
    let lastView = null;
    return [
      changeSetField,
      ViewPlugin.define((view22) => {
        lastView = view22;
        return true;
      }),
      gutter({
        markers(state24) {
          let ranges = [];
          let doc2 = state24.doc;
          let changeSet = state24.field(changeSetField.field);
          let gutters2 = [];
          changeSet.iterChanges((fromA, toA, fromB, toB, inserted) => {
            let line = doc2.lineAt(fromA);
            if (fromA === line.to && fromA + 1 <= doc2.length && (inserted.length === 0 || inserted.sliceString(0, 1) === "\n")) {
              line = doc2.lineAt(fromA + 1);
            }
            let g;
            if (gutters2.length > 0 && gutters2[gutters2.length - 1].from === line.from) {
              g = gutters2[gutters2.length - 1];
            } else {
              g = {from: line.from, changeSpec: []};
              gutters2.push(g);
            }
            g.changeSpec.push({
              from: fromA,
              to: toA,
              insert: inserted
            });
          });
          for (let {from, changeSpec} of gutters2) {
            let changeSet2 = ChangeSet.of(changeSpec, doc2.length);
            ranges.push({
              from,
              to: from,
              value: applyChunkMarker(lastView, changeSet2, function acceptChunk() {
                if (lastView === null)
                  return;
                lastView.dispatch({changes: changeSet2});
              })
            });
          }
          return RangeSet.of(ranges, false);
        }
      })
    ];
  }

  // changeset_field.mjs
  var diff = __toModule(require_diff());
  var diff_match_patch = __toModule(require_diff_match_patch());
  function diffToChangeSet(diff2) {
    let oldOffset = 0;
    let newOffset = 0;
    let changes = [];
    for (let {value, added, removed} of diff2) {
      if (added) {
        changes.push({
          from: oldOffset,
          to: oldOffset,
          insert: value
        });
        newOffset += value.length;
      } else if (removed) {
        changes.push({
          from: oldOffset,
          to: oldOffset + value.length,
          insert: ""
        });
        oldOffset += value.length;
      } else {
        oldOffset += value.length;
        newOffset += value.length;
      }
    }
    return ChangeSet.of(changes, oldOffset);
  }
  function diffSemantic(src, dst) {
    let d = new diff_match_patch.diff_match_patch();
    let diffs = d.diff_main(src, dst);
    d.diff_cleanupSemantic(diffs);
    return diffToChangeSet(diffs.map(([type, value]) => ({value, added: type === 1, removed: type === -1})));
  }
  var diffDefault = diffSemantic;
  var ChangeSetField = class {
    constructor(getDefault) {
      let set = StateEffect.define();
      this.set = set;
      this.field = StateField.define({
        create(state24) {
          return getDefault(state24);
        },
        update(value, tr) {
          value = value.map(tr.changes, true);
          for (let effect of tr.effects) {
            if (effect.is(set)) {
              value = effect.value;
            }
          }
          return value;
        }
      });
      this.extension = this.field;
      this.acceptAll = this._acceptAll.bind(this);
    }
    _acceptAll(target) {
      target.dispatch({changes: target.field(this.field)});
      return true;
    }
    setChangeSetEffect(changeSet) {
      return this.set.of(changeSet);
    }
    setNewTextEffect(state24, target, diff2 = diffDefault) {
      let changeSet = diff2(target, state24.doc.toString());
      return this.setChangeSetEffect(changeSet);
    }
    static syncTargetExtension(srcView, diff2 = diffDefault) {
      let srcState = srcView.state;
      let lastDstView = null;
      let updateDstView = function updateDstView2(dstView, dstState) {
        let changeSet = diff2(dstState.doc.toString(), srcState.doc.toString());
        dstView.dispatch({effects: csf.setChangeSetEffect(changeSet)});
      };
      srcView.dispatch({
        reconfigure: {
          append: EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              srcState = update.state;
              if (lastDstView !== null) {
                updateDstView(lastDstView, lastDstView.state);
              }
            }
          })
        }
      });
      let csf = new ChangeSetField((dstState) => {
        return diff2(dstState.doc.toString(), srcState.doc.toString());
      });
      return {
        changeSetField: csf,
        extension: [
          csf,
          ViewPlugin.define((dstView) => {
            lastDstView = dstView;
            return true;
          }),
          EditorView.updateListener.of((update) => {
            lastDstView = update.view;
            if (update.docChanged) {
              updateDstView(update.view, update.state);
            }
          })
        ]
      };
    }
    static withString(string2, diff2 = diffDefault) {
      let updateDstView = function updateDstView2(dstView, dstState) {
        let changeSet = diff2(dstState.doc.toString(), string2);
        dstView.dispatch({effects: csf.setChangeSetEffect(changeSet)});
      };
      let csf = new ChangeSetField((dstState) => {
        return diff2(dstState.doc.toString(), string2);
      });
      return {
        changeSetField: csf,
        extension: [
          csf,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              updateDstView(update.view, update.state);
            }
          })
        ]
      };
    }
    static withDefault(value) {
      return new ChangeSetField((_) => value);
    }
  };

  // decorations.mjs
  var TemplateWidget = class extends WidgetType {
    constructor(template6) {
      super(template6);
      this._template = template6;
    }
    toDOM(view22) {
      let div = document.createElement("DIV");
      render(this._template, div);
      console.assert(div.firstElementChild === div.lastElementChild);
      return div.firstElementChild;
    }
  };
  var ChangeSetDecorations = class {
    constructor(view22, widgets, changeSetField) {
      this.widgets = widgets;
      this.changeSetField = changeSetField;
      this.decorations = this._getDecorations(view22);
    }
    _getDecorations(view22) {
      let changeSet = view22.state.field(this.changeSetField.field);
      let text9 = view22.state.doc.toString();
      let ranges = [];
      changeSet.iterGaps((posA, posB, length) => {
        let widget = this.widgets.unchanged(text9.substring(posA, posA + length));
        if (widget !== null) {
          ranges.push({
            from: posA,
            to: posA + length,
            value: widget
          });
        }
      });
      changeSet.iterChanges((fromA, toA, fromB, toB, inserted) => {
        if (fromA < toA) {
          let widget = this.widgets.delete(text9.substring(fromA, toA));
          if (widget !== null) {
            ranges.push({
              from: fromA,
              to: toA,
              value: widget
            });
          }
        }
        if (fromB < toB) {
          let widget = this.widgets.insert(inserted);
          if (widget !== null) {
            ranges.push({
              from: toA,
              to: toA,
              value: widget
            });
          }
        }
      });
      return RangeSet.of(ranges, true);
    }
    update(update) {
      if (update.viewportChanged || update.docChanged || update.state.field(this.changeSetField.field) !== update.prevState.field(this.changeSetField.field)) {
        this.decorations = this._getDecorations(update.view);
      }
    }
    static makeExtension(widgets, changeSetField) {
      return ViewPlugin.define((view22) => new ChangeSetDecorations(view22, widgets, changeSetField), {
        decorations: (v) => v.decorations
      });
    }
  };
  var defaultStyle = EditorView.styleModule.of(new StyleModule({
    ".insert": {
      "background-color": "rgba(0, 255, 0, 0.5)"
    },
    ".delete": {
      "text-decoration": "line-through",
      "background-color": "rgba(255, 0, 0, 0.5)"
    }
  }));
  function futureOrPastExtension(changeSetField, future) {
    let unchanged = Decoration.mark({class: "unchanged"});
    let delete_ = Decoration.mark({class: future ? "delete" : "insert"});
    return [
      ChangeSetDecorations.makeExtension({
        insert(inserted) {
          return Decoration.widget({
            widget: new TemplateWidget(html`<span class=${future ? "insert" : "delete"} aria-hidden="true">${inserted.toString()}</span>`),
            side: 1,
            block: false
          });
        },
        delete() {
          return delete_;
        },
        unchanged() {
          return unchanged;
        }
      }, changeSetField),
      defaultStyle,
      changeSetField
    ];
  }
  function futureExtension(changeSetField) {
    return futureOrPastExtension(changeSetField, true);
  }
  function pastExtension(changeSetField) {
    return futureOrPastExtension(changeSetField, false);
  }

  // fold_gaps.mjs
  function foldGaps(changeSetField, margin = 3) {
    let gapsWithMargins = new WeakMap();
    return [
      changeSetField,
      foldService.of(function(state24, lineStart, lineEnd) {
        let changeSet = state24.field(changeSetField.field);
        let doc2 = state24.doc;
        let gapsByDoc = gapsWithMargins.get(changeSet);
        if (gapsByDoc === void 0) {
          gapsByDoc = new WeakMap();
          gapsWithMargins.set(changeSet, gapsByDoc);
        }
        let gaps = gapsByDoc.get(doc2);
        if (gaps === void 0) {
          let ranges = [];
          changeSet.iterGaps((posA, posB, length) => {
            let firstEmptyLine = doc2.lineAt(posA);
            if (posA > firstEmptyLine.from) {
              if (firstEmptyLine.to === doc2.length)
                return;
              firstEmptyLine = doc2.lineAt(firstEmptyLine.to + 1);
            }
            let lastEmptyLine = doc2.lineAt(posA + length);
            if (posA + length < lastEmptyLine.to) {
              if (lastEmptyLine.from === 0)
                return;
              lastEmptyLine = doc2.lineAt(lastEmptyLine.from - 1);
            }
            if (firstEmptyLine.from > 0) {
              for (let i = 0; i < margin; ++i) {
                if (firstEmptyLine.to === doc2.length)
                  return;
                firstEmptyLine = doc2.lineAt(firstEmptyLine.to + 1);
              }
            }
            if (lastEmptyLine.to < doc2.length) {
              for (let i = 0; i < margin; ++i) {
                if (lastEmptyLine.from === 0)
                  return;
                lastEmptyLine = doc2.lineAt(lastEmptyLine.from - 1);
              }
            }
            if (firstEmptyLine.from >= lastEmptyLine.from)
              return;
            ranges.push({
              from: firstEmptyLine.from,
              to: lastEmptyLine.to,
              value: true
            });
          });
          gaps = RangeSet.of(ranges, false);
          gapsByDoc.set(doc2, gaps);
        }
        for (let it = gaps.iter(lineStart); it.value !== null && it.from <= lineEnd; it.next()) {
          if (lineStart <= it.from) {
            return {from: it.from, to: it.to};
          }
        }
        return null;
      })
    ];
  }

  // basic_setup.mjs
  function makeExtension(changeSetField, extension, options, future) {
    let foldMargin = options.foldMargin;
    return [
      extension,
      (future ? futureExtension : pastExtension)(changeSetField),
      applyChunkGutter(changeSetField, revertMarker),
      foldGaps(changeSetField, foldMargin)
    ];
  }
  function revertView(pastView, options = {}) {
    let {changeSetField, extension} = ChangeSetField.syncTargetExtension(pastView);
    return makeExtension(changeSetField, extension, options, false);
  }
  function acceptView(futureView, options = {}) {
    let {changeSetField, extension} = ChangeSetField.syncTargetExtension(futureView);
    return makeExtension(changeSetField, extension, options, true);
  }
  function revertString(pastString, options = {}) {
    let {changeSetField, extension} = ChangeSetField.withString(pastString);
    return makeExtension(changeSetField, extension, options, false);
  }
  function acceptString(futureString, options = {}) {
    let {changeSetField, extension} = ChangeSetField.withString(futureString);
    return makeExtension(changeSetField, extension, options, true);
  }

  // demo.mjs
  function makeEditors(live2) {
    let center = new EditorView({
      state: EditorState.create({
        doc: `CodeMirror 6's merge addon displays diffs.
Features and limitations:
+ mobile-first
+ unified diff`,
        extensions: [
          basicSetup
        ]
      })
    });
    let left = new EditorView({
      state: EditorState.create({
        doc: `CodeMirror 5's merge addon displays diffs.
Features and limitations:
+ 2-way and 3-way diffs
- only left or center pane is editable
+ unlocked scrolling
+ 2-way only: optionally align changed sections
+ 2-way only: optionally collapse unchanged lines`,
        extensions: [
          basicSetup,
          live2 ? acceptView(center, {foldMargin: 1}) : acceptString(center.state.doc.toString(), {foldMargin: 1})
        ]
      })
    });
    foldAll(left);
    let right = new EditorView({
      state: EditorState.create({
        doc: `CodeMirror 6's merge addon displays diffs.
Features and limitations:
+ mobile-first
+ unified diff
+ collapse unchanged lines`,
        extensions: [
          basicSetup,
          live2 ? revertView(center, {foldMargin: 1}) : revertString(center.state.doc.toString(), {foldMargin: 1})
        ]
      })
    });
    foldAll(right);
    return {left, center, right};
  }
  var live = makeEditors(true);
  var static_ = makeEditors(false);
  render(html`
  <style>
    .container {
      display: flex;
    }
    .container > div > .cm-wrap {
      height: 100%;
    }
    .side {
      flex-basis: 0;
      flex-grow: 1;
      min-width: 0;
    }
    .merge {
      background-color: #eee;
    }
  </style>
  Live source:
  <div class="container">
    <div class="side">${live.left.dom}</div>
    <div class="side">${live.center.dom}</div>
    <div class="side">${live.right.dom}</div>
  </div>
  Static source:
  <div class="container">
    <div class="side">${static_.left.dom}</div>
    <div class="side">${static_.center.dom}</div>
    <div class="side">${static_.right.dom}</div>
  </div>
`, document.body);
})();

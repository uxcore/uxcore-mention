# uxcore-mention

React mention.
Mention anywhere.

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Dependency Status][dep-image]][dep-url]
[![devDependency Status][devdep-image]][devdep-url] 
[![NPM downloads][downloads-image]][npm-url]

[![Sauce Test Status][sauce-image]][sauce-url]

[npm-image]: http://img.shields.io/npm/v/uxcore-mention.svg?style=flat-square
[npm-url]: http://npmjs.org/package/uxcore-mention
[travis-image]: https://img.shields.io/travis/uxcore/uxcore-mention.svg?style=flat-square
[travis-url]: https://travis-ci.org/uxcore/uxcore-mention
[coveralls-image]: https://img.shields.io/coveralls/uxcore/uxcore-mention.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/uxcore/uxcore-mention?branch=master
[dep-image]: http://img.shields.io/david/uxcore/uxcore-mention.svg?style=flat-square
[dep-url]: https://david-dm.org/uxcore/uxcore-mention
[devdep-image]: http://img.shields.io/david/dev/uxcore/uxcore-mention.svg?style=flat-square
[devdep-url]: https://david-dm.org/uxcore/uxcore-mention#info=devDependencies
[downloads-image]: https://img.shields.io/npm/dm/uxcore-mention.svg
[sauce-image]: https://saucelabs.com/browser-matrix/uxcore-mention.svg
[sauce-url]: https://saucelabs.com/u/uxcore-mention


### Development

```sh
git clone https://github.com/uxcore/uxcore-mention
cd uxcore-mention
npm install
npm run server
```

if you'd like to save your install time，you can use uxcore-tools globally.

```sh
npm install uxcore-tools -g
git clone https://github.com/uxcore/uxcore-mention
cd uxcore-mention
npm install
npm run dep
npm run start
```

### Test Case

```sh
npm run test
```

### Coverage

```sh
npm run coverage
```

## Demo

http://uxcore.github.io/components/mention

> If you are running this demo in some old browsers that do not support `getSelection()`, you may need to include [rangy](https://www.npmjs.com/package/rangy) in your page.

#### work width all kinds of editor

```js
import ReactDOM from 'react-dom';
import Tinymce from 'uxcore-tinymce';
import Mention, { ContenteditableEditor, TextareaEditor, InputEditor } from 'uxcore-mention';

ReactDOM.render(
  <div>
    <Mention
        source={source}
        formatter={formatter}>
        <ContenteditableEditor
          width={250}
          height={150}
          placeholder="contenteditable editor placeholder" />
        <TextareaEditor
          width={250}
          height={100}
          placeholder="textarea editor placeholder" />
        <InputEditor
          placeholder="input editor placeholder" />
    </Mention>
  </div>
  ,targetNode);
```


#### work with tinymce

```js
import ReactDOM from 'react-dom';
import Tinymce from 'uxcore-tinymce';
import Mention, { TinymceMention } from 'uxcore-mention';

ReactDOM.render(
  <div>
    <TinymceMention
          insertMode={'TEXT_NODE'}
          source={getData}
          formatter={dataFormatter}
          mentionFormatter={mentionFormatter}
          panelFormatter={panelFormatter}>
          <Tinymce
              placeholder={'tinymce placeholder'} />
      </TinymceMention>
  </div>
  ,targetNode);
```


## Contribute

Yes please! See the [CONTRIBUTING](https://github.com/uxcore/uxcore/blob/master/CONTRIBUTING.md) for details.

### API

#### Mention

* formatter(arr): format the data form source.
* panelFormatter(obj): customize the panel display.
* onChange(e, value): onChange事件。

#### TinymceMention

* formatter(arr): format the data form source.
* panelFormatter(obj): customize the panel display.
* mentionFormatter(obj): customize the insert content with this function.
* onChange(e, value): Callback invoked when the editor's content has been changed.
* onAdd(display, originData): Callback invoked when a mention has been added.

#### ContentEditableEditor

* mentionFormatter(obj): customize the insert content with this function.
* onChange(e, value): Callback invoked when the editor's content has been changed.
* onAdd(display, originData): Callback invoked when a mention has been added.
* getMentions(): get all current mentions(will automatically remove duplicate items).

#### TextareaEditor

* mentionFormatter(obj): customize the insert content with this function.
* onChange(e, value): Callback invoked when the editor's content has been changed.
* onAdd(display, originData): Callback invoked when a mention has been added.
* getMentions(): get all current mentions(will automatically remove duplicate items).

#### InputEditor

* mentionFormatter(obj): customize the insert content with this function.
* onChange(e, value): Callback invoked when the editor's content has been changed.
* onAdd(display, originData): Callback invoked when a mention has been added.
* getMentions(): get all current mentions(will automatically remove duplicate items).


### props

#### Mention

|name|Description|Type|Default|
|---|----|---|------|
| prefixCls | class prefix | string | kuma-mention |
| source | data source for mention content | array or function | [] |
| delay | debounce of the request to data source | number | 100 |
| matchRange | only match the string after delimiter which the length in this range | array | [2, 8] |
| formatter | format the data form source | function | |
| panelFormatter | customize the panel display | function | |
| onChange | trigger when editor content change | function(e, value) | |

#### TinymceMention

|name|Description|Type|Default|
|---|----|---|------|
| prefixCls | class prefix | string | kuma-mention |
| source | data source for mention content | array or function | [] |
| delay | debounce of the request to data source | number | 100 |
| matchRange | only match the string after delimiter which the length in this range | array | [2, 8] |
| formatter | format the data form source | function | |
| panelFormatter | customize the panel display | function | |
| mentionFormatter | customize the insert content with this function | function | |
| onChange | trigger when editor content change | function(e, value) | |
| onAdd | Callback invoked when a mention has been added | function(display, originData) | |
| insertMode | `ELEMENT_NODE` will insert mention content with a button, `TEXT_NODE` will insert with a text node | string | `ELEMENT_NODE` or `TEXT_NODE` |


#### ContentEditableEditor

|name|Description|Type|Default|
|---|----|---|------|
| prefixCls | class prefix | string | kuma-mention |
| width | editor's width | number | 200 |
| height | editor's height | number | 100 |
| placeholder | placeholder | string | '' |
| mentionFormatter | customize the insert content with this function | function | |
| onChange | Callback invoked when the editor's content has been changed | function(e, value) | |
| onAdd | Callback invoked when a mention has been added | function(display, originData) | |
| defaultValue | default values | string | |
| readOnly | can not edit | boolean | |
| delimiter | Defines the char sequence upon which to trigger querying the data source | string | '@' |
| maxLength | Define the char input limiation | number | |


#### TextareaEditor

|name|Description|Type|Default|
|---|----|---|------|
| prefixCls | class prefix | string | kuma-mention |
| width | editor's width | number | 200 |
| height | editor's height | number | 100 |
| placeholder | placeholder | string | '' |
| mentionFormatter | customize the insert content with this function | function | |
| onChange | Callback invoked when the editor's content has been changed | function(e, value) | |
| onAdd | Callback invoked when a mention has been added | function(display, originData) | |
| defaultValue | default values | string | |
| readOnly | can not edit | boolean | |
| delimiter | Defines the char sequence upon which to trigger querying the data source | string | '@' |
| maxLength | Define the char input limiation | number | |


#### InputEditor

|name|Description|Type|Default|
|---|----|---|------|
| prefixCls | class prefix | string | kuma-mention |
| width | editor's width | number | 200 |
| height | editor's height | number | 30 |
| placeholder | placeholder | string | '' |
| mentionFormatter | customize the insert content with this function | function | |
| onChange | Callback invoked when the editor's content has been changed | function(e, value) | |
| onAdd | Callback invoked when a mention has been added | function(display, originData) | |
| defaultValue | default values | string | |
| readOnly | can not edit | boolean | |
| delimiter | Defines the char sequence upon which to trigger querying the data source | string | '@' |
| maxLength | Define the char input limiation | number | |


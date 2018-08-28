import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
export default class Panel extends Component {
  static displayName = 'uxcore-mention-panel';
  static propTypes = {
    prefixCls: PropTypes.string,
    list: PropTypes.array,
    style: PropTypes.object,
    idx: PropTypes.number,
    onSelect: PropTypes.func,
    formatter: PropTypes.func,
  };
  static defaultProps = {
    prefixCls: '',
    list: [],
    style: {},
    idx: 0,
    onSelect: null,
    formatter: '',
  };

  render() {
    const props = this.props;
    const { onSelect, list, style, visible, idx, formatter, prefixCls } = props;
    return (
      <ul
        className={classNames(`${prefixCls}-panel`, {
          [`${prefixCls}-panel-visible`]: visible,
        })} style={style}
      >
        {
          list.map((item, index) => (
            <li
              className={classNames(`${prefixCls}-panel-item`, {
                [`${prefixCls}-panel-item-current`]: idx === index,
              })} key={index} onClick={onSelect.bind(this, item)}
            >
              <div dangerouslySetInnerHTML={{ __html: formatter(item) }} />
            </li>
          ))
        }
      </ul>
    );
  }
}

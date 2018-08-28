/**
 * @author: vincent.bian
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Panel from './Panel';
import BaseMention from './mentionMixin';

/**
 * Mention Component
 */
class Mention extends BaseMention {
  static displayName = 'Mention';
  static propTypes = {
    /**
     * @i18n {zh-CN} class前缀
     * @i18n {en-US} class prefix
     */
    prefixCls: PropTypes.string,
    /**
     * @i18n {zh-CN} 定义数据源
     * @i18n {en-US} data source for mention content
     */
    source: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.func,
    ]),
    /**
     * @i18n {zh-CN} 数据源查询延时
     * @i18n {en-US} debounce of the request to data source
     */
    delay: PropTypes.number,
    /**
     * @i18n {zh-CN} 匹配字符区间
     * @i18n {en-US} only match the string after delimiter which the length in this range
     */
    matchRange: PropTypes.arrayOf(PropTypes.number),
    /**
     * @i18n {zh-CN} 数据源格式化匹配
     * @i18n {en-US} format the data form source
     */
    formatter: PropTypes.func,
    /**
     * @i18n {zh-CN} 自定义选择列表
     * @i18n {en-US} customize the panel display
     */
    panelFormatter: PropTypes.func,
    /**
     * @i18n {zh-CN} 发生变化后的触发
     * @i18n {en-US} trigger when editor content change
     */
    onChange: PropTypes.func,
    children: PropTypes.any,
  };
  static defaultProps = {
    prefixCls: 'kuma-mention',
    source: [],
    delay: 100,
    matchRange: [2, 8],
    formatter: data => data,
    panelFormatter: data => `${data.text}`,
    onChange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      mentionList: [],
      cursorPosition: {
        x: 0,
        y: 0,
      },
      panelVisible: false,
      panelIdx: 0,
    };
  }
  componentDidMount() {
    this.activeEditor = null;
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.mentionList.length !== this.state.mentionList.length) {
      this.setState({
        panelVisible: this.state.mentionList.length > 0,
      });
    }
    if (!prevState.panelVisible && this.state.panelVisible) {
      this.setState({
        panelIdx: 0,
      });
    }
  }
  /**
   * description of onfocus
   * @i18n {zh-CN} 测试api文档
   * @i18n {en-US} test api doc
   */
  onFocus(editorInstance) {
    this.activeEditor = editorInstance;
  }
  /**
   * description of setPanelPos
   */
  setPanelPos(pos) {
    const position = {
      x: pos.x,
      y: pos.y,
    };
    this.setState({
      cursorPosition: position,
    });
  }
  selectItem(data) {
    this.setState({
      mentionList: [],
    });
    this.activeEditor.insertMentionData(data);
  }

  render() {
    const panelPosition = {
      left: this.state.cursorPosition.x || 0,
      top: this.state.cursorPosition.y || 0,
    };
    const { prefixCls, onChange, children, panelFormatter, matchRange } = this.props;
    return (
      <div onKeyUp={this.onPanelKeyup.bind(this)}>
        {
          React.Children.map(children, Comp =>
            React.cloneElement(Comp, {
              prefixCls,
              panelVisible: this.state.panelVisible,
              matcher: this.runMatcher.bind(this),
              setCursorPos: this.setPanelPos.bind(this),
              onChange,
              onFocus: this.onFocus.bind(this),
              matchRange,
            }),
          )
        }
        <Panel
          prefixCls={prefixCls}
          visible={this.state.panelVisible}
          idx={this.state.panelIdx}
          list={this.state.mentionList}
          onSelect={this.selectItem.bind(this)}
          formatter={panelFormatter}
          style={panelPosition}
        />
      </div>
    );
  }
}

export default Mention;

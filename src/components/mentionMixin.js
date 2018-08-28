import { Component } from 'react';
import { KEYCODE } from '../utils/keycode';

export default class BaseMention extends Component {
  onPanelKeyup(e) {
    const { panelVisible, panelIdx, mentionList } = this.state;
    if (panelVisible) {
      const count = mentionList.length;
      switch (e.keyCode) {
        case KEYCODE.UP:
          this.setState({
            panelIdx: panelIdx === 0 ? count - 1 : panelIdx - 1,
          });
          break;
        case KEYCODE.DOWN:
          this.setState({
            panelIdx: panelIdx === count - 1 ? 0 : panelIdx + 1,
          });
          break;
        case KEYCODE.ENTER:
          this.selectItem(mentionList[panelIdx]);
          break;
        default:
          this.setState({
            mentionList: [],
          });
          break;
      }
    }
  }
  runMatcher(str) {
    if (this.__matchTimer) {
      clearTimeout(this.__matchTimer);
    }
    this.__matchTimer = setTimeout(() => {
      this._matcher(str);
    }, this.props.delay);
  }
  _matcher(str) {
    const { source, matchRange } = this.props;
    this.setState({
      panelVisible: false,
      mentionList: [],
    });
    if (str.length >= matchRange[0] && str.length <= matchRange[1]) {
      if (Array.isArray(source)) {
        this.next(source.filter((item) => item.indexOf(str) !== -1));
      } else {
        source(str, this.next.bind(this));
      }
    }
  }
  next(matchResult) {
    let result = matchResult;
    if (this.props.formatter) {
      result = this.props.formatter(result);
    }
    this.setState({
      mentionList: result,
    });
  }
};

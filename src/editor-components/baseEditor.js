import PropTypes from 'prop-types';
import { KEYCODE } from '../utils/keycode';
import '../utils/rangy-position';
import BaseMention from '../components/mentionMixin';

export default class BaseEditor extends BaseMention {
  static displayName = 'BaseEditor';
  static propTypes = {
    panelVisible: PropTypes.boolean,
    onFocus: PropTypes.func,
    mentionFormatter: PropTypes.func,
    onAdd: PropTypes.func,
  };
  static defaultProps = {
  };

  onFocus() {
    this.props.onFocus(this);
  }
  onKeydown(e) {
    const { panelVisible } = this.props;
    switch (e.keyCode) {
      case KEYCODE.UP:
      case KEYCODE.DOWN:
        if (panelVisible) {
          e.preventDefault();
        }
        break;
      case KEYCODE.ENTER:
        if (panelVisible) {
          e.preventDefault();
        } else if (this.handleEnterPress) {
          this.handleEnterPress(e);
        }
        break;
      default:
        break;
    }
  }
  onKeyup(e) {
    const { panelVisible } = this.props;
    switch (e.keyCode) {
      case KEYCODE.UP:
      case KEYCODE.DOWN:
        if (panelVisible) {
          e.preventDefault();
        }
        break;
      case KEYCODE.ENTER:
        break;
      default:
        if (this.handleDefaultKeyup) {
          this.handleDefaultKeyup();
        }
        break;
    }
  }
  insertMentionData(mentionData) {
    const { mentionFormatter, onAdd } = this.props;
    const insertContent = mentionFormatter(mentionData);
    this.insert(insertContent);
    onAdd(insertContent, mentionData);
    const added = this._added = this._added || [];
    const mentionDataJson = JSON.stringify(mentionData);
    if (!added.filter(n => n.dataJson === mentionDataJson).length) {
      added.push({
        content: insertContent,
        data: mentionData,
        dataJson: mentionDataJson,
      });
    }
  }
  getValue() {
    return this.state.value;
  }
  getMentions() {
    const content = this.getValue() || '';
    const added = this._added || [];
    return added.filter(n => !!~content.indexOf(n.content)).map(n => n.data);
  }
}

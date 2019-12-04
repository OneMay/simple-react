import {renderComponent} from '../react-dom/diff';
import {enqueueSetState} from './set-state-queue';

export class Component {
  constructor(props={}){
    this.state = {};
    this.props = props;
  }

  forceUpdate() {
    renderComponent(this, true)
  }
  
  setState(stateChange){
    enqueueSetState(stateChange,this);
  }
}
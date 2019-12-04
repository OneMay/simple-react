import {renderComponent} from '../react-dom/diff';
import {cloneObj} from '../utils';

const setStateQueue = [];
const renderQueue = [];

function defer( fn ) {
  return Promise.resolve().then( fn );
}

export function enqueueSetState(stateChange,component){

  //stateChange是函数则立即执行并更新
  if(typeof stateChange === 'function'){
    component.prevState = cloneObj(component.state) || {};

    if ( !component.nextState ) {
      component.nextState = Object.assign( {}, stateChange( component.prevState, component.props ) )
    }else{
      Object.assign( component.nextState, stateChange( component.prevState, component.props ) );
    }

    renderComponent( component );
  }else{

    //如果setStateQueue的长度是0，也就是在上次flush执行之后第一次往队列里添加
    if ( setStateQueue.length === 0 ) {
      defer( flush );
    }

    setStateQueue.push({
      stateChange,
      component
    })
  
     // 如果renderQueue里没有当前组件，则添加到队列中
     if ( !renderQueue.some( item => item === component ) ) {
      renderQueue.push( component );
    }
  }

}

/**
 * 清空队列
 */
function flush(){
  let item,component;
  // 遍历
  while( item = setStateQueue.shift() ) {

      const { stateChange, component } = item;

      // 如果没有prevState，则将当前的state作为初始的prevState
      if ( !component.prevState ) {
          component.prevState = cloneObj(component.state) || {};
      }

      // 如果stateChange是一个方法，也就是setState的第二种形式
      if ( typeof stateChange === 'function' ) {
        if ( !component.nextState ) {
          component.nextState = Object.assign( {}, stateChange( component.prevState, component.props ) )
        }else{
          Object.assign( component.nextState, stateChange( component.prevState, component.props ) );
        }
      } else {
          // 如果stateChange是一个对象，则直接合并到setState中
          if ( !component.nextState ) {
            component.nextState = Object.assign( {}, stateChange );
          }else{
            Object.assign( component.nextState, stateChange );
          }
      }

      component.prevState = cloneObj(component.state) || {};

  }

  // 渲染每一个组件
  while( component = renderQueue.shift() ) {
    renderComponent( component );
  }
}
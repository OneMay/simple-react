import {render} from './render';

const ReactDOM = {
  render: ( vnode, container ) => {
    //当多次调用render函数时，不会清除原来的内容。所以我们将其附加到ReactDOM对象上时，先清除一下挂载目标DOM的内容
      container.innerHTML = '';
      return render( vnode, container );
  }
}
export default  ReactDOM;
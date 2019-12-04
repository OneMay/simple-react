import {setComponentProps,createComponent,diff} from './diff';

export function setAttribute(dom,key,value){
  if(key === 'className') key = 'class';

  if (dom && key === 'dangerouslySetInnerHTML') {
    dom.innerHTML = (value && value.__html ) || '';
    return
  }

  if(/on\w+/.test(key)){  //处理事件
    key = key.toLowerCase();
    dom[key] = value || '';
  } else if (key === 'style'){
    if(!value || typeof value === 'string'){
      dom.style.cssText = value || '';
    }else if(value && Object.prototype.toString.call(value) === '[object Object]'){
      for(let name in value){
        dom.style[name] = typeof value[name] === 'number' ? value[name] + 'px' : value[name];
      }
    }
  } else {
    if ( name in dom || name === 'key') {
      dom[ name ] = value || '';
    }
    if(value){
      dom.setAttribute(key,value);
    } else {
      dom.removeAttribute(key);
    }
  }
}



export function render( vnode, container,dom ) {
  //return container.appendChild( _render( vnode ) );
  return diff(dom, vnode, container);
}
function _render( vnode,container ) {

  if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

  if ( typeof vnode === 'number' ) vnode = String( vnode );

  if ( typeof vnode === 'string' ) {
      let textNode = document.createTextNode( vnode );
      return textNode;
  }

  //处理自定义组件
  if(typeof vnode.type === 'function'){
    const component = createComponent(vnode.type,vnode.config);
    
    setComponentProps(component, vnode.config);

    return component.base;
  }

  const dom = document.createElement( vnode.type );

  if(vnode.config){
    Object.keys(vnode.config).forEach(key=>{
      const value = vnode.config[key];
      setAttribute(dom,key,value);//设置属性
    })
  }
  if(Object.prototype.toString.call(vnode) === '[object Date]'){
    const textNode = document.createTextNode(vnode.toLocaleDateString());
    return textNode;
  }

  vnode.children.forEach( child => _render( child, dom ) );    // 递归渲染子节点

  return  container.appendChild( dom );
}



import {setAttribute} from './render';
import {Component} from '../react/component';
import {cloneObj} from '../utils';


//创建组件
export function createComponent(component, props={}){
  let instance;

  //如果是类定义组件则直接返回实例
  if(component && component.prototype && component.prototype.render){
    instance = new component(props);
  }else{
    //如果是函数定义组件，则将其扩展为类定义组件
    instance = new Component(props);
    instance.constructor = component;
    instance.render = function(config={}){
    
    let newProps = Object.create(null);
    Object.assign(newProps,props,config);
      return this.constructor(newProps);
    }
  }
 
  return instance;
}


/**
 * 
 * @param {*} component 
 * 改方法用来渲染组件，使用setState会调用改方法进行重新渲染
 * 在这个方法里可以实现componentWillUpdate、componentDidUpdate、componnetDidMount
 */
export function renderComponent(component,isForceUpdate){
  let base;
  let shouldComponentUpdate = true;

  if(!('nextState' in component)){
    component.nextState = cloneObj(component.state) || {};
  }
  if(!('prevState' in component)){
    component.prevState = cloneObj(component.state) || {};
  }
  if(!('nextProps' in component)){
    component.nextProps = cloneObj(component.props) || {}
  }
  if(!('prevProps' in component)){
    component.prevProps = cloneObj(component.props) || {}
  }

  Object.defineProperties(component,{
    nextProps:{
    enumerable:false
    },
    prevProps:{
      enumerable:false
    },
    prevState:{
      enumerable:false
    },
    nextState:{
    enumerable:false
      }
    });
  if(component.base){
    if(!isForceUpdate && component.shouldComponentUpdate){
      shouldComponentUpdate = component.shouldComponentUpdate(component.nextProps || {},component.nextState || {});
    }else{
      shouldComponentUpdate = true;
    }
    if(shouldComponentUpdate && component.componentWillUpdate){
      component.componentWillUpdate(component.nextProps || {},component.nextState || {});
    }
    if(shouldComponentUpdate){
      component.props = cloneObj(component.nextProps) || {};
      component.state = cloneObj(component.nextState) || {};
    }
  }else{
    if('nextState' in component){
      component.state = cloneObj(component.nextState);
    }

    if('nextProps' in component){
      component.props = cloneObj(component.nextProps) || {};
    }
  }
 
  if(component.base){

    if(shouldComponentUpdate){
      const renderer = component.render(component.props||{});

      base = diffTree(component.base,renderer);
    }
  }else{

  const renderer = component.render(component.props||{});

   //base = _render(renderer);
   base = diffTree(component.base,renderer);
  }
  

  

  if(component.base){
    if(shouldComponentUpdate&&component.componentDidUpdate){
      component.componentDidUpdate(component.prevProps , component.prevState )
    }
  }else if(component.componentDidMount){
    if(base){
      component.base = base;
      base._component = component;
    }
    component.componentDidMount()
  }

  // if ( component.base && component.base.parentNode ) {
  //   component.base.parentNode.replaceChild( base, component.base );
  // }

  if(base){
    component.base = base;
    base._component = component;
  }
}

//更新props,实现componentWillMount、componentWillReceiveProps两个生命周期方法
export function setComponentProps(component,props={}){
  component.prevProps = cloneObj(component.props) || {};

  component.nextProps = props || {};

  if(!component.base){
    if(component.componentWillMount) component.componentWillMount();
  }else if(component.componentWillReceiveProps){
    component.componentWillReceiveProps(component.nextProps);
  }


  renderComponent(component);
}

function isSameNodeType( dom, vnode ) {

  if ( typeof vnode === 'string' || typeof vnode === 'number' ) {
      return dom.nodeType === 3;
  }

  if ( vnode && typeof vnode.type === 'string' ) {
      return dom.nodeName.toLowerCase() === vnode.type.toLowerCase();
  }

  return dom && vnode && dom._component && dom._component.constructor === vnode.type;
}

function removeNode( dom ) {

  if ( dom && dom.parentNode ) {
      dom.parentNode.removeChild( dom );
  }

}

function unMountComponent( component ) {
  if ( component.componentWillUnmount ) component.componentWillUnmount();
  removeNode( component.base);
}

function diffAttributes(dom, vnode){
  const old = {};
  const attrs = vnode.config;

  for(let i=0; i<dom.attributes.length; i++){
    const attr = dom.attributes[i];

    old[attr.name] = attr.value;
  }

  //如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
  for(let name in old){
    if(!(name in attrs)){
      setAttribute(dom,name,undefined);
    }
  }

  // 更新新的属性值
  for(let name in attrs){
    if(old[name] !== attrs[name]){
      setAttribute(dom,name,attrs[name]);
    }
  }
}

function diffChildren(dom,vChildren=[]){
  const domChildren = (dom && dom.childNodes )||[];
  const children = [];
  const domKey = {};

  if(domChildren.length>0){
    for(let i = 0; i<domChildren.length; i++){
      const child = domChildren[i];
      const key = child.key;
      if(key){
        domKey[key] = child;
      }else{
        children.push(child);
      }
    }
  }

  if(vChildren && vChildren.length>0){
    let min = 0;
    let childrenLength = vChildren.length;

  
    for(let i = 0; i<vChildren.length; i++){
      const vchild = vChildren[i];
    
      const key = (vchild&&vchild.key) || null;
      let child;

      if(key){
        //如果有key，则找到对应key的节点
        if(domKey[key]){
          child = domKey[key];
          domKey[key] = undefined;
        }
      }else if(min < childrenLength){
        //如果没有key，则优先找到类型相同的节点
        for(let j = min; j<childrenLength; j++){
          let C = children[j];

          if(C && isSameNodeType(C, vchild)){
            child = C;
            children[j] = undefined;

            if(j === childrenLength-1) childrenLength--;
            if(j === min) min++;
            break; 
          }
        }
      }

      //对比child和vchild
      child = diffTree(child,vchild);

      //更新dom
      const DOM = domChildren[i];
  
      if(child && child !== DOM && child !== dom){
        if(!DOM){
          //如果更新前对应的位置为空，说明此节点是新增的
          dom.appendChild(child);
        }else if( child === DOM.nextSibling){
          //如果更新后的节点与更新前对应位置的下一个节点一样，说明当前节点被移除
          removeNode(DOM);
        }else{
          //将更新后的节点移动到正确的位置
          if(vChildren.length !== domChildren.length){
            for (let i = vChildren.length; i < domChildren.length; i++) {
              const f = domChildren[i];
              removeNode(f);
             }
             dom.insertBefore(child,DOM);
          }else{
            if(DOM && DOM.parentNode && child!==DOM){
              DOM.parentNode.replaceChild(child,DOM)
            }
          }
        }
      }
    }
  }
}

function diffComponent(dom,vnode ){
  let component = dom && dom._component;
  let oldDom = dom;

   // 如果组件类型没有变化，则重新set props
   if ( component && component.constructor === vnode.type ) {

    setComponentProps( component, vnode.config );
    dom = component.base;

    // 如果组件类型变化，则移除掉原来组件，并渲染新的组件
  }else{
    if(component){
      unMountComponent(component);
      oldDom = null;
    }

    component = createComponent(vnode.type,vnode.config);

    setComponentProps(component,vnode.config);
    dom =  component.base;

    if ( oldDom && dom !== oldDom ) {
      oldDom._component = null;
      removeNode( oldDom );
    }
  }

  return dom;
}

function diffTree(dom,vnode){
  let out = dom;

  if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';

  if ( typeof vnode === 'number' ) vnode = String( vnode );
  //对比文本节点
  if(typeof vnode === 'string'){
    if(dom && dom.nodeType === 3){
      //如果当前的DOM就是文本节点，则直接更新内容
      
      if(dom.textContent !== vnode){
        dom.textContent = vnode;
      }
    }else{
      out = document.createTextNode(vnode);
      if(dom && dom.parentNode){
        dom.parentNode.replaceChild(out,dom)
      }else{

      }
    }
    return out;
  }

  if ( typeof vnode.type === 'function' ) {
    //对比组件

    return diffComponent( dom, vnode );
  }


  /**
   * 如果vnode表示的是一个非文本的DOM节点，那就要分两种情况了：
   * 情况一：如果真实DOM不存在，表示此节点是新增的，或者新旧两个节点的类型不一样，那么就新建一个DOM元素，并将原来的子节点（如果有的话）移动到新建的DOM节点下。
   * 情况二：如果真实DOM存在，并且和虚拟DOM是同一类型的，那我们暂时不需要做别的，只需要等待后面对比属性和对比子节点。
   */
  if(!dom || !isSameNodeType(dom,vnode)){
    out = document.createElement(vnode.type);

    if(dom){
      [ ...dom.childNodes ].map( out.appendChild );    // 将原来的子节点移到新节点下

      if ( dom.parentNode ) {
        dom.parentNode.replaceChild( out, dom );    // 移除掉原来的DOM对象
      }
    }
  }

  if ( vnode.children && vnode.children.length > 0 || ( out.childNodes && out.childNodes.length > 0 ) ) {
    //对比子节点
    diffChildren( out, vnode.children );
  }

  diffAttributes( out, vnode );


  return out;
}

export function diff( dom, vnode, container ) {

  const ret = diffTree( dom, vnode );

  if ( container && ret.parentNode !== container ) {
      container.appendChild( ret );
  }

  return ret;

}
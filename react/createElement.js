const hasSymbol = typeof Symbol === 'function' && Symbol.for;

const REACT_ELEMENT_TYPE = hasSymbol
  ? Symbol.for('react.element')
  : 0xeac7;

export function createElement(type,config,...children){
  return {
    $$typeof:REACT_ELEMENT_TYPE,
    type,
    config,
    children,
    key: config&&config.key || null
  }
}
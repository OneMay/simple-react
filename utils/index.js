import * as R from 'ramda';

export var cloneObj = function(obj){

  if(typeof obj !== 'object' || !obj){
    return obj || {};
}
  var str, newobj = obj.constructor === Array ? [] : {};
  if(typeof obj !== 'object'){
      return;
  } else if(window.JSON){
      str = JSON.stringify(obj), //系列化对象
      newobj = JSON.parse(str); //还原
  } else {
      for(var i in obj){
          newobj[i] = typeof obj[i] === 'object' ? 
          cloneObj(obj[i]) : obj[i]; 
      }
  }
  return newobj;
  }

  function keepDecimal(num,pos = 4){
    const position = pos >0 ? Math.pow(10,pos) : 0;
    return position ?Math.round(num * position) / position :Math.round(num);
  }
  
  function percentFunc(num){
    return Math.round(num* 100 * 100)/100 +'%';
  }

  export const decimal = R.curry(keepDecimal);
  export const percent = R.curry(percentFunc);

  export const decimalAndPercent = R.compose(percent,decimal)
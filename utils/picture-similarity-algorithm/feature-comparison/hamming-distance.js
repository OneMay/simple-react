
import {decimalAndPercent} from '../../index';

/**
 * 
 * @param {*} target 
 * @param {*} source 
 * 汉明距离
 * 两个等长字符串之间的汉明距离（英语：Hamming distance）是两个字符串对应位置的不同字符的个数。
 * 换句话说，它就是将一个字符串变换成另外一个字符串所需要替换的字符个数
 */
function hammingDistance(target,source,pos=''){
  let distance = 0;
  const targetArr = target.split(pos);
  const sourceArr = source.split(pos);

  sourceArr.forEach((item,index)=>{
    if(item !== targetArr[index]){
      distance ++;
    }
  })

  return {distance,length:sourceArr.length};
}

export function hammingDistanceSimilarity(target,source,pos=''){
  const distance = hammingDistance(target,source,pos);
  const similarity = (distance.length - distance.distance) / distance.length;
  return decimalAndPercent(similarity,4);
}

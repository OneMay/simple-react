 
import {decimalAndPercent} from '../../index';
 function cosineSimilarityFunc (target, source,pos='') {
  // cosθ = ∑n, i=1(Ai × Bi) / (√∑n, i=1(Ai)^2) × (√∑n, i=1(Bi)^2) = A · B / |A| × |B|
  const targetArr = target.split(pos);
  const sourceArr = source.split(pos);
  const length = targetArr.length
  let innerProduct = 0
  for (let i = 0; i < length; i++) {
    innerProduct += targetArr[i] * sourceArr[i]
  }
  let vecA = 0
  let vecB = 0
  for (let i = 0; i < length; i++) {
    vecA += targetArr[i] ** 2
    vecB += sourceArr[i] ** 2
  }
  const outerProduct = Math.sqrt(vecA) * Math.sqrt(vecB)
  return innerProduct / outerProduct
}

export function cosineSimilarity(target,source,pos=''){
  const similarity = cosineSimilarityFunc(target,source,pos);
  return decimalAndPercent(similarity,4);
}
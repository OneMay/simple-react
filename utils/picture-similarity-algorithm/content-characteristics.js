import {compressImg } from "./average-hash";
import {hammingDistanceSimilarity} from './feature-comparison/hamming-distance';
/**
 *  RGB 三种颜色添加不同的权重。
 * 鉴于红光有着更长的波长，而绿光波长更短且对视觉的刺激相对更小，
 * 所以我们要有意地减小红光的权重而提升绿光的权重。
 * 经过统计，比较好的权重配比是 R:G:B = 0.299:0.587:0.114
 */
const GrayscaleWeight = {
  R: 0.299,
  G: 0.587,
  B: 0.114
};

/**
 * 加权平均法求灰度值
 * @param {*} imgData 
 * 每个元素代表一个像素的灰度值（因为 RBG 取值相同，所以只需要一个值即可）
 */
function setGray(imgData){
  const grayData = [];
  const data = imgData.data;

  for(let i = 0;i < data.length; i += 4){
    const gray = ~~(data[i] * GrayscaleWeight.R + data[i + 1] * GrayscaleWeight.G + data[i + 2] * GrayscaleWeight.B);
    data[i] = data[ i + 1] = data[i + 2] = gray;
    grayData.push(gray);
  }

  return grayData;
}

/**
 * 大津法
 * @param {*} imgData 
 * n:有多少个像素
 * n1：灰度值小于阈值的像素为 n1 个
 * n2:大于等于阈值的像素为 n2 个（ n1 + n2 = n ）
 * w1 和 w2:两种像素各自的比重
 * μ1 和 σ1:所有灰度值小于阈值的像素的平均值和方差
 *  μ2 和 σ2: 所有灰度值大于等于阈值的像素的平均值和方差
 * w1 = n1 / n
 * w2 = n2 / n
 * 类内差异 = w1(σ1的平方) + w2(σ2的平方)
 * 类间差异 = w1w2(μ1-μ2)^2
 * 用"穷举法"，将阈值从灰度的最低值到最高值，依次取一遍，分别代入上面的算式。
 * 使得"类内差异最小"或"类间差异最大"的那个值，就是最终的阈值
 */
function Otsu(imgData){
  const grayData = setGray(imgData);

  let total = grayData.length;

  //求灰度的总值
  let sum = grayData.reduce((total,curr)=>total+curr,0)

  let n1 = 0;
  let n2 = 0;
  let w1 = 0;
  let w2 = 0;
  let n1Sum= 0;
  let varMax = 0;
  let threshold = 0;

  for (let t = 0; t < 256; t++) {
    const n1Data = grayData.filter(item=>item<t);
    n1 = n1Data.length;
    n2 = total - n1;

    w1 = n1 / total;
    w2 = n2 / total;

    n1Sum = n1Data.reduce((total,curr)=>total+curr,0)

    let u1 = n1 ? n1Sum / n1 :0;
    let u2 = n2 ? (sum - n1Sum) / n2 :0;

    let interClassVariance = w1 * w2 * (u1 - u2) ** 2; //类间差异

    if (interClassVariance > varMax) {
      varMax = interClassVariance
      threshold = t
    }
  }

  return threshold
}

/**
 * [binaryzation description]
 *
 * @return  {[type]}  [return description]
 * 原图转化为黑白图（二值图）
 */
function binaryzation (imgData, threshold) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const imgWidth = Math.sqrt(imgData.data.length / 4);
  canvas.width = imgWidth;
  canvas.height = imgWidth;
  const newImageData = ctx?ctx.createImageData(imgWidth, imgWidth):'';
  for (let i = 0; i < imgData.data.length; i += 4) {
    let R = imgData.data[i]
    let G = imgData.data[i + 1]
    let B = imgData.data[i + 2]
    let Alpha = imgData.data[i + 3]
    let sum = (R + G + B) / 3

    newImageData.data[i] = sum > threshold ? 255 : 0
    newImageData.data[i + 1] = sum > threshold ? 255 : 0
    newImageData.data[i + 2] = sum > threshold ? 255 : 0
    newImageData.data[i + 3] = Alpha
  }
  ctx ? ctx.putImageData(newImageData,0,0):"";
  return {data:newImageData,url:canvas.toDataURL('image/jpeg')}
}

function setFingerprint(imgData){
  const newImageData = [];
  for (let i = 0; i < imgData.data.data.length; i += 4) {
    let R = imgData.data.data[i]
    let G = imgData.data.data[i + 1]
    let B = imgData.data.data[i + 2]
    let sum = (R + G + B) / 3
  
    newImageData.push(sum ===255? 1 :sum)
  }
  return newImageData.join(',');
}

async function getFingerprint(imgUrl,imgWidth=8,imgHeight=8){
  const imgData = await compressImg(imgUrl,imgWidth,imgHeight);
  const threshold = Otsu(imgData);
  const newImgData = binaryzation(imgData,threshold);
  const fingerprint = setFingerprint(newImgData);
  return {hashFingerPrint:fingerprint,url:newImgData.url};
}

export const contentCharacteristics = {
  getFingerprint,
  hammingDistanceSimilarity
}
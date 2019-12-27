import { createGraycsale, compressImg } from "./average-hash";
import {hammingDistanceSimilarity} from './feature-comparison/hamming-distance';

function memoizeCosines(num, cosMap){
  cosMap = cosMap || {};
  cosMap[num] = new Array( num * num);

  let PI_N = Math.PI / num; //Math.PI = 3.14 = 180°
  for(let i = 0; i< num; i++){
    for(let j = 0; j< num; j++){
      cosMap[num][j + (i * num)] = Math.cos( PI_N * (j + 0.5) * i); //余弦值
    }
  }
  return cosMap;
}
/**
 * 离散余弦变换
 * 计算图片的DCT变换，得到32*32的DCT系数矩阵
 * @param {*} signal 
 * @param {*} scale 
 * 经过离散余弦变换以后，把图像从像素域转化到了频率域，
 * 而携带了有效信息的低频成分会集中在 DCT 矩阵的左上角，
 * 因此我们可以利用这个特性提取图片的特征
 */
function dct(signal=[],scale=2){
  let L = signal.length;
  let cosMap = null;

  if(!cosMap || !cosMap[L]){
    cosMap = memoizeCosines(L, cosMap);
  }

  let coefficients = signal.map(()=>0);

  return coefficients.map((item, coeindex)=>{
    return scale * signal.reduce((total, current, index)=>{
      return total + ( current * cosMap[L][index + (coeindex * L)]);
    },0);
  })
}

/**
 * 
 * @param {*} arr 
 * 一维数组生维成二维数组（矩阵）
 */
function createMatrix(arr=[]){
  const length = arr.length;
  const matriWidth = Math.sqrt(length);
  const matrix = [];
  for(let i = 0; i < matriWidth; i++){
    const _tmp = arr.slice(i * matriWidth, i * matriWidth + matriWidth);
    matrix.push(_tmp);
  }
  return matrix;
}

/**
 * 
 * @param {*} matrix 
 * @param {*} range 
 * 从矩阵中获取其“左上角”大小为 range × range 的内容
 */
function getMatrixRange(matrix, range){
  const rangeMatrix = [];
  for(let i = 0; i < range; i++){
    for(let j = 0; j < range; j++){
      rangeMatrix.push(matrix[i][j]);
    }
  }

  return rangeMatrix;
}

/**
 * 
 * @param {*} imgSrc 
 * 复用之前在“平均哈希算法”中所写的灰度图转化函数，获取数据
 */
async function getGraycsaleData (imgSrc,imgWidth,imgHeight){
  const imgData =  await compressImg(imgSrc,imgWidth,imgHeight);
  let grayImgData;
  if(typeof imgData === 'string'){
    return 'error';
  }else{
   grayImgData = createGraycsale(imgData);
  }
  return {data:grayImgData.data,url:grayImgData.url};
}

/**
 * 感知哈希算法：pHash
 * @param {*} imgSrc 
 * 1.缩小尺寸：pHash以小图片开始，但图片大于8*8，32*32是最好的。这样做的目的是简化了DCT的计算，而不是减小频率
 * 2.简化色彩：将图片转化成灰度图像，进一步简化计算量
 * 3.计算DCT：计算图片的DCT变换，得到32*32的DCT系数矩阵。
 * 4.缩小DCT：虽然DCT的结果是32*32大小的矩阵，但我们只要保留左上角的8*8的矩阵，这部分呈现了图片中的最低频率。
 * 5.计算平均值：如同均值哈希一样，计算DCT的均值
 * 6.计算hash值
 */
export async function  getPHashFingerprint (imgSrc,imgWidth=8, imgHeight=8) {
  const imgData = await getGraycsaleData(imgSrc,imgWidth,imgHeight);
  if(typeof imgData === 'string'){
    return 'error';
  }
  const dctData = dct(imgData.data.data);
  const dctMatrix = createMatrix(dctData);
  const rangeMatrix = getMatrixRange(dctMatrix, dctMatrix.length / 2);
  const rangeAve = rangeMatrix.reduce((pre, cur) => pre + cur, 0) / rangeMatrix.length
  const hashFingerPrint =  rangeMatrix.map(val => (val >= rangeAve ? 1 : 0)).join('')
  return {hashFingerPrint,url:imgData.url}
}

export const perceiveHash = {
  getPHashFingerprint,
  hammingDistanceSimilarity
 }
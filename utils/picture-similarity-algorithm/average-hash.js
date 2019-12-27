import {hammingDistanceSimilarity} from './feature-comparison/hamming-distance';

/**
 * 压缩图片
 * @param {*} imgSrc 
 * @param {*} imgWidth 
 * canvas实现图片压缩原理：为了把“大图片”绘制到“小画布”上一些相邻且颜色相近的像素往往会被删减掉，
 * 从而有效减少了图片的信息量，因此能够实现压缩的效果。
 * 1.new Image() 加载图片
 * 2.设定一个预设的图片宽高值让图片压缩到指定的大小
 * 3.获取到压缩后的图片的 ImageData数据(意味着我们能获取到图片的每一个像素的信息)
 */
 export async function compressImg(imgSrc,imgWidth=8,imgHeight=8){
  return new Promise((resolve,reject)=>{
    if(!imgSrc){
      reject('图片地址不能为空！');
    }
    const canvas = document.createElement('canvas');
    const canvasCtx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = ()=>{
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      canvasCtx ? canvasCtx.drawImage(img,0,0,imgWidth,imgHeight):"";
      const data = canvasCtx?canvasCtx.getImageData(0,0,imgWidth,imgHeight): '';
      data?resolve(data):reject('no data');
    }

    img.src = imgSrc;
  })
}

/**
 * 图片灰度化 --- start ----
 * 
 * 彩色的图片转化成灰度图
 * 灰度（Gray scale）数字图像是每个像素只有一个采样颜色的图像
 * 任何的颜色都可以通过三种颜色通道（R, G, B）的亮度以及一个色彩空间（A）来组成，
 * 而一个像素只显示一种颜色，因此可以得到“像素 => RGBA”的对应关系。
 * 而“每个像素只有一个采样颜色”，则意味着组成这个像素的三原色通道亮度相等，
 * 因此只需要算出 RGB 的平均值即可
 */

 /**
  * 
  * @param {*} data 
  * 使用canvas创建ImageData对象
  *设置RGBA
  */
function createImgData(data=[]){
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const imgWidth = Math.sqrt(data.length / 4);
  canvas.width = imgWidth;
  canvas.height = imgWidth;
  const newImageData = ctx?ctx.createImageData(imgWidth,imgWidth):'';
  for(let i = 0; i<data.length;i +=4){
    let R = data[i];
    let G = data[i + 1];
    let B = data[i + 2];
    let Alpha = data[i + 3];

    newImageData.data[i] = R;
    newImageData.data[i + 1] = G;
    newImageData.data[i + 2] = B;
    newImageData.data[i + 3] = Alpha;
  }
  ctx ? ctx.putImageData(newImageData,0,0):"";
  return {data:newImageData,url:canvas.toDataURL('image/jpeg')};
}

 export function createGraycsale(imgData){
  const newData = Array(imgData.data.length);
  newData.fill(0); //初始化数组

  imgData.data.forEach((data,index)=>{
    if((index + 1) % 4 === 0){
      const R = imgData.data[index -3];
      const G = imgData.data[index - 2];
      const B = imgData.data[index - 1];

      const gray = ~~((R + G + B) / 3); //双非按位取反运算符,比Math.floor()更快的方法
      newData[index - 3] = gray;
      newData[index - 2] = gray;
      newData[index - 1] = gray;
      newData[index] = 255; //Alpha设置为255，完全可见
    }
  })
  return createImgData(newData);
}

/**
 * 图片灰度化 --- end ----
 */


 /**
  * 指纹提取
  * @param {*} imgData 
  * 在“平均哈希算法”中，若灰度图的某个像素的灰度值大于平均值，则视为1，否则为0
  */
function getHashFingerPrint(imgData){
   const grayList = imgData.data.reduce((total,current,index)=>{
     if((index + 1) % 4 === 0){
      total.push(imgData.data[index - 1]);
     }
     return total
   },[]);

   const length = grayList.length;
   const grayAverage = grayList.reduce((total,current)=>(total + current),0) / length;

   return grayList.map(gray=>(gray >= grayAverage ? 1 : 0)).join('');
 }


 /**
  * [getFingerPrint description]
  *平均哈希算法
  * @return  {[type]}  [return description]
  * 1.缩小尺寸为8×8，以去除图片的细节，只保留结构、明暗等基本信息，摒弃不同尺寸、比例带来的图片差异
  * 2.简化色彩。将缩小后的图片转为灰度图像
  * 3.计算平均值。计算所有像素的灰度平均值
  * 4.比较像素的灰度。将64个像素的灰度，与平均值进行比较。大于或等于平均值，记为1；小于平均值，记为0
  * 5.计算哈希值。将上一步的比较结果，组合在一起，就构成了一个64位的整数，这就是这张图片的指纹
  * 6.计算哈希值的差异，得出相似度（汉明距离或者余弦值）
  */
 async function getFingerPrint (imgSrc,imgWidth=8, imgHeight=8){
   const imgData =  await compressImg(imgSrc,imgWidth,imgHeight);
   if(typeof imgData === 'string'){
     return 'error';
   }else{
     const grayImgData = createGraycsale(imgData);
     const hashFingerPrint = getHashFingerPrint(grayImgData.data);
     return {hashFingerPrint,url:grayImgData.url};
   }
 }

 export const averageHash = {
  getFingerPrint,
  hammingDistanceSimilarity
 }
import {compressImg } from "./average-hash";
import {hammingDistanceSimilarity} from './feature-comparison/hamming-distance';

/**
 * 
 * @param {*} imgData 
 * @param {*} count 
 * 划分颜色区间，默认区间数目为4个
 * 把256种颜色取值简化为4种(0,1,2,3)
 */
function simplifyColorData(imgData, count = 4) {
  const colorZoneDataList = [];
  const zoneStep = 256 / count
  const zoneBorder = [0] // 区间边界
  for (let i = 1; i <= count; i++) {
    zoneBorder.push(zoneStep * i - 1)
  }
  imgData.data.forEach((data, index) => {
    if ((index + 1) % 4 !== 0) {
      for (let i = 0; i < zoneBorder.length; i++) {
        if ((data > zoneBorder[i] || data===0) && data <= zoneBorder[i + 1]) {
          data = i
        }
      }
    }
    colorZoneDataList.push(data)
  })
  return colorZoneDataList
}

/**
 * 
 * @param {*} simplifiedDataList 
 * 归类[[],[]]
 */
 function seperateListToColorZone (simplifiedDataList) {
  const zonedList = [];
  let tempZone = [];
  simplifiedDataList.forEach((data, index) => {
    if ((index + 1) % 4 !== 0) {
      tempZone.push(data);
    } else {
      zonedList.push(JSON.stringify(tempZone));
      tempZone = [];
    }
  })
  return zonedList;
}

 function setFingerprint(zonedList, zoneAmount=4){
  const colorMap ={};
  for(let i = 0;i < zoneAmount; i++){
    for(let j = 0; j < zoneAmount; j++){
      for(let k = 0; k < zoneAmount; k++){
        colorMap[JSON.stringify([i, j, k])] = 0;
      }
    }
  }
  zonedList.forEach(zone=>{
    colorMap[zone] ++
  })
  return Object.values(colorMap).join(',');
}

async function getGraycsaleData (imgSrc,imgWidth,imgHeight){
  const imgData =  await compressImg(imgSrc,imgWidth,imgHeight);
  if(typeof imgData === 'string'){
    return 'error';
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const imgwidth = Math.sqrt(imgData.data.length / 4);
  canvas.width = imgwidth;
  canvas.height = imgwidth;
  let newData = ctx?ctx.createImageData(imgwidth,imgwidth):'';
  newData = imgData;
  ctx ? ctx.putImageData(newData,0,0):"";
  return {data:imgData,url:canvas.toDataURL('image/jpeg')};
}

/**
 * 颜色分布法
 * @param {*} imgUrl 
 * @param {*} imgWidth 
 * @param {*} imgHeight 
 * @param {*} count 
 * 1.缩小尺寸为N*N，以去除图片的细节，只保留结构、明暗等基本信息，摒弃不同尺寸、比例带来的图片差异
 * 2.划分颜色区间,把256种颜色取值简化为N种
 * 3.将RGBA数据归类到不同的分组
 * 4.统计每个相同分组的总数，得出指纹
 *  6.计算哈希值的差异，得出相似度（余弦值）
 */
async function getFingerprint(imgUrl,imgWidth=8,imgHeight=8,count = 4){
  const imgData = await getGraycsaleData(imgUrl,imgWidth,imgHeight);
  const simplifyData = simplifyColorData(imgData.data,count);
  const colorZone = seperateListToColorZone(simplifyData);
  const fingerprint = setFingerprint(colorZone,count);
  return {hashFingerPrint:fingerprint,url:imgData.url};
}

export const colorDistribution = {
  getFingerprint,
  hammingDistanceSimilarity
}
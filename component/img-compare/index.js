import React from 'react';
import {Table,Slider,Input,Select} from 'antd';
import Upload from '../upload';
import {pictureSimilarityAlgorithm} from '../../utils/picture-similarity-algorithm';
import {cosineSimilarity} from '../../utils/picture-similarity-algorithm/feature-comparison/cosineSimilarity'
import './index.scss';

const { Option } = Select;
export default class ImgCompare extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      dataSource:[],
      source:{},
      target:{},
      disabled:true,
      value:8,
      colorKinds:'4'
    }
  }
  async uploadChange(imageUrl){
    const {value,colorKinds} = this.state;
    let imgData = '', perceiveHashData = '',colorDistribution = '',contentCharacteristics=''
    if(imageUrl){
      imgData = await pictureSimilarityAlgorithm.averageHash.getFingerPrint(imageUrl,value,value);
      perceiveHashData = await pictureSimilarityAlgorithm.perceiveHash.getPHashFingerprint(imageUrl,value,value);
      colorDistribution = await pictureSimilarityAlgorithm.colorDistribution.getFingerprint(imageUrl,value,value,Number(colorKinds));
      contentCharacteristics = await pictureSimilarityAlgorithm.contentCharacteristics.getFingerprint(imageUrl,value,value);
      if(typeof imgData !== 'string' && typeof perceiveHashData !== 'string'){
        let dataSource = [
          {
            key: '1',
            source: {src:imageUrl},
            averageHash:{src:imgData.url},
            perceiveHash:{src:perceiveHashData.url},
            colorDistribution:{src:colorDistribution.url},
            contentCharacteristics:{src:contentCharacteristics.url}
          },{
            key: '2',
            source: '特征值（指纹）',
            averageHash:imgData.hashFingerPrint,
            perceiveHash:perceiveHashData.hashFingerPrint,
            colorDistribution:colorDistribution.hashFingerPrint,
            contentCharacteristics:contentCharacteristics.hashFingerPrint,
          },{
            key: '3',
            source: '特征值（指纹）长度',
            averageHash:imgData.hashFingerPrint.length.toString(),
            perceiveHash:perceiveHashData.hashFingerPrint.length.toString(),
            colorDistribution:(colorDistribution.hashFingerPrint.split(',').length).toString(),
            contentCharacteristics:contentCharacteristics.hashFingerPrint.split(',').length.toString(),
          }
        ];
        this.state.target.data? dataSource = [...dataSource,...this.state.target.data]:'';
        this.setState({
          dataSource,
          source:{
            data:dataSource,
            averageHash:imgData.hashFingerPrint,
            perceiveHash:perceiveHashData.hashFingerPrint,
            colorHash:colorDistribution.hashFingerPrint,
            contentHash:contentCharacteristics.hashFingerPrint,
          },
          disabled:false
        },()=>{
          this.getSimilarity()
        })
      }
    }else{
      this.setState({
        dataSource:[],
        source:{},
        disabled:true
      })
    }
  }
  getSimilarity(){
    const {target,source} = this.state;
    if(typeof target.perceiveHash !== 'undefined' && typeof source.perceiveHash !== 'undefined'){
      const percent = pictureSimilarityAlgorithm.averageHash.hammingDistanceSimilarity(target.averageHash,source.averageHash);
      const percentCosineSimilarity = cosineSimilarity(target.averageHash,source.averageHash,'');
      const perceiveHashPercent = pictureSimilarityAlgorithm.perceiveHash.hammingDistanceSimilarity(target.perceiveHash,source.perceiveHash);
      const perceiveHashCosineSimilarity = cosineSimilarity(target.perceiveHash,source.perceiveHash,'');
      //const colorHashPercent = pictureSimilarityAlgorithm.colorDistribution.hammingDistanceSimilarity(target.colorHash,source.colorHash);
      const colorCosineSimilarity = cosineSimilarity(target.colorHash,source.colorHash,',');
      const contentPercent = pictureSimilarityAlgorithm.contentCharacteristics.hammingDistanceSimilarity(target.contentHash,source.contentHash,',');
      const contentCosineSimilarity = cosineSimilarity(target.contentHash,source.contentHash,',');
      const dataSource = [
        ...this.state.dataSource,
        {
          key:'11',
          source: '相似度',
          averageHash:[percent,percentCosineSimilarity],
          perceiveHash:[perceiveHashPercent,perceiveHashCosineSimilarity],
          colorDistribution:'余弦相似度：'+colorCosineSimilarity,
          contentCharacteristics:[contentPercent,contentCosineSimilarity],
        }
      ]
      this.setState({
        dataSource
      })
    }
  }
  async uploadChangeTarget(imageUrl){
    const {value,colorKinds} = this.state;
    let imgData = '',perceiveHashData ='',colorDistribution='',contentCharacteristics=''
    let dataSource = this.state.dataSource;
    if(imageUrl){
      imgData = await pictureSimilarityAlgorithm.averageHash.getFingerPrint(imageUrl,value,value);
      perceiveHashData = await pictureSimilarityAlgorithm.perceiveHash.getPHashFingerprint(imageUrl,value,value);
      colorDistribution = await pictureSimilarityAlgorithm.colorDistribution.getFingerprint(imageUrl,value,value,Number(colorKinds));
      contentCharacteristics = await pictureSimilarityAlgorithm.contentCharacteristics.getFingerprint(imageUrl,value,value);
      if(typeof imgData !== 'string'&& typeof perceiveHashData !== 'string'){
        const target = [
          {
            key: '4',
            source: {src:imageUrl},
            averageHash:{src:imgData.url},
            perceiveHash:{src:perceiveHashData.url},
            colorDistribution:{src:colorDistribution.url},
            contentCharacteristics:{src:contentCharacteristics.url},
          },{
            key: '5',
            source: '特征值（指纹）',
            averageHash:imgData.hashFingerPrint,
            perceiveHash:perceiveHashData.hashFingerPrint,
            colorDistribution:colorDistribution.hashFingerPrint,
            contentCharacteristics:contentCharacteristics.hashFingerPrint,
          },{
            key: '6',
            source: '特征值（指纹）长度',
            averageHash:imgData.hashFingerPrint.length.toString(),
            perceiveHash:perceiveHashData.hashFingerPrint.length.toString(),
            colorDistribution:(colorDistribution.hashFingerPrint.split(',').length).toString(),
            contentCharacteristics:contentCharacteristics.hashFingerPrint.split(',').length.toString(),
          }
        ];
        dataSource = [...this.state.source.data,...target];
        this.setState({
          target:{
            data:target,
            averageHash:imgData.hashFingerPrint,
            perceiveHash:perceiveHashData.hashFingerPrint,
            colorHash:colorDistribution.hashFingerPrint,
            contentHash:contentCharacteristics.hashFingerPrint,
          },
          dataSource
        },()=>{
          this.getSimilarity()
        })
      }
    }else{
      this.setState({
        target:{},
        dataSource
      })
    }
  }
  silderChange(value){
    this.setState({
      value
    })
  }
  handleChange(value){
    this.setState({
      colorKinds:value
    },()=>{
      //this.getSimilarity()
    })
  }
  filterDropdown(){
    const {colorKinds} = this.state;
    return (
    <div style={{ padding: 8 }}>
      颜色分布法<br/>
      颜色区间数量：{colorKinds}<br/>
      <Select value={colorKinds} style={{ width: 120 }} onChange={this.handleChange.bind(this)}>
      <Option value="4">4</Option>
      <Option value="8">8</Option>
      <Option value="16">16</Option>
      <Option value="32">32</Option>
      <Option value="64">64</Option>
    </Select>
    </div>
  )}
  render(){
    const columns = [
      {
        title:'原图',
        dataIndex:'source',
        width:250,
        key:'source',
        render:text=>{
          if(typeof text === 'string'){
            return text;
          }
          else{
            return <img src={text.src} className="img"></img>
          }
        }
      },
      {
        title:'平均哈希算法',
        dataIndex:'averageHash',
        width:250,
        key:'averageHash',
        render:text=>{
          if(typeof text === 'string'){
            return <Input value={text}></Input>;
          }else if(Array.isArray(text)){
            return <div>
              <p>汉明距离：{text[0]}</p>
              <p >余弦相似度：{text[1]}</p>
            </div>
          }else{
            return <img src={text.src} className="img"></img>
          }
        }
      },
      {
        title:'感知哈希算法',
        width:250,
        dataIndex:'perceiveHash', 
        key:'perceiveHash',
        render:text=>{
          if(typeof text === 'string'){
            return <Input value={text}></Input>;
          } else if(Array.isArray(text)){
            return <div>
              <p>汉明距离：{text[0]}</p>
              <p >余弦相似度：{text[1]}</p>
            </div>
          }else{
            return <img src={text.src} className="img"></img>
          }
        }
      },
      {
        title:this.filterDropdown.bind(this),
        width:250,
        dataIndex:'colorDistribution', 
        key:'colorDistribution',
        render:text=>{
          if(typeof text === 'string'){
            return <Input value={text}></Input>;
          }else{
            return <img src={text.src} className="img"></img>
          }
        },
      },
        {
          title:'内容特征法',
          width:250,
          dataIndex:'contentCharacteristics', 
          key:'contentCharacteristics',
          render:text=>{
            if(typeof text === 'string'){
              return <Input value={text}></Input>;
            } else if(Array.isArray(text)){
              return <div>
                <p>汉明距离：{text[0]}</p>
                <p >余弦相似度：{text[1]}</p>
              </div>
            }else{
              return <img src={text.src} className="img"></img>
            }
          }
      }
    ];
    const {dataSource,value} = this.state;
    return <React.Fragment>
      <div>
      图片大小：{value}x{value}<Slider value={value} min={8} max={180}step={4} className="slider" onChange={this.silderChange.bind(this)}/>
      <Upload onChange={this.uploadChange.bind(this)} disabled={false} className="upload"></Upload>
      <Upload onChange={this.uploadChangeTarget.bind(this)} disabled={this.state.disabled} className="upload"></Upload>
      </div>
      <Table dataSource={dataSource} columns={columns} tableLayout={'fixed'}/>
    </React.Fragment>
  }
}


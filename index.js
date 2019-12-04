import ReactDOM from './react-dom';
import React from './react';
import './index.scss';


const Element = (
  <div className="container">
      hello<span>world!</span>
      <div> {new Date()}</div>
      <input type="text"value="123" /> 
  </div>
);

function WelcomeFunc( props ) {
  return <h1>props改变了：{props.num}</h1>;
}


class Welcome extends React.Component {

// shouldComponentUpdate(nextProps, nextState) {
//   return false;
// }
// componentDidUpdate(prevProps, prevState) {
//   console.log( this);
// }
  render() {
      return <h1>Hello, {this.props.name}</h1>;
  }
}

class Counter extends React.Component {
  constructor( props ) {
    console.log('init')
      super( props );
      this.state = {
          num: 0
      }
  }

  componentWillUpdate(nextProps, nextState) {
      console.log( 'willupdate' ,nextProps,nextState,this.state );
  }

  componentWillMount() {
      console.log( 'willmount' );
  }
  componentWillReceiveProps(newProps) {
    console.log( 'WillReceiveProps' );
  }

  componentDidMount() {
    // const pathReg = /\/maglar-center\/edit\/([A-Za-z0-9_-]+).*/;
    // const path = window.location.pathname;
    // const match = path.match(pathReg);
    // const pathName = (match && match.length>1)?match[1]:'';
    // const pathArr = ['pages-analysis','pull-new-detail','flow-analysis','pull-new','supply-market-data','juece','c2tradedaily','monitor-board','self-analyze','monitor-poi-detail','manager-table-cpoistore'];
    // let isNewProduct = false;
    // if(pathName && !pathArr.includes(pathName)){
    //   isNewProduct = true;
    // }
    console.log( 'didmount',document.getElementsByTagName('body') );
  }
  componentDidUpdate(prevProps, prevState) {
    console.log( 'didUpdate' );
  }
  onClick() {
      this.setState( { num: this.state.num + 1 } );
  }

  render() {
    console.log('render')
      return (
          <div onClick={ () => this.onClick() }>
              <h1>number: {this.state.num}</h1>
              <button>add</button>
              {this.state.num % 2 === 0 && <h2>test</h2>}
              <WelcomeFunc num={this.state.num}></WelcomeFunc>
          </div>
      );
  }
}
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open:true, count:0};
    this.change = () => {
      this.setState({open: !Boolean(this.state.open), count:this.state.count+1})
    }
    
}
  
componentDidMount() {
  var obj = {
    "body": [
      {
        "dataIndex": "gross_income_roi_ratio",
        "title": "毛利额优惠ROI",
        "type": "percent",
        "column-type": "normal"
      },
      {
        "dataIndex": "init_gross_income_ratio",
        "title": "初始毛利率",
        "type": "float",
        "column-type": "normal"
      },
      {
        "dataIndex": "real_gross_ratio",
        "title": "实收毛利率",
        "type": "float",
        "column-type": "normal"
      },
      {
        "dataIndex": "ARPU",
        "title": "ARPU",
        "type": "float",
        "column-type": "normal"
      },
      {
        "dataIndex": "tablecategory_orderratio",
        "title": "餐桌品类订单量占比",
        "type": "percent",
        "column-type": "normal"
      },
      {
        "dataIndex": "community_orderratio",
        "title": "小区订单占比",
        "type": "percent",
        "column-type": "normal"
      },
      {
        "dataIndex": "sku_init_gross_income_amt",
        "title": "商品初始毛利额",
        "type": "float",
        "column-type": "normal"
      },
      {
        "dataIndex": "init_gross_income_amt",
        "title": "初始毛利额",
        "type": "float",
        "column-type": "normal"
      },
      {
        "dataIndex": "sku_real_gross_income_ratio",
        "title": "商品实收毛利率",
        "type": "percent",
        "column-type": "normal"
      },
      {
        "dataIndex": "sku_sale_amt_per_order",
        "title": "商品单均销售额",
        "type": "float",
        "column-type": "normal"
      },
      {
        "dataIndex": "sale_amt_roi_ratio",
        "title": "销售额优惠ROI",
        "type": "percent",
        "column-type": "normal"
      },
      {
        "dataIndex": "sale_amt",
        "title": "销售额",
        "type": "float",
        "column-type": "normal"
      }
    ]
  }
  let arr = obj.body.map(item=>{
    item.dataIndex = item.dataIndex.toLocaleUpperCase();
    return item;
  })
  console.log(JSON.stringify(arr))
  // for ( let i = 0; i < 100; i++ ) {
  //     this.setState( { count: this.state.count + 1 } );
  //     console.log( this.state.count ); 
  // }
  // for ( let i = 0; i < 100; i++ ) {
  //   this.setState( prevState => {
  //       console.log( prevState.count );
  //       return {
  //         count: prevState.count + 1
  //       }
  //   } );
  // }
}

  render() {
      return (
          <div>
              {/* <Welcome name="Sara" />
              <Welcome name="Cahal" /> */}
              <Welcome name={this.state.count} />
              {/* <Counter></Counter> */}
              <h1>Hello,World! {this.state.count}</h1>
              <button onClick={this.change} className="button">改变</button>
              {console.log(this.state.open,'this.state.open')}
              {this.state.open && <div>123</div>}
          </div>
      );
  }
}

ReactDOM.render(
  <App></App>,
  document.getElementById('root')
);
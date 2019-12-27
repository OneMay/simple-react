import ReactDOM from 'react-dom';
import React from 'react';
// import './index.scss';
import 'antd/dist/antd.css';
import ImgCompare from './component/img-compare';
import "babel-polyfill"
import {decimalAndPercent} from './utils';


class App extends React.Component {
  render() {
      return <ImgCompare></ImgCompare>;
  }
}

ReactDOM.render(
  <App></App>,
  document.getElementById('root')
);
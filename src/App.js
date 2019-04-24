import React, { Component } from 'react';
import './App.css';
import { Select, Button, Radio, Row, Col, Card, Spin } from 'antd';
import axios from 'axios';

import foodz from './foodz_logo.png'
import yelp from './yelp.png'

import stars0 from './yelp_stars/web_and_ios/large/large_0@3x.png'
import stars1 from './yelp_stars/web_and_ios/large/large_1@3x.png'
import stars2 from './yelp_stars/web_and_ios/large/large_1_half@3x.png'
import stars3 from './yelp_stars/web_and_ios/large/large_2@3x.png'
import stars4 from './yelp_stars/web_and_ios/large/large_2_half@3x.png'
import stars5 from './yelp_stars/web_and_ios/large/large_3@3x.png'
import stars6 from './yelp_stars/web_and_ios/large/large_3_half@3x.png'
import stars7 from './yelp_stars/web_and_ios/large/large_4@3x.png'
import stars8 from './yelp_stars/web_and_ios/large/large_4_half@3x.png'
import stars9 from './yelp_stars/web_and_ios/large/large_5@3x.png'

const starsArr = [
    stars0,
    stars0,
    stars1,
    stars2,
    stars3,
    stars4,
    stars5,
    stars6,
    stars7,
    stars8,
    stars9
];

const { Option, OptGroup } = Select;
const { Meta } = Card;

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const URL = process.env.REACT_APP_URL;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      distance: '15000',
      price: '2',
      lon: 0,
      lat: 0,
      submitted: false,
      empty: false,
      name: null,
      address: null,
      address2: null,
      category: null,
      price_pt: null,
      stars: null,
      num_reviews: null,
      yelp_link: null,
      img_url: null,
      loading: false,
     };

    this.onClick = this.onClick.bind(this);
    this.onChangeDistance = this.onChangeDistance.bind(this);
    this.onChangePrice = this.onChangePrice.bind(this);
  }


  onClick() {
    const params = {
      price: this.state.price,
      distance: this.state.distance,
      lon: this.state.lon,
      lat: this.state.lat,
    };

    this.setState({
      loading: true,
      submitted: false
    })

    axios.post(URL, {params})
      .then(res => {
        if (res.data.businesses.length > 0){
          let last_location_line = res.data.businesses[0].location.display_address.length - 1
          this.setState({
            name: res.data.businesses[0].name,
            address: res.data.businesses[0].location.display_address[0],
            address2: res.data.businesses[0].location.display_address[last_location_line],
            category: res.data.businesses[0].categories[0].title,
            price_pt: res.data.businesses[0].price,
            stars: res.data.businesses[0].rating,
            num_reviews: res.data.businesses[0].review_count,
            yelp_link: res.data.businesses[0].url,
            img_url: res.data.businesses[0].image_url,
            empty: false,
            submitted: true,
            loading: false
          })
        }
        else {
          this.setState({
            empty: true,
            submitted: true,
            loading: false
          })
        }
      });
  }

  onChangeDistance(e) {
    this.setState({
      distance: e.target.value
    });
  }

  onChangePrice(e) {
    this.setState({
      price: e.target.value
    });
  }

  componentDidMount() {
  document.title = 'foodz'

  navigator.geolocation.getCurrentPosition(position => {
    this.setState({ lat: position.coords.latitude, lon: position.coords.longitude });
  }, err => console.log(err)
  );
}


  render() {
    return (
      <div className='App'>
        <div className='logo'>
          <img src={foodz} style={{height:'130px'}} />
        </div>
        <div className='features'>

          <div style={{marginBottom: '30px'}}>
            <RadioGroup onChange={this.onChangeDistance} defaultValue='15000' buttonStyle='solid'>
              <RadioButton value='1500'>Walking</RadioButton>
              <RadioButton value='15000'>Driving</RadioButton>
            </RadioGroup>

            <RadioGroup onChange={this.onChangePrice} defaultValue='2' buttonStyle='solid' style={{marginLeft: '20px', marginRight: '20px'}}>
              <RadioButton value='1'>$</RadioButton>
              <RadioButton value='2'>$$</RadioButton>
              <RadioButton value='3'>$$$</RadioButton>
              <RadioButton value='4'>$$$$</RadioButton>
            </RadioGroup>

            <Button onClick={this.onClick}>GO</Button>
          </div>

          <div style={{marginTop: '30px'}}>
          {/* Hacky fix */}
          </div>

        </div>
        {this.state.loading ?
          <div className='result' style={{top:'50%'}}>
            <Spin size="large" />
          </div>
        :
          null
        }

        {!this.state.submitted ?
          null
        :
          <div className='result'>
            <Card
              style={{ width: 600, height:250, left:'50%', transform: 'translate(-50%, 0%)', textAlign: 'left', backgroundColor:'white'}}
              bodyStyle={{padding:20}}
              bordered={true}
            >
              {this.state.empty ?
                <div style={{textAlign:'center'}}>
                  <h2>No matching entries were found.</h2>
                </div>
              :
                <>
                  <Row gutter={10} style={{height: '100%'}}>
                    <Col span={9} style={{height: '100%'}}>
                      <img style={{height: 200, width: 200, borderRadius: 10}} object-fit='cover' src={this.state.img_url} />
                    </Col>
                    <Col span={15} style={{paddingLeft:20, paddingTop:5}}>
                      {this.state.name.length < 30 ?
                        <h2 style={{marginBottom:7}}>{this.state.name}</h2>
                      :
                        <h3 style={{marginBottom:7}}>{this.state.name}</h3>
                      }
                      <p style={{marginBottom:7}}>{this.state.category} &nbsp;&bull;&nbsp; {this.state.price_pt}</p>
                      <p style={{marginBottom:0}}>{this.state.address}</p>
                      <p style={{marginBottom:7}}>{this.state.address2}</p>
                      <img src={starsArr[2*this.state.stars]} style={{height:'24px'}}/>
                      <p style={{marginBottom:0}}>Based on {this.state.num_reviews} reviews</p>
                    </Col>
                  </Row>

                  <div style={{textAlign: 'right', position: 'absolute', right:0, bottom:0}}>
                    <a href={this.state.yelp_link} target='_blank'><img src={yelp} style={{height:'60px'}} /></a>
                  </div>
                </>
              }
            </Card>
          </div>
        }
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import logo from '../../resources/safeways.png'

class HomePage extends React.Component {

  render() {
    return (
      <div className="home-content-box">
      <img src={logo}/>
      <h1 className="title">SafeWays</h1>
      <div className="desc-box">
        <p className="desc">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam,
        </p>
      </div>
      <svg className="go-button" viewBox="0 0 16 16" fill="url(#lg)" xmlns="http://www.w3.org/2000/svg">
        <linearGradient id="lg">
          <stop id="color1" offset={0} />
          <stop id="color2" offset={1} />
        </linearGradient>
        <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-11.5.5a.5.5 0 0 1 0-1h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5z" />
      </svg>
    </div>
    
    );
  }
}

export default HomePage;
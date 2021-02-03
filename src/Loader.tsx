import classes from '*.module.css';
import * as React from 'react';
import './loader.css';

export default () => {
  return <div className='Wrapper'>
    <div className='Loader'>
      <img src='loader.png' className='image' alt='loader' />
    </div>
  </div>
};
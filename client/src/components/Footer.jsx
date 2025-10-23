import React from 'react';
import './Footer.scss';

const Footer = ({ onStartOver }) => {
  return (
    <footer className="footer">
      <button onClick={onStartOver} className="start-over-button">Start Over</button>
      <p>Created by Md. Asad Chowdhary</p>
      <p>Student of Dept. of CSE</p>
      <p>Asian University of Bangladesh</p>
      <p>Batch: 69B</p>
    </footer>
  );
};

export default Footer;
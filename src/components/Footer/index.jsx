import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import FooterBg from 'src/assets/images/footer.png';
import BapeLogo from 'src/assets/images/logo.svg';
import { GITHUB_LINK, MEDIUM_LINK, TELEGRAM_LINK, TWITTER_LINK } from 'src/constants';
import { useSound } from 'use-sound';

const Footer = () => {
  return (
    <footer id="f">
      <img src={FooterBg} />
      <div className="ct">
      <ul>
          <li><a href={TELEGRAM_LINK} target="_blank"><i className="fab fa-telegram-plane"></i></a></li>
          <li><a href={TWITTER_LINK} target="_blank"><i className="fab fa-twitter"></i></a></li>
          <li><a href={GITHUB_LINK} target="_blank"><i className="fab fa-github"></i></a></li>
          {/* <li><a href={MEDIUM_LINK} target="_blank"><i className="fab fa-medium"></i></a></li> */}
        </ul>
        <img src={BapeLogo} className="footer-logo" alt="BAPES Logo" />
        <p>Binance Ape Station © 2022. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

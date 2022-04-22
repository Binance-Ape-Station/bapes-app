import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import BapeLogo from 'src/assets/images/logo.svg';
import { GITHUB_LINK, MEDIUM_LINK, PCS_BUY_LINK, PKP_BUY_LINK, TELEGRAM_LINK, TWITTER_LINK } from 'src/constants';

const Header = () => {
  const body = document.querySelector('body');

  const addFx = useCallback(() => {
    const { scrollTop } = body;
    scrollTop > 0 ? body.classList.add('fx') : body.classList.remove('fx');
  });

  useEffect(() => {
    body.addEventListener('resize', addFx);
    body.addEventListener('scroll', addFx);
    body.addEventListener('load', addFx);

    return () => {
      body.removeEventListener('resize', addFx);
      body.removeEventListener('scroll', addFx);
      body.removeEventListener('load', addFx);
    };
  }, [addFx]);

  let nav = null;

  const toggleNav = () => body.classList.toggle('onav');
  const closeNav = () => body.classList.remove('onav');

  useLayoutEffect(() => {
    nav = document.querySelector('[data-nav]');
  }, []);

  useEffect(() => {
    if (!nav) return;
    nav.addEventListener('click', toggleNav);

    return () => {
      nav.removeEventListener('click', toggleNav);
    };
  }, [toggleNav, nav]);

  return (
    <header id="h">
      <div className="t">
      <ul>
          <li><a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer"><i className="fab fa-telegram-plane"></i></a></li>
          <li><a href={TWITTER_LINK} target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a></li>
          <li><a href={GITHUB_LINK} target="_blank" rel="noopener noreferrer"><i className="fab fa-github"></i></a></li>
          {/* <li><a href={MEDIUM_LINK} target="_blank"><i className="fab fa-medium"></i></a></li> */}
      </ul>
      </div>

      <div className="b">
        <div className="l">
          <Link to="/" className="lo">
            <img src={BapeLogo} alt="BAPES Logo" />
          </Link>
        </div>

        <div className="r">
          <nav id="n">
          <ul>
                <li><Link to="/" onClick={closeNav}>Home</Link></li>
                <li><Link to="/propulsor" onClick={closeNav}>Propulsor 🐵</Link></li>
                <li><HashLink smooth to="/#faq" onClick={closeNav}>FAQ</HashLink></li>
                <li><a href={TELEGRAM_LINK} target="_blank" onClick={closeNav}>Telegram</a></li>
                <li>
                  <a href={PCS_BUY_LINK} target="_blank">
                    <span>
                      Buy BAPES 🍌
                    </span>
                  </a>
                </li>
            </ul>
          </nav>
          <button data-nav>
            <i className="fal fa-bars"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

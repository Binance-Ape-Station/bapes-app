import React from 'react';
import { Switch, Route, topbar } from 'react-router-loading';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Home from 'src/pages/Home';
import Staking from 'src/pages/Staking';

import SoundHelper from 'src/components/SoundHelper';

import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

import Web3ReactManager from 'src/components/Web3ReactManager';
import PropulsionManager from 'src/components/PropulsionManager';
import WalletManager from 'src/components/Modals/WalletManager';

import BlockUpdater from 'src/components/Updaters/BlockUpdater';
import TransactionUpdater from 'src/components/Updaters/TransactionUpdater';
import { useLayoutEffect } from 'react';
import { useState } from 'react';

topbar.config({
  barColors: {
      0: '#f1c511',
      .3: '#f6a308',
      1.0: '#fc8401'
  },
});

const LoadingScreen = () => <></>;

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const onLoadingFinished = () => isLoading && setIsLoading(false);

  const { pathname } = useLocation();

  useLayoutEffect(() => {
    setIsLoading(true);

    document.body.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return (
    <>
      <Toaster
        position={'bottom-center'}
        reverseOrder={false}
        toastOptions={{
          style: { background: 'rgb(31, 33, 37)', color: '#fff' },
          duration: 3000,
          loading: { duration: 900000 },
          success: { duration: 3000 },
          error: { duration: 4000 },
        }}
      />

      <BlockUpdater />
      <TransactionUpdater />

      <SoundHelper />

      {!isLoading && <Header />}

      <Web3ReactManager>
        <PropulsionManager>
            <Switch loadingScreen={LoadingScreen} isLoading={isLoading} maxLoadingTime={2500}>
              <Route exact path="/propulsor" loading>
                <Staking onLoadingFinished={onLoadingFinished} />
              </Route>

              <Route loading>
                <Home onLoadingFinished={onLoadingFinished} />
              </Route>
            </Switch>
        </PropulsionManager>
      </Web3ReactManager>

      <WalletManager />

      {!isLoading && <Footer />}
    </>
  );
};

export default App;

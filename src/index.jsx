import 'url-search-params-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Modal from 'react-modal';
import { Provider } from 'react-redux';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import App from 'src/pages/App';
import { store } from './store';
import { NetworkContextName } from './constants';
import getLibrary from './utils/getLibrary';

import 'src/styles/app.css';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

if ('ethereum' in window) {
  window.ethereum.autoRefreshOnNetworkChange = false;
}

(() => {
  ReactDOM.render(
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>,
    document.getElementById('app')
  );
})();

Modal.setAppElement('#app');

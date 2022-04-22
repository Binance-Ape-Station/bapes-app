import { Token } from '@uniswap/sdk';
import { injected, walletconnect } from 'src/connectors';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 3.02;

export const BAPES_API_SUMMARY_ENDPOINT = 'https://api.bapes.army/front/token';
export const BAPES_API_LOGS_ENDPOINT = 'https://api.bapes.army/front/logs/{fromBlock}/{contractAddr}';

export const BAPES_TOKEN_TOTAL_SUPPLY = 200000000;
export const BAPES_TOKEN_DECIMALS = 8;

export const BAPES_TOKEN = {
  [56]: '',
  [97]: '0x0c8a0323B4BA4F5A13Bce7cdb3C01fF01Cc468a0',
};

export const BAPES_PROPULSOR = {
  [56]: '',
  [97]: '0x5C0FB91db2d72B61e12cD83645b44EFFb1dB1D5b',
};

export const getBapesToken = chainId => {
  return new Token(chainId, BAPES_TOKEN[chainId], 18, 'BAPES', 'Binance Ape Station');
};

export const SUPPORTED_WALLETS = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true,
  }
};

export const NetworkContextName = 'NETWORK';

export const TELEGRAM_LINK = 'https://t.me/binanceapestation';
export const TWITTER_LINK = 'https://twitter.com/bapes_crypto';
export const GITHUB_LINK = 'https://github.com/Binance-Ape-Station';
export const MEDIUM_LINK = '#';

export const PKP_BUY_LINK = 'https://www.pinksale.finance/#/launchpads/all?chain=BSC';
export const PCS_BUY_LINK = 'https://exchange.pancakeswap.finance/#/swap?inputCurrency=0x';

export const DEXT_LINK = '#';
export const PROPULSION_DEMO_LINK = '#';
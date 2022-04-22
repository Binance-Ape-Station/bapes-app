import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { NetworkConnector } from './NetworkConnector';

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL

export const NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID)

if (typeof NETWORK_URL === 'undefined') {
  throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
}

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL }
})

let networkLibrary
export function getNetworkLibrary() {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider))
}

export const injected = new InjectedConnector({
  supportedChainIds: [56, 97]
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { 56: NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000,
  supportedChainIds: [56]
})
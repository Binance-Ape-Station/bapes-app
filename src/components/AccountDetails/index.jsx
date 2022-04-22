import React from 'react';
import styled from 'styled-components';
import { SUPPORTED_WALLETS } from 'src/constants';
import { injected, walletconnect } from 'src/connectors';
import { ExternalLink as LinkIcon } from 'react-feather';
import { getEtherscanLink, shortenAddress } from 'src/utils';
import { useActiveWeb3React } from 'src/hooks';

import CloseSvg from 'src/assets/images/x.svg';
import WalletConnectIcon from 'src/assets/images/providers/walletConnectIcon.svg';

import Identicon from 'src/components/Identicon';

import Copy from './Copy';

const CloseIcon = styled.div`
  z-index: 9999;
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding: 1rem 1rem;
  font-weight: 500;
`;

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const InfoCard = styled.div`
  padding: 1rem;
  border: 1px solid rgb(64, 68, 79);
  border-radius: 20px;
  position: relative;
  display: grid;
  grid-row-gap: 12px;
  margin-bottom: 20px;
`;

const AccountGroupingRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  font-weight: 400;
  color: white;

  div {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }
`;

const AccountSection = styled.div`
  background-color: rgb(31, 33, 37);
  padding: 0 1rem;
`;

const YourAccount = styled.div`
  h5 {
    margin: 0 0 1rem 0;
    font-weight: 400;
  }

  h4 {
    margin: 0;
    font-weight: 500;
  }
`;

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;
  color: white;

  font-weight: 500;
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const AddressLink = styled.a`
  font-size: 0.825rem;
  color: #888d9b;
  margin-left: 1rem;
  font-size: 0.825rem;
  display: flex;
  :hover {
    color: #565a69;
  }
`;

const WalletName = styled.div`
  width: initial;
  font-size: 0.825rem;
  font-weight: 500;
  color: #888d9b;
`;

const IconWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`;

const LowerSection = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 1.5rem;
  flex-grow: 1;
  overflow: auto;
  background-color: rgb(44, 47, 54);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  h5 {
    margin: 0;
    font-weight: 400;
    color: #888d9b;
  }
`;

export default function AccountDetails({ toggleWalletModal, openOptions }) {
  const { chainId, account, connector } = useActiveWeb3React();

  function formatConnectorName() {
    const { ethereum } = window;
    const isMetaMask = !!(ethereum && ethereum.isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(k => SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK')))
      .map(k => SUPPORTED_WALLETS[k].name)[0];
    return <WalletName>Connected with {name}</WalletName>;
  }

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={16}>
          <Identicon />
        </IconWrapper>
      );
    }
    if (connector === walletconnect) {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt="wallet connect logo" />
        </IconWrapper>
      );
    }
    return null;
  }

  return (
    <>
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <img src={CloseSvg} />
        </CloseIcon>
        <HeaderRow>Account</HeaderRow>
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow>
                {formatConnectorName()}
                <div>
                  {connector !== injected && connector !== walletlink && (
                    <button
                      variant="action"
                      style={{ fontSize: '.825rem', fontWeight: 400 }}
                      onClick={() => {
                        connector.close();
                      }}>
                      Disconnect
                    </button>
                  )}
                  <button
                    variant="action"
                    style={{ fontSize: '.825rem', fontWeight: 400 }}
                    onClick={() => {
                      openOptions();
                    }}>
                    Change
                  </button>
                </div>
              </AccountGroupingRow>
              <AccountGroupingRow id="web3-account-identifier-row">
                <AccountControl>
                  <>
                    <div>
                      {getStatusIcon()}
                      <p> {account && shortenAddress(account)}</p>
                    </div>
                  </>
                </AccountControl>
              </AccountGroupingRow>
              <AccountGroupingRow>
                <>
                  <AccountControl>
                    <div>
                      {account && (
                        <Copy toCopy={account}>
                          <span style={{ marginLeft: '4px' }}>Copy Address</span>
                        </Copy>
                      )}
                      {chainId && account && (
                        <AddressLink hasENS={false} isENS={false} href={getEtherscanLink(chainId, account, 'address')} target="_blank">
                          <LinkIcon size={16} />
                          <span style={{ marginLeft: '4px' }}>View on Etherscan</span>
                        </AddressLink>
                      )}
                    </div>
                  </AccountControl>
                </>
              </AccountGroupingRow>
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </UpperSection>
    </>
  );
}

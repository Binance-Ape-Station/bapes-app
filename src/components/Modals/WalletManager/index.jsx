import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import MetamaskIcon from 'src/assets/images/providers/metamask.png';
import CloseSvg from 'src/assets/images/x.svg';
import AccountDetails from 'src/components/AccountDetails';
import { injected } from 'src/connectors';
import { SUPPORTED_WALLETS } from 'src/constants';
import usePrevious from 'src/hooks/usePrevious';
import { CLOSE_MODAL, OPEN_MODAL } from 'src/store';
import styled from 'styled-components';

import Option from './Option';
import PendingView from './PendingView';

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

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: rgb(31, 33, 37);
  border-radius: 20px;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  padding: 1rem 1rem;
  font-weight: 500;
`;

const ContentWrapper = styled.div`
  background-color: rgb(44, 47, 54);
  padding: 2rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
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

const Blurb = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
`;

const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`;

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};

const WalletManager = () => {
  const dispatch = useDispatch();

  const { active, account, connector, activate, error } = useWeb3React();

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState();

  const [pendingError, setPendingError] = useState(false);

  const previousAccount = usePrevious(account);

  const walletModalOpen = useSelector(state => state.modals.walletManager.show);

  const toggleWalletModal = () => {
    if (walletModalOpen) dispatch({ type: CLOSE_MODAL, name: 'walletManager' });
    else dispatch({ type: OPEN_MODAL, name: 'walletManager' });
  };

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal();
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen]);

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [walletModalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious]);

  const tryActivation = async connector => {
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return SUPPORTED_WALLETS[key].name;
      }
      return true;
    });

    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true).catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true);
        }
      });
  };

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask;
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key];
      // check for mobile options
      if (isMobile) {

        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector);
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={require('src/assets/images/providers/' + option.iconName)}/>
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return <Option id={`connect-${key}`} key={key} color="#E8831D" header="Install Metamask" subheader={null} link="https://metamask.io/" icon={MetamaskIcon} />;
          }
          return null; // dont want to return install twice
        }
        // don't return metamask if injected provider isn't metamask
        if (option.name === 'MetaMask' && !isMetamask) {
          return null;
        }
        // likewise for generic
        if (option.name === 'Injected' && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector ? setWalletView(WALLET_VIEWS.ACCOUNT) : !option.href && tryActivation(option.connector);
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} // use option.descriptio to bring back multi-line
            icon={require('src/assets/images/providers/' + option.iconName)}/>
        )
      );
    });
  }

  function getModalContent() {
    if (error) {
      return (
        <>
          <UpperSection>
            <CloseIcon onClick={toggleWalletModal}>
              <img src={CloseSvg} />
            </CloseIcon>
            <HeaderRow>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error connecting'}</HeaderRow>
            <ContentWrapper>
              {error instanceof UnsupportedChainIdError ? <h5>Please connect to the appropriate Ethereum network.</h5> : 'Error connecting. Try refreshing the page.'}
            </ContentWrapper>
          </UpperSection>
        </>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return <AccountDetails toggleWalletModal={toggleWalletModal} openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)} />;
    }
    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <img src={CloseSvg} />
        </CloseIcon>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <HeaderRow color="blue">
            <HoverText
              onClick={() => {
                setPendingError(false);
                setWalletView(WALLET_VIEWS.ACCOUNT);
              }}>
              <i className="fal fa-arrow-left"></i> Back
            </HoverText>
          </HeaderRow>
        ) : (
          <HeaderRow>
            <HoverText>Connect a wallet</HoverText>
          </HeaderRow>
        )}
        <ContentWrapper>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView connector={pendingWallet} error={pendingError} setPendingError={setPendingError} tryActivation={tryActivation} />
          ) : (
            <OptionGrid>{getOptions()}</OptionGrid>
          )}
          {walletView !== WALLET_VIEWS.PENDING && (
            <Blurb>
              <span>New to BNB Smart Chain? &nbsp;</span>{' '}
              <a href="https://docs.binance.org/smart-chain/wallet/metamask.html" target="_blank" rel="noreferrer" className="link">
                Learn more about wallets
              </a>
            </Blurb>
          )}
        </ContentWrapper>
      </UpperSection>
    );
  }

  return (
    <Modal isOpen={walletModalOpen} onRequestClose={toggleWalletModal}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  );
};

export default WalletManager;

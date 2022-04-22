import React from 'react';
import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { BigNumber } from '@ethersproject/bignumber';
import { JSBI, Percent } from '@uniswap/sdk';

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value) {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

const ETHERSCAN_PREFIXES = {
  56: '',
  97: 'testnet.',
};

export function getEtherscanLink(chainId, data, type) {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}bscscan.com`;

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`;
    }
    case 'token': {
      return `${prefix}/token/${data}`;
    }
    case 'block': {
      return `${prefix}/block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address, chars = 4) {
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

export function shortenHash(hash, chars = 4) {
  return `${hash.substring(0, chars + 2)}`;
}

// add 10%
export function calculateGasMargin(value) {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000));
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num) {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000));
}

export function calculateSlippageAmount(value, slippage) {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`);
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ];
}

// account is not optional
export function getSigner(library, account) {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library, account) {
  return account ? getSigner(library, account) : library;
}

// account is optional
export function getContract(address, ABI, library, account) {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account));
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export const TX_SUBJECTS = {
  APPROVE: 'Approve',
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdraw',
  MIGRATE: 'Migrate',
};

export function getInitialMsg(chainId, hash, subject) {
  switch (subject) {
    case TX_SUBJECTS.APPROVE:
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <a href={getEtherscanLink(chainId, hash, 'transaction')} target="_blank">
              Approval in progress... <span style={{ fontSize: '0.85rem' }}>#{shortenHash(hash)}</span> <i className="fal fa-external-link-alt" style={{ marginLeft: 2 }}></i>
            </a>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f3c764' }}>Don't forget to deposit once confirmed!</div>
        </div>
      );
    case TX_SUBJECTS.DEPOSIT:
      return (
        <a href={getEtherscanLink(chainId, hash, 'transaction')} target="_blank">
          Deposit in progress... <span style={{ fontSize: '0.85rem' }}>#{shortenHash(hash)}</span> <i className="fal fa-external-link-alt" style={{ marginLeft: 2 }}></i>
        </a>
      );
    case TX_SUBJECTS.WITHDRAW:
      return (
        <a href={getEtherscanLink(chainId, hash, 'transaction')} target="_blank">
          Withdraw in progress... <span style={{ fontSize: '0.85rem' }}>#{shortenHash(hash)}</span> <i className="fal fa-external-link-alt" style={{ marginLeft: 2 }}></i>
        </a>
      );
    case TX_SUBJECTS.MIGRATE:
      return (
        <a href={getEtherscanLink(chainId, hash, 'transaction')} target="_blank">
          Migration in progress... <span style={{ fontSize: '0.85rem' }}>#{shortenHash(hash)}</span> <i className="fal fa-external-link-alt" style={{ marginLeft: 2 }}></i>
        </a>
      );
  }
}

export function getSuccessMsg(chainId, hash, subject) {
  switch (subject) {
    case TX_SUBJECTS.APPROVE:
      return (
        <a href={getEtherscanLink(chainId, hash, 'transaction')} target="_blank">
          Successfully approved <span style={{ fontSize: '0.85rem' }}>#{shortenHash(hash)}</span> <i className="fal fa-external-link-alt" style={{ marginLeft: 2 }}></i>
        </a>
      );
    case TX_SUBJECTS.DEPOSIT:
      return (
        <a href={getEtherscanLink(chainId, hash, 'transaction')} target="_blank">
          Successfully deposited <span style={{ fontSize: '0.85rem' }}>#{shortenHash(hash)}</span> <i className="fal fa-external-link-alt" style={{ marginLeft: 2 }}></i>
        </a>
      );
    case TX_SUBJECTS.WITHDRAW:
      return (
        <a href={getEtherscanLink(chainId, hash, 'transaction')} target="_blank">
          Successfully withdrawn <span style={{ fontSize: '0.85rem' }}>#{shortenHash(hash)}</span> <i className="fal fa-external-link-alt" style={{ marginLeft: 2 }}></i>
        </a>
      );
    case TX_SUBJECTS.MIGRATE:
      return (
        <a href={getEtherscanLink(chainId, hash, 'transaction')} target="_blank">
          Successfully migrated <span style={{ fontSize: '0.85rem' }}>#{shortenHash(hash)}</span> <i className="fal fa-external-link-alt" style={{ marginLeft: 2 }}></i>
        </a>
      );
  }
}

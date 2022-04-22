import { reduce } from 'jazzicon/colors';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ADD_TRANSACTION } from 'src/store';
import { useActiveWeb3React } from '.';

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder() {
  const { chainId, account } = useActiveWeb3React();
  const dispatch = useDispatch();

  return useCallback(
    (response, subject, { approval } = {}) => {
      if (!account) return;
      if (!chainId) return;

      const { hash } = response;
      if (!hash) {
        throw Error('No transaction hash found.');
      }
      dispatch({ type: ADD_TRANSACTION, hash, from: account, chainId, subject, approval });
    },
    [dispatch, chainId, account]
  );
}

// returns all the pending transactions for the current chain
export function usePendingTransactions() {
  const { chainId } = useActiveWeb3React();
  const transactions = useSelector(state => state.transactions);

  return useMemo(() => Object.fromEntries(Object.entries(transactions[chainId]).filter(([hash, tx]) => tx && !tx.receipt)), [transactions, chainId]);
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx) {
  return new Date().getTime() - tx.addedTime < 86_400_000;
}

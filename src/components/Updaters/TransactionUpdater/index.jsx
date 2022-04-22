import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from 'src/hooks';
import { useBlockNumber } from 'src/hooks/useBlockNumber';
import { CHECKED_TRANSACTION, FINALIZE_TRANSACTION } from 'src/store';
import toast from 'react-hot-toast';
import { getSuccessMsg } from 'src/utils';

export function shouldCheck(lastBlockNumber, tx) {
  if (tx.receipt) return false;
  if (!tx.lastCheckedBlockNumber) return true;
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}

export default function TransactionUpdater() {
  const { chainId, library } = useActiveWeb3React();

  const lastBlockNumber = useBlockNumber();

  const dispatch = useDispatch();
  const state = useSelector(state => state.transactions);

  const transactions = chainId ? state[chainId] ?? {} : {};

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return;

    Object.keys(transactions)
      .filter(hash => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach(hash => {
        library
          .getTransactionReceipt(hash)
          .then(receipt => {
            if (receipt) {
              dispatch({
                type: FINALIZE_TRANSACTION,
                chainId,
                hash,
                receipt: {
                  blockHash: receipt.blockHash,
                  blockNumber: receipt.blockNumber,
                  contractAddress: receipt.contractAddress,
                  from: receipt.from,
                  status: receipt.status,
                  to: receipt.to,
                  transactionHash: receipt.transactionHash,
                  transactionIndex: receipt.transactionIndex,
                },
              });

              const tx = transactions[hash];

              const subject = tx?.subject;
              toast.success(getSuccessMsg(chainId, hash, subject), { id: hash });
            } else {
              dispatch({ type: CHECKED_TRANSACTION, chainId, hash, blockNumber: lastBlockNumber });
            }
          })
          .catch(error => {
            console.error(`failed to check transaction hash: ${hash}`, error);
          });
      });
  }, [chainId, library, transactions, lastBlockNumber, dispatch]);

  return null;
}

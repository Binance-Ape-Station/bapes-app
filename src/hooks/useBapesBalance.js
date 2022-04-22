import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { utils } from 'ethers';
import { BAPES_TOKEN } from 'src/constants';
import { SET_BAPES_BALANCE } from 'src/store';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from './index';
import { useTokenContract } from './useContract';

export function useBapesBalance() {
  const { account, chainId } = useActiveWeb3React();

  const dispatch = useDispatch();

  const bapesBalance = useSelector(state => state.app.bapesBalance);

  const bapesTokenContract = useTokenContract(chainId ? BAPES_TOKEN[chainId] : BAPES_TOKEN[ChainId.MAINNET]);

  const refreshBalance = useCallback(async () => {
    if (account && bapesTokenContract) {
      const balanceOf = await bapesTokenContract.balanceOf(account);
      if (!balanceOf) return;

      const balance = parseFloat(utils.formatUnits(balanceOf, 18));
      dispatch({ type: SET_BAPES_BALANCE, balance });
    } else {
      dispatch({ type: SET_BAPES_BALANCE, balance: 0 });
    }
  });

  useEffect(() => {
    refreshBalance();
  }, [account, chainId]);

  return { bapesBalance, refreshBalance };
}

import BinanceApePropulsor from 'contracts/BinanceApePropulsor.json';
import IERC20 from 'contracts/IERC20.json';
import { useMemo } from 'react';
import { getContract } from 'src/utils';

import { useActiveWeb3React } from './index';

// returns null on errors
function useContract(address, ABI, withSignerIfPossible = true) {
  const { library, account } = useActiveWeb3React();

  return useMemo(() => {
    if (!address || !ABI || !library) return null;
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

export function useTokenContract(tokenAddress, withSignerIfPossible) {
  return useContract(tokenAddress, IERC20.abi, withSignerIfPossible);
}

export function usePropulsorContract(propulsorAddress, withSignerIfPossible) {
  return useContract(propulsorAddress, BinanceApePropulsor.abi, withSignerIfPossible);
}

export function useUnifiedVaultContract(
  unifiedVaultAddress,
  withSignerIfPossible
) {
  return useContract(
    unifiedVaultAddress,
    UnifiedVault.abi,
    withSignerIfPossible
  );
}

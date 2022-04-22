import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '.'

export function useBlockNumber() {
  const { chainId } = useActiveWeb3React()

  return useSelector((state) => state.app.blockNumber[chainId ?? -1])
}
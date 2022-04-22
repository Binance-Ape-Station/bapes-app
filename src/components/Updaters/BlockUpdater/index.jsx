import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from 'src/hooks'
import useDebounce from 'src/hooks/useDebounce'
import useIsWindowVisible from 'src/hooks/useIsWindowVisible'
import { SET_BLOCK_NUMBER } from 'src/store'

export default function BlockUpdater() {
  const { library, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState({
    chainId,
    blockNumber: null
  })

  const blockNumberCallback = useCallback(
    (blockNumber) => {
      setState(state => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId, blockNumber }
          return { chainId, blockNumber: Math.max(blockNumber, state.blockNumber) }
        }
        return state
      })
    },
    [chainId, setState]
  )

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined

    setState({ chainId, blockNumber: null })

    library
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch(error => console.error(`Failed to get block number for chainId: ${chainId}`, error))

    library.on('block', blockNumberCallback)
    return () => {
      library.removeListener('block', blockNumberCallback)
    }
  }, [dispatch, chainId, library, blockNumberCallback, windowVisible])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return;
    dispatch({ type: SET_BLOCK_NUMBER, chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber });
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}

import { useEffect } from 'react';
import { SET_IS_PROPELLED } from 'src/store';
import { BAPES_PROPULSOR, BAPES_TOKEN_DECIMALS } from 'src/constants';
import { useActiveWeb3React } from 'src/hooks';
import { usePropulsorContract } from 'src/hooks/useContract';
import { useDispatch } from 'react-redux';
import { utils } from 'ethers';

export default function PropulsionManager({ children }) {
  const dispatch = useDispatch();
  
  const { chainId } = useActiveWeb3React();

  const propulsorContractAddr = BAPES_PROPULSOR[chainId];
  const propulsorContract = usePropulsorContract(propulsorContractAddr);

  const stakerPropelledTopic = propulsorContract.filters.StakerPropelled().topics[0];
  const stakerPropelledFilter = {
    address: propulsorContract.address,
    topics: [stakerPropelledTopic],
  };

  const html = document.querySelector('html');

  const onStakerPropelled = (staker, fuelEarned) => {
    const fuelEarnedFormat = parseFloat(utils.formatUnits(fuelEarned, 18)).toFixed(BAPES_TOKEN_DECIMALS);
    window.dispatchEvent(new CustomEvent('StakerPropelledStart', { detail: { staker, reward: fuelEarnedFormat } }));
    dispatch({ type: SET_IS_PROPELLED, isPropelled: true });

    html.classList.add('win', 'go');

    setTimeout(() => {
      html.classList.remove('win', 'go');

      dispatch({ type: SET_IS_PROPELLED, isPropelled: false });
      window.dispatchEvent(new CustomEvent('StakerPropelledEnd'))
    }, 12000);
  };

  useEffect(() => {
    propulsorContract.on(stakerPropelledFilter, onStakerPropelled);
    return () => propulsorContract.off(stakerPropelledFilter, onStakerPropelled);
  }, [propulsorContract]);

  return children;
}

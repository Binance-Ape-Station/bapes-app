import { SET_MODAL_DATA } from '../mutations';

const initialState = {
  walletManager: { show: false },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_MODAL_DATA:
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          show: action.data.isVisible,
        },
      };
    default:
      return state;
  }
};

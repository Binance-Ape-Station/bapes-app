import { put, takeLatest } from 'redux-saga/effects';
import { CLOSE_MODAL, OPEN_MODAL } from '../actions';
import { SET_MODAL_DATA } from '../mutations';

function* openModal({ name }) {
  yield put({
    type: SET_MODAL_DATA,
    name,
    data: {
      isVisible: true
    },
  });
}

function* closeModal({ name }) {
  yield put({
    type: SET_MODAL_DATA,
    name,
    data: {
      isVisible: false,
    },
  });
}

function* modals() {
  yield takeLatest(OPEN_MODAL, openModal);
  yield takeLatest(CLOSE_MODAL, closeModal);
}

export default modals;

import { spawn } from 'redux-saga/effects';

import modals from './modals';

export default function* rootSaga() {
  yield spawn(modals);
}

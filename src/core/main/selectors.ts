import {RootState} from "../";
import * as constants from './interfaces';
import get from 'lodash/get'

export const _isFirst = (state): Object => {
  return get(state, `${constants.NAME}.isFirst`, false)
};

export const _status = (state): Object => {
  return state[constants.NAME].status;
};

export const _loading = (state): Object => {
  return state[constants.NAME].isLoading;
};

export const _user = (state): Object => {
  return get(state, `${constants.NAME}.user`, null)
};

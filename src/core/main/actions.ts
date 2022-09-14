import {
  createAction,
  createSetTypes,
} from 'utils/actions';

const ISFIRST = createSetTypes('SMCOSMINC_ISFIRST');
const SMUSER = createSetTypes('SMCOSMINC_SMUSER');

const setIsFirst = () => async dispatch => {
  const setLocationAction = {
    setData: () => createAction(ISFIRST.SET, true),
    clearData: () => createAction(ISFIRST.CLEAR, null)
  };
  try {
    dispatch(setLocationAction.setData());
  } catch (e) {
    dispatch(setLocationAction.clearData());
  }
};

const setUser = (data) => async dispatch => {
  const setLocationAction = {
    setData: () => createAction(SMUSER.SET, { data }),
    clearData: () => createAction(SMUSER.CLEAR, null)
  };
  try {
    dispatch(setLocationAction.setData());
  } catch (e) {
    dispatch(setLocationAction.clearData());
  }
};

export {
  ISFIRST,
  SMUSER,
  setIsFirst,
  setUser,
};

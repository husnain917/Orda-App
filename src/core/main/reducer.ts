import {ISFIRST, SMUSER} from './actions';

const InitialState = {
  isFirst: false,
  user: null,
  isLoading: false,
  status: null,
};

export default (state = InitialState, action) => {
  let newState = state;
  switch (action.type) {
    case ISFIRST.SET:
      newState = Object.assign({}, newState, {isFirst: true});
      break;

    case ISFIRST.CLEAR:
      newState = Object.assign({}, newState, {isFirst: false});
      break;

    case SMUSER.SET:
      newState = Object.assign({}, newState, {user: action.data});
      break;

    case SMUSER.CLEAR:
      newState = Object.assign({}, newState, {user: null});
      break;
  }
  return newState;
};

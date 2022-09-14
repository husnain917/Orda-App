import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore';
import { DefaultRootState } from 'react-redux'
import main from './main';
import category from './food';

import {State as FoodState} from "./food/interfaces";
import {State as MainState} from "./main/interfaces";
const appReducer = combineReducers({
  firestore:  firestoreReducer,
  firebase: firebaseReducer,
  [main.constants.NAME]: main.reducer,
  [category.constants.NAME]: category.reducer,
})

const rootReducer = (state, action) => {
  return appReducer(state, action);
}

export class RootState implements DefaultRootState {
  firestore: any;
  firebase: any;
  [main.constants.NAME]: MainState;
  [category.constants.NAME]: FoodState;
}

// export class RootState

export default rootReducer;

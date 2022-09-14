import { applyMiddleware, createStore, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';
import { createLogger } from 'redux-logger';
import { getFirebase } from 'react-redux-firebase'
import reducer from '.';
import FilesystemStorage from '@react-native-community/async-storage';

const firebaseMiddleware = [thunkMiddleware.withExtraArgument({ getFirebase })];
const enhancers = [
  applyMiddleware(
    ...firebaseMiddleware,
    thunkMiddleware,
    promiseMiddleware,
    createLogger({
      collapsed: true,
      // eslint-disable-next-line no-undef
      predicate: () => __DEV__,
    }),
  ),
];

/* eslint-disable no-undef */
const composeEnhancers =
  (__DEV__ &&
    typeof window !== 'undefined' &&
    window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']) ||
  compose;
/* eslint-enable no-undef */

const enhancer = composeEnhancers(...enhancers);

const persistConfig = {
  key: 'root',
  storage: FilesystemStorage,
  blacklist: [],
  timeout: null,
};

const persistedReducer = persistReducer(persistConfig, reducer);
// export const store = createStore(persistedReducer, {}, enhancer);
export const store = createStore(persistedReducer, enhancer);
export const persistor = persistStore(store);

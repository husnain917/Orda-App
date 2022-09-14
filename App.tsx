import {Provider} from 'react-redux';
import React from 'react';
import {  StyleSheet} from 'react-native';
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import { createFirestoreInstance } from 'redux-firestore'
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import '@react-native-firebase/database';
import firebase from '@react-native-firebase/app';
import { enableScreens } from "react-native-screens";
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './src/core/store';
import AppView from './src/modules/AppView';
import { View } from 'react-native';


import {LogBox} from 'react-native';
LogBox.ignoreLogs(['']);

enableScreens();
const rrfProps = {
  firebase: firebase,
  config: {userProfile: 'users'},
  dispatch: store.dispatch,
  createFirestoreInstance
};
const App: React.ReactNode = () => {
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <PersistGate
          loading={
            <View style={ styles.container }>
            </View>
          }
          persistor={persistor}>
          <AppView />
        </PersistGate>
      </ReactReduxFirebaseProvider>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    color: 'white',
  },
});

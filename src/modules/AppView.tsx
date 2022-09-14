import { compose, lifecycle } from 'recompose';
import { Platform, UIManager, StatusBar } from 'react-native';
import { SQIPCore, } from 'react-native-square-in-app-payments';

import AppNavigator from "./navigation/RootNavigation";
import React from "react";

const App: React.FC = () => (<AppNavigator uriPrefix="/app"/>);

export default compose(
  lifecycle({
    UNSAFE_componentWillMount () {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    },
    async componentDidMount () {
      await SQIPCore.setSquareApplicationId('sq0idp-x0MFuJiWiy3evQ33qcQ1Qg');
    }
  }),
)(App);

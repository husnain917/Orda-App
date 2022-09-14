import React from 'react';
import {Easing, Animated} from 'react-native';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import MenuContainer from './Menu';
import FoodMenuScreenContainer from './FoodMenuScreenContainer';
import StartupScreen from '../main';
import FoodDetailViewContainer from "../foodDetail/FoodDetailViewContainer";
import AddCardViewContainer from "../addCard/AddCardViewContainer";
import SuccessPage from "../successPage/successPage";
import ProfileScreen from 'modules/profile/ProfileView';
import HomeViewContainer from 'modules/home/HomeViewContainer';
import InstagramScreen from 'modules/instagram/InstagramView';
import WelcomeScreen from '../welcomeScreen/index';

const AppNavigator = createStackNavigator(
  {
    Main: {
      screen: MenuContainer,
      navigationOptions: { header: null },
    },
    FoodMenuScreen: {
      screen: FoodMenuScreenContainer,
      navigationOptions: {header: null}
    },
    FoodDetailScreen: {
      screen: FoodDetailViewContainer,
      navigationOptions: {header: null}
    },
    CartScreen: {
      screen: AddCardViewContainer,
      navigationOptions: {header: null}
    },
    ProfileScreen: {
      screen: ProfileScreen,
      navigationOptions: {header: null}
    },
    SuccessScreen: {
      screen: SuccessPage,
      navigationOptions: {header: null}
    },
    InstagramScreen: {
      screen: InstagramScreen,
      navigationOptions: {header: null}
    },
    HomeScreen: {
      screen: HomeViewContainer,
      navigationOptions: {header: null},
    },
    WelcomeScreen: {
      screen: WelcomeScreen,
      navigationOptions: {header: null},
    }
  },
  {
    transitionConfig: () => ({
      transitionSpec: {
        duration: 500,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: sceneProps => {
        const {layout, position, scene} = sceneProps;
        const {index} = scene;

        const width = layout.initWidth;
        const translateX = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [width, 0, 0],
        });

        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        });

        return {opacity, transform: [{translateX: translateX}]};
      },
    })
  },
);

const AuthNavigator = createSwitchNavigator(
  {
    StartupScreen,
  },
  {
    initialRouteName: 'StartupScreen'
  },
);

const AppContainer = createSwitchNavigator(
  {
    App: AppNavigator,
    Auth: AuthNavigator,
  },
  {
    initialRouteName: 'Auth',
  },
);

export default createAppContainer(AppContainer);

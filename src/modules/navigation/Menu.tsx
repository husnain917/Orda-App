import {createDrawerNavigator} from 'react-navigation-drawer'
import SideMenuComponent from '../../components/SideMenuComponent';
import {createAppContainer} from "react-navigation";
import HomeViewContainer from "../home/HomeViewContainer";
import FoodMenuViewContainer from "../foodMenu/FoodMenuViewContainer";
import FoodOrdersViewContainer from "../foodOrders/foodOrdersViewContainer";
import FavoritesViewContainer from "../foodFavorites/foodFavoritesViewContainer";
import ProfileScreen from "../profile/ProfileView";
import InstagramScreen from 'modules/instagram/InstagramView';
import WelcomeScreen from 'modules/welcomeScreen/index';

export const routeConfigs = {
  "Home": {screen: HomeViewContainer},
  "FoodMenu": {screen: FoodMenuViewContainer},
  "Orders": {screen: FoodOrdersViewContainer},
  "Profile": {screen: ProfileScreen},
  "Favorites": {screen: FavoritesViewContainer},
  "Instagram": { screen: InstagramScreen },
  "Welcome": { screen: WelcomeScreen }

};

const Menu = createAppContainer(createDrawerNavigator(
  routeConfigs,
  {
    initialRouteName: 'Home',
    drawerWidth: 250,
    unmountInactiveRoutes: true,
    drawerPosition: 'left',
    keyboardDismissMode: 'none',
    drawerType: "slide",
    contentComponent: SideMenuComponent,
  }
));

export default Menu;

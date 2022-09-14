import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Image, ImageBackground, Platform, View, TouchableOpacity } from "react-native";
import { Text, List, ListItem, Left, Body } from "native-base";
import colors from '../themes/dark/colors';
import { useSelector } from "react-redux";
import { useEffect } from 'react';
import Icon from "./Icon";
import foodCore from "../core/food";
import get from 'lodash/get'

const SideMenu = ({ navigation }) => {
  const currentUser = useSelector(({ firebase: { auth } }) => auth);
  const appSettings = useSelector(state => foodCore.selectors.getAppSettings(state));

  let [logoUrl, setLogoUrl] = useState('')
  let [menuBackgroundColor, setMenuBackgroundColor] = useState('white')

  let [routes, setRoutes] = useState([])

  const action = (data) => {
    navigation.closeDrawer();
    if (data.push) {
      navigation.push(data.route, { origin: 'menu' });
    } else {
      navigation.navigate(data.route, { origin: 'menu' })
    }
  }

  const buildRoute = (appSettings) => {
    const hideLocationsScreen = get(appSettings, 'theme.hideLocationsScreen')
    const welcomePage = get(appSettings, 'apps.apps-about-us')
    const routesInit = [
      { testID: "menu-reorder", displayName: "Reorder", route: "Orders", icon: "autorenew", iconModel: 'MaterialCommunityIcons', key: "orders", defaultExist: true },
      { testID: "menu-loyalty", displayName: "Get Rewards", route: "ProfileScreen", icon: "gift-outline", iconModel: 'MaterialCommunityIcons', key: "profile", defaultExist: true, push: true },
    ];

    // locations page?
    if (hideLocationsScreen) {
      routesInit.unshift({ testID: "menu-locations", displayName: "Order Now", route: "FoodMenu", icon: "map-marker-multiple-outline", iconModel: 'MaterialCommunityIcons', defaultExist: true })
    }
    else {
      routesInit.unshift({ testID: "menu-locations", displayName: "Locations", route: "Home", icon: "map-marker-multiple-outline", iconModel: 'MaterialCommunityIcons', defaultExist: true })
    }

    // show instagram?
    const showInstagram = get(appSettings, 'apps.apps-instagram.connected')
    if (showInstagram) {
      routesInit.push({ testID: "menu-instagram", displayName: "Follow Us", route: "InstagramScreen", icon: "instagram", iconModel: 'MaterialCommunityIcons', key: "instagram", defaultExist: false },)
    }
    // show about us
    if (welcomePage) {
      routesInit.push({ testID: "menu-locations", displayName: welcomePage && welcomePage.navigation ? welcomePage.navigation : "About Us", route: "Welcome", icon: "infocirlceo", iconModel: 'AntDesign', defaultExist: true })
    }
    setRoutes(routesInit)
  }

  useEffect(() => {
    setLogoUrl(get(appSettings, 'general.logoUrl'))
    setMenuBackgroundColor(get(appSettings, 'theme.menuBackgroundColor'))
    buildRoute(appSettings)
  }, [appSettings])

  return (
    <ImageBackground
      source={menuBackgroundColor ? require(`../themes/dark/backgroundEmpty.png`) : require(`../themes/dark/background.png`)}
      style={{ flex: 1, paddingTop: 50, backgroundColor: menuBackgroundColor }}
      resizeMode="cover"
    >
      <TouchableOpacity style={{ alignItems: 'center', marginTop: 0 }}>
        <View style={{
          padding: 6,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          alignItems: 'center',
          borderRadius: 43,
          justifyContent: 'center'
        }}>
          <Image
            source={{ uri: logoUrl }}
            resizeMode={'center'}
            style={{
              ...Platform.select({
                ios: {
                  borderRadius: 40,
                },
                android: {
                  borderRadius: 40,
                },
              }),
              width: 80,
              height: 80,
              borderWidth: 2,
              resizeMode: 'contain'
            }}
          />
        </View>
        <Text style={{ color: colors.secondaryButtonText }}>{currentUser.displayName}</Text>
      </TouchableOpacity>
      <View style={{ marginTop: 30 }}>
        <List
          dataArray={routes}
          renderRow={data => (
            <ListItem
              testID={data.testID}
              button
              icon
              key={data.route}
              id={data.route}
              underlayColor={colors.darkGray}
              onPress={() => action(data)}>
              <Left>
                <Icon name={data.icon} module={data.iconModel} size={19} />
              </Left>
              <Body>
                <Text style={{ color: colors.secondaryButtonText }}>{data.displayName}</Text>
              </Body>
            </ListItem>
          )}
          keyExtractor={item => item.route}
        />
      </View>

    </ImageBackground>
  );
};

SideMenu.propTypes = {
  navigation: PropTypes.object
};

export default SideMenu;

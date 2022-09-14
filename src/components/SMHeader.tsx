import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Header, Left, Body, Right, Button } from 'native-base';
import { useSelector } from "react-redux";
import foodCore from "../core/food";
import { ImageBackground, Text, View, TouchableOpacity, Share, Image } from "react-native";
import Icon from 'react-native-vector-icons/AntDesign';
import IconFeather from 'react-native-vector-icons/Feather';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import colors from "../themes/dark/colors";
import get from 'lodash/get'

const SMHeader = (
  {
    navigation,
    title,
    isHome,
    isBack,
    isRefresh,
    navBarImg = null,
    share = null,
    hasTabs = false,
    isMenu = false,
    isLocation = false,
    isRightTitle = false,
    isAccountDelete = false,
    onGoBack = () => { },
    onRefresh = () => { },
    onLocationPress = () => { },
    onTitlePress = () => { },
    onDeleteAccount = () => { },
    children = null,
    transparent = false,
    searchIcon,
    searchBar,
  }) => {

  const appSettings = useSelector(state => foodCore.selectors.getAppSettings(state));

  let [menuBackgroundColor, setMenuBackgroundColor] = useState('white')

  const { goBack } = navigation;
  const goHome = () => {
    navigation.navigate('Home');
  };

  const doShare = () => {
    Share.share(share);
  };

  useEffect(() => {
    setMenuBackgroundColor(get(appSettings, 'theme.menuBackgroundColor'))
  }, [appSettings])

  const goToBack = () => {
    goBack(null);
  };

  const goMenu = () => {
    navigation.openDrawer()
  };

  const sync = async () => {
    if (onGoBack) onRefresh();
    else {
    }
  };
  if (transparent) {
    return (
      <View style={{ height: 'auto', flex: 0, zIndex: 1000 }} testID="header">
        <Header transparent hasTabs={hasTabs}>
          <Left style={{ width: 50, flex: 0, }}>
            {isMenu &&
              <Button transparent onPress={goMenu} testID="go-to-menu">
                <IconFeather name='menu' size={22} color={colors.textInputColor} />
              </Button>
            }
            {isBack &&
              <Button transparent onPress={goToBack} style={{
                backgroundColor: '#FFFFFF77',
                width: 32,
                height: 32,
                borderRadius: 50,
                marginLeft: 2
              }
              }>
                <Icon name='left' size={20} color={colors.textInputColor} />
              </Button>
            }
          </Left>
          {!isRightTitle ?
            <Body style={{ flex: 1, alignItems: 'flex-start' }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 18, fontWeight: 'bold', color: '#084DF8', }}
              >
                {title}
              </Text>
            </Body> :
            <Body style={{ flex: 1, alignItems: 'flex-end', right: -100 }}>
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={onTitlePress}>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 18, fontWeight: '500', color: '#084DF8', marginRight: 5 }}
                >
                  {title}
                </Text>
                <Icon name='right' size={18} style={{ fontWeight: '500', color: '#084DF8', }} />
              </TouchableOpacity>
            </Body>}
          <Right style={{ width: 100, flex: 0, }}>
            {isRefresh &&
              <Button transparent onPress={sync}>
                <Icon name='reload1' size={20} color={colors.textInputColor} />
              </Button>
            }
            {isHome &&
              <Button transparent onPress={goHome}>
                <Icon name='home' size={20} color={colors.textInputColor} />
              </Button>
            }
            {!!share &&
              <Button transparent onPress={doShare}>
                <Icon name='sharealt' size={20} color={colors.textInputColor} />
              </Button>
            }
            {
              searchIcon ?
                searchIcon : <></>
            }
          </Right>
        </Header>
        {
          searchBar ?
            searchBar :
            <></>
        }
        {children}
      </View>

    );
  } else {
    return (
      <>
        <ImageBackground
          source={menuBackgroundColor ? require(`../themes/dark/topBarBgEmpty.png`) : require(`../themes/dark/topBarBg.png`)}
          style={{ height: 'auto', flex: 0, backgroundColor: menuBackgroundColor }}
          resizeMode="cover"
        >
          <Header transparent>
            <Left style={{ width: 50, flex: 0, }}>
              <TouchableOpacity testID="go-to-menu-header" style={{ marginBottom: 0, paddingBottom: 0 }} onPress={isMenu ? goMenu : isBack ? goToBack : null}>
                {isMenu &&
                  <Button transparent onPress={goMenu} testID="go-to-menu">
                    <IconFeather name='menu' size={22} color={colors.ButtonTextColor} />
                  </Button>
                }
                {isBack &&
                  <Button transparent onPress={goToBack}>
                    <Icon name='left' size={20} color={colors.ButtonTextColor} />
                  </Button>
                }
              </TouchableOpacity>
            </Left>
            <Body style={{ flex: 1, alignItems: 'flex-start' }}>
              {!!navBarImg ?
                <Image style={{ width: 200, height: 30 }} source={{ uri: navBarImg }}></Image> :
                <Text onPress={isMenu ? goMenu : isBack ? goToBack : null}
                  numberOfLines={1}
                  style={{ fontSize: 18, color: colors.ButtonTextColor }}
                >
                  {title}
                </Text>}
            </Body>
            <Right style={{ width: 100, flex: 0, }}>
              {isRefresh &&
                <Button transparent onPress={sync}>
                  <Icon name='reload1' size={20} color={colors.ButtonTextColor} />
                </Button>
              }
              {isHome &&
                <Button transparent onPress={goHome}>
                  <Icon name='home' size={20} color={colors.ButtonTextColor} />
                </Button>
              }
              {isLocation &&
                <Button transparent onPress={onLocationPress}>
                  <EntypoIcon name='location-pin' size={20} color={colors.ButtonTextColor} />
                </Button>}
              {!!isAccountDelete &&
                <Button transparent onPress={onDeleteAccount}>
                  <Icon name='user' size={20} color={colors.ButtonTextColor} />
                </Button>}
              {
                searchIcon ?
                  searchIcon : <></>
              }

            </Right>
          </Header>
          {
            searchBar ?
              searchBar :
              <></>
          }
          {children}
        </ImageBackground>

      </>

    );
  }

};
SMHeader.propTypes = {
  isHome: PropTypes.bool,
  isBack: PropTypes.bool,
  isRefresh: PropTypes.bool,
  isMenu: PropTypes.bool,
  transparent: PropTypes.bool,
  title: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  onGoBack: PropTypes.func,
  onRefresh: PropTypes.func,
};
SMHeader.defaultProps = {
  isHome: false,
  isBack: false,
  isRefresh: true,
  isMenu: true,
  transparent: false,
  title: '',
  searchIcon: false,
  searchBar: false,
}
export default SMHeader

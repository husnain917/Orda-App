import React, { useEffect } from 'react';
import RenderView from "./view";
import { connect } from 'react-redux';
import { compose, lifecycle } from "recompose";
import foodCore from "../../core/food";
import { RootState } from "core";
import { merchantId } from "../../config/config";
import SplashScreen from 'react-native-splash-screen'
import get from 'lodash/get'
import findKey from 'lodash/findKey'
import find from 'lodash/find'
import map from 'lodash/map'
import { getLoyalty } from 'utils/helper';
import { generateId, startOrderListener } from 'utils/orderListener';
import { useFirestore } from 'react-redux-firebase';
import AsyncStorage from '@react-native-community/async-storage';
import { AppState } from 'react-native'

const screen = props => {
  const firestore = useFirestore()

  const startOrder = async (appSettings) => {
    const locationId = findKey(appSettings.locationsMetadata, 'enabled')
    const location = find(get(appSettings, 'locations'), { id: locationId })
    await props.setLocationId(locationId)
    await props.setCurrency(location.currency, location.country)
    await props.setOrderAheadTimes(get(location, 'business_hours.periods'))
    await props.setOrderFulfillmentType(null)
    await props.setOrderAt(null)
    const locationLoyalty = getLoyalty(appSettings, location.id)
    props.setLoyalty(locationLoyalty)
    const ordaId = generateId()
    props.setOrdaId(ordaId)
    startOrderListener(firestore, ordaId, (doc) => {
      props.cartListener(doc)
    }, () => {
      console.log("*** Error")
    })
    props.addOrdaOperation(firestore, location.id, { type: -1, createdAt: new Date().toISOString() })
  }

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      // App has come to the foreground           
      const location = find(get(props.appSettingsSaved, 'locations'), { id: props.locationId })
      if (location) {
        props.setOrderAheadTimes(get(location, 'business_hours.periods'))
      }
    }
  }

  AppState.addEventListener('change', handleAppStateChange)

  const navigateToMainScreen = async (appSettings) => {
    const hideLocationsScreen = get(appSettings, 'theme.hideLocationsScreen')
    const welcomePage = get(appSettings, 'apps.apps-about-us')
    const alwaysShowWelcome = get(welcomePage, 'alwaysShow', false)

    const isSeen = await AsyncStorage.getItem(`welcomeScreen`);

    if ((!isSeen || alwaysShowWelcome) && welcomePage) {
      await startOrder(appSettings)
      props.navigation.navigate('Welcome', { isWelcomeScreen: true });
    }
    else if (hideLocationsScreen) {
      await startOrder(appSettings)
      props.navigation.navigate('FoodMenuScreen')
    }
    else {
      props.navigation.navigate('Home')
    }
  }

  const fetchJSON = async (merchantId, type) => {
    try {
      const url = `https://storage.googleapis.com/fav-ordering.appspot.com/${merchantId}/catalog/${type}.json`
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      return data
    } catch (e) {
      return {}
    }
  }

  const getMerchants = () => {
    let list = merchantId // support pipe merchant such as Extract Juicery
    if (merchantId.indexOf("|") > 0) {
      list = merchantId.split("|")[1]
    }
    return list.trim().split(",") // support concat merchants such as Keva Juice
  }

  const getAppsMerchant = () => {
    if (merchantId.indexOf("|") > 0) {
      return merchantId.split("|")[0]
    }
    return
  }

  const loadMerchantData = (id, appsMerchant) => {
    return Promise.all([fetchJSON(id, 'cache'), fetchJSON(appsMerchant || id, 'apps'), fetchJSON(id, 'data')])
  }

  useEffect(() => {
    const merchants = getMerchants()
    const masterMerchant = merchants[0]
    const appsMerchant = getAppsMerchant()

    props.setMasterMerchant(masterMerchant)
    props.setCurrentMerchant(masterMerchant)
    const all = map(merchants, id => loadMerchantData(id, appsMerchant))

    Promise.all(all).then(results => {
      const masterData: any = results.shift()
      const [location, merchant, catalog] = masterData

      props.getFoods({ location, catalog });
      props.getTaxes({ catalog });
      props.getCategory({ location, merchant, catalog });
      props.getVariations({ location, catalog });
      props.getModifiers({ location, catalog });
      props.getLocations({ merchant });
      props.getAppSettings({ merchant });

      // for all secondary accounts - setup with different merchant id
      while (results.length) {
        const accountData: any = results.shift()
        const [location, merchant, catalog] = accountData
        const merchant_id = get(merchant, 'data.locations[0].merchant_id')

        props.getFoods({ location, catalog, merchant_id })
        props.getTaxes({ catalog, merchant_id })
        props.getCategory({ location, merchant, catalog, merchant_id })
        props.getVariations({ location, catalog, merchant_id })
        props.getModifiers({ location, catalog, merchant_id })

        props.getLocations({ merchant, merchant_id })
        props.getAppSettings({ merchant, merchant_id })
      }

      props.resetOrdaId();

      setTimeout(() => {
        SplashScreen.hide();
        navigateToMainScreen(merchant.data)
      }, 900)
    })
  }, [])

  return (
    <RenderView />
  );
};

export default compose(
  connect(
    (state: RootState) => ({
      users: state.firebase.ordered.user,
      locationId: foodCore.selectors.getLocationId(state),
      appSettingsSaved: foodCore.selectors.getAppSettings(state),
    }),
    (dispatch: any) => ({
      setMasterMerchant: (merchantId) => dispatch(foodCore.actions.setMasterMerchant(merchantId)),
      setCurrentMerchant: (merchantId) => dispatch(foodCore.actions.setCurrentMerchant(merchantId)),
      getLocations: (merchant) => dispatch(foodCore.actions.getLocations(merchant)),
      getAppSettings: (merchant) => dispatch(foodCore.actions.getAppSettings(merchant)),
      getFoods: (location) => dispatch(foodCore.actions.getFoods(location)),
      getTaxes: (location) => dispatch(foodCore.actions.getTaxes(location)),
      getCategory: (location) => dispatch(foodCore.actions.getCategory(location)),
      getVariations: (location) => dispatch(foodCore.actions.getVariations(location)),
      getModifiers: (location) => dispatch(foodCore.actions.getModifiers(location)),
      resetOrdaId: () => dispatch(foodCore.actions.resetOrdaId()),
      setLocationId: (id) => dispatch(foodCore.actions.setLocationId(id)),
      setCurrency: (c) => dispatch(foodCore.actions.setCurrency(c)),
      setOrderAt: (c) => dispatch(foodCore.actions.setOrderAt(c)),
      setLoyalty: (l) => dispatch(foodCore.actions.setLoyalty(l)),
      setOrdaId: (id) => dispatch(foodCore.actions.setOrdaId(id)),
      setOrderAheadTimes: (t) => dispatch(foodCore.actions.setOrderAheadTimes(t)),
      cartListener: (doc) => dispatch(foodCore.actions.cartListener(doc)),
      setOrderFulfillmentType: (t) => dispatch(foodCore.actions.setOrderFulfillmentType(t)),
      addOrdaOperation: (firestore, locationId, data) => dispatch(foodCore.actions.addOrdaOperation(firestore, locationId, data)),
    }),
  ),
  lifecycle({
    async componentDidMount() {
    },
  }),
)(screen);

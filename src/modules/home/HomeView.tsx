import React from 'react';
import { Container } from 'native-base';
import { useSelector } from "react-redux";
import foodCore from "../../core/food";

import SMHeader from "../../components/SMHeader";
import MapArea from "./MapArea";
import { getLoyalty } from "../../utils/helper";
import { generateId, startOrderListener } from 'utils/orderListener';
import { useFirestore } from 'react-redux-firebase';
import Geocoder from 'react-native-geocoding';

import get from 'lodash/get'

Geocoder.init("AIzaSyDn3f6HlHyab5A6fr_X-NlqfPCAmEYd7cM")

export default function HomeScreen(props) {
  const firestore = useFirestore()
  const locations = useSelector(state => foodCore.selectors.getLocations(state));

  const appSettings = useSelector(state => foodCore.selectors.getAppSettings(state));

  const goToDetail = async (item) => {
    const location = get(item, 'locationData')
    await props.setCurrentMerchant(location.merchant_id)
    let locationReplaced = props.locationId != location.id
    if (locationReplaced) {
      await props.resetOrder() // reset location and everything else
    }
    props.setLocationId(location.id)
    props.setCurrency(location.currency, location.country)
    props.setOrderAheadTimes(get(location, 'business_hours.periods'))
    props.setOrderFulfillmentType(null)
    props.setOrderAt(null)
    const locationLoyalty = getLoyalty(appSettings, location.id)
    props.setLoyalty(locationLoyalty)
    if (locationReplaced || !props.ordaId) {
      const ordaId = generateId()
      props.setOrdaId(ordaId)
      const unsubscribe = startOrderListener(firestore, ordaId, (doc) => {
        props.cartListener(doc)
      }, () => {
        console.log("*** Error")
      })
      props.addOrdaOperation(firestore, location.id, { type: -1, createdAt: new Date().toISOString() })
    }
    props.navigation.navigate('FoodMenu', { location });
  };
  const showMap = () => {
    return !get(appSettings, 'theme.hideLocationsScreen')
  }

  return (
    <Container>
      <SMHeader title="Select Store" navigation={props.navigation} isRefresh={false} />
      
      { showMap() && <MapArea goToDetail={goToDetail} locations={locations} menuBackgroundColor={get(appSettings, 'theme.menuBackgroundColor', '#000')} />}
      
    </Container>
  );
}

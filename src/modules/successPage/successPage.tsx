import { Button, Card } from 'native-base';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from 'styles';
import { SMHeader, SMContent, SMFooter } from '../../components';
import get from 'lodash/get'
import foodCore from '../../core/food'
import MapView, { Marker } from 'react-native-maps';

import InAppReview from 'react-native-in-app-review';
import { getData, storeData } from 'utils/helper';

const SuccessPage = props => {
  const dispatch = useDispatch()
  const location = props.navigation.getParam('location') || {
    latitude: '32.064171',
    longitude: '34.7748068',
    size: {
      width: 300,
      height: 200
    },
  }
  const fulfillment = props.navigation.getParam('fulfillment') || {
    type: 'pickup',
    at: 'ASAP',
  }
  const type = get(fulfillment, 'type')

  const appSettings = useSelector(state => foodCore.selectors.getAppSettings(state))
  const delivery = useSelector(state => foodCore.selectors.getDelivery(state))
  const prepTime = useSelector(state => foodCore.selectors.getPrepTime(state))

  const [deliveryUrl, setDeliveryUrl] = useState('')

  const logoUrl = get(appSettings, 'general.logoUrl')

  const resetOrder = () => dispatch(foodCore.actions.resetOrder())
  const setCurrentMerchant = (data) => dispatch(foodCore.actions.setCurrentMerchant(data))

  const clearOrder = async () => {
    await resetOrder()
    await setCurrentMerchant(null)
    props.navigation.pop()
    props.navigation.navigate('Home');
  }

  const handleDeliveryClick = async () => {
    Linking.canOpenURL(deliveryUrl).then(supported => {
      if (supported) {
        Linking.openURL(deliveryUrl);
      } else {
        console.log("Don't know how to open URI: " + deliveryUrl);
      }
    });
  }

  const isLongTimeFromToday = (date) => {
    try {
      if (!date) {
        return true
      }
      const now = Date.now()
      return now - parseInt(date) > 1000*60*60*24*20
    } catch (e) {
      return false
    }
  }

  const showAppReview = async () => {
    const appReviewDate = await getData('appReviewDate')
    if (!isLongTimeFromToday(appReviewDate)) {
      return
    }

    await storeData('appReviewDate', '' + Date.now())

    // Give you result if version of device supported to rate app or not!
    InAppReview.isAvailable();

    // trigger UI InAppreview
    try {
      await InAppReview.RequestInAppReview()
    } catch (e) {
    }
  }

  useEffect(() => {
    setDeliveryUrl(get(delivery, 'response.tracking_url', ''))
  }, [delivery])

  useEffect(() => {
    showAppReview()
  }, [])

  return (
    <View style={styles.container}>
      <SMHeader title="" navigation={props.navigation} isMenu={false} isHome={false} isRefresh={false} />

      <SMContent style={{ height: '100%', justifyContent: 'center', alignContent: 'center', flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Image
            source={{ uri: logoUrl }}
            style={{ width: 100, height: 100 }}
          />
        </View>
        <View style={{ marginVertical: 20, flexDirection: 'column', justifyContent: 'center', alignContent: 'center', flex: 1 }}>
          <Text style={{ textAlign: 'center', color: colors.darkBlack, fontSize: 25, fontWeight: '500' }}>Order Received 🎉</Text>
          <Text style={{ marginTop: 10, textAlign: 'center', fontWeight: '400', color: colors.darkBlack, fontSize: 20 }}>Thank you for your order </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', flex: 1 }}>
          <Card style={{ elevation: 7 }}>
            { type === 'shipping' ? 
            <Text style={{ textAlign: 'center', fontWeight: '400', margin: 20, color: colors.darkBlack, fontSize: 14 }}>Read our shipping policy on our website for more details.</Text> 
            :
            <MapView
                    region={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.0100,
                        longitudeDelta: 0.0100,
                    }}
                    style={{ alignItems: 'center', height: 200, width: 300, borderRadius: 5 }}
                    zoomEnabled={true}
                    zoomTapEnabled={false}
                    zoomControlEnabled={false}
                    rotateEnabled={true}
                    scrollEnabled={true}
                >
                    <Marker
                        coordinate={{ latitude: location.latitude,
                          longitude: location.longitude, }}
                    />
                </MapView>
            }
          </Card>
        </View>
        <View style={{ backgroundColor: '#00FF2220', marginVertical: 10, marginHorizontal: 30, padding: 20, flexDirection: 'column', justifyContent: 'center', alignContent: 'center', flex: 1 }}>
          { type === 'delivery' ?
            <Text style={{ textAlign: 'center', fontWeight: '400', color: colors.darkBlack, fontSize: 14 }}>A confirmation text message will be sent to you soon, your order will be delivered {get(fulfillment, 'at')}</Text> :
            (type === 'shipping' ?
            <Text style={{ textAlign: 'center', fontWeight: '400', color: colors.darkBlack, fontSize: 14 }}>A confirmation text message will be sent to you soon, your order will be shipped to you soon!</Text> :
            <Text style={{ textAlign: 'center', fontWeight: '400', color: colors.darkBlack, fontSize: 14 }}>A confirmation text message will be sent to you soon, your order will be ready for pickup {get(fulfillment, 'at')}</Text>
            )
          }
          { !!prepTime && <Text style={{ fontWeight: '500', fontSize: 14 }}>Order preparation time is {prepTime}</Text> }
        </View>
      </SMContent>

      <SMFooter style={{ height: 110 }}>
        <View style={{ marginHorizontal: 20, flex: 1 }}>
          { (deliveryUrl != '') && <Button full rounded style={{ marginBottom: 10, height: 50, backgroundColor: colors.black }} onPress={handleDeliveryClick}>
            <Text style={{ color: colors.ButtonTextColor }}>Track Delivery</Text>
          </Button>}
          <Button full rounded style={{ height: 50, backgroundColor: colors.black }} onPress={clearOrder}>
            <Text style={{ color: colors.ButtonTextColor }}>Close</Text>
          </Button>

        </View>
      </SMFooter>
    </View >
  );
};

export default SuccessPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 1
  }
});

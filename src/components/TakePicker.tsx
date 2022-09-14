import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Image, TextInput, FlatList, Platform, TouchableWithoutFeedback, Pressable } from 'react-native';
import { Text, Button, CardItem, Card, Icon, Left, List, ListItem, Right, Body } from 'native-base';
import Modal from 'react-native-modal';
import { colors } from '../styles';
import { useDispatch, useSelector } from "react-redux";
import foodCore from '../core/food'
import get from 'lodash/get'
import map from 'lodash/map'
import find from 'lodash/find'
import each from 'lodash/each'
import take from 'lodash/take'
import capitalize from 'lodash/capitalize'
import includes from 'lodash/includes'
import { GoogleAutoComplete } from 'react-native-google-autocomplete';
import { SafeAreaView } from 'react-navigation';
import moment from "moment";

export default function TakePicker(props) {
  const dispatch = useDispatch()

  const [modalVisible, setModalVisible] = useState(false)
  const [addressModalVisible, setAddressModalVisible] = useState(false)
  const [scheduleTime, setScheduleTime] = useState({ text: 'ASAP', value: 'ASAP' });
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [address, setAddress] = useState('');
  const [modalAddress, setModalAddress] = useState('');
  const [apt, setApt] = useState('');
  const [selectedAddressObject, setSelectedAddressObject] = useState(null);
  const [selectedAddressGeo, setSelectedAddressGeo] = useState(null);
  const [selectedType, setSelectedType] = useState(null)
  const [isPickupEnabled, setIsPickupEnabled] = useState(true)
  const [isShippingEnabled, setIsShippingEnabled] = useState(false)
  const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(false)
  const [isCurbsideEnabled, setIsCurbsideEnabled] = useState(false)
  const fulfillmentType: any = useSelector(state => foodCore.selectors.getOrderFulfillmentType(state));
  const orderAt: any = useSelector(state => foodCore.selectors.getOrderAt(state));
  const [days, setDays] = useState({})
  const [selectedDay, setSelectedDay] = useState(null)
  const [times, setTimes] = useState([])

  const { logoUrl } = props;

  const orderAheadTimes = useSelector(state => foodCore.selectors.getOrderAheadTimes(state));
  const myAddress = useSelector(state => foodCore.selectors.getMyAddress(state))
  const setMyAddress = (address) => dispatch(foodCore.actions.setMyAddress(address))

  const appSettings = useSelector(state => foodCore.selectors.getAppSettings(state));
  const locationId = useSelector(state => foodCore.selectors.getLocationId(state));
  const prepTime = useSelector(state => foodCore.selectors.getPrepTime(state));

  const getStoreCordinates = () => {
    const storeLocation = find(get(appSettings, `locations`), { id: locationId })
    const latitude = get(storeLocation, 'coordinates.latitude', 40.77756)
    const longitude = get(storeLocation, 'coordinates.longitude', -73.978389)
    return { latitude, longitude }
  }

  const setStoreAddress = () => {
    const location = get(appSettings, `locationsMetadata.${locationId}.address`, null)
    setAddress(location)
    props.onLocation(getStoreCordinates())
  }

  const setSearchCenter = () => {
    const location = find(get(appSettings, `locations`), { id: locationId })
    setLat(get(location, 'coordinates.latitude', 40.77756))
    setLng(get(location, 'coordinates.longitude', -73.978389))
  }

  const setClientAddress = (el = null, geo = null) => {
    const add = el || myAddress.address
    if (add) {
      setAddress(get(add, 'description', ''))
    }
    const addGeo = geo || myAddress.geo
    if (addGeo) {
      props.onLocation({ latitude: addGeo.lat, longitude: addGeo.lng })
    }
  }

  useEffect(() => {
    if (!orderAheadTimes) {
      return
    }
    const defaultTime = orderAt || orderAheadTimes[0]
    setScheduleTime(defaultTime)
    props.onAt(defaultTime)
    const calcDays = {}
    each(orderAheadTimes, time => {
      if (time.value === 'ASAP') {
        calcDays['Today'] = [{ value: 'ASAP', time: 'ASAP' }]
        return
      }
      const m = moment(time.value)
      const isToday = m.isSame(new Date(), "day")
      const day = isToday ? 'Today' : m.format('dddd')
      calcDays[day] = calcDays[day] || []
      if (calcDays[day]) {
        calcDays[day].push({ time: m.format('h:mm a'), value: time.value })
      }
    })
    setDays(calcDays)
  }, [orderAheadTimes])

  useEffect(() => {
    if (!days || !selectedDay) {
      return
    }
    const times = days[selectedDay]
    if (times) {
      setTimes(times)
    }
  }, [days, selectedDay])

  const daysList = useCallback(() => {
    return take(Object.keys(days), 3)
  }, [days])

  useEffect(() => {
    const list = daysList()
    if (list) {
      setSelectedDay(list[0])
    }
  }, [days])

  useEffect(() => {
    if (locationId && appSettings) {
      setStoreAddress()
      setSearchCenter()
      const methods = get(appSettings, `locationsMetadata.${locationId}.methods`, ['pickup'])
      setIsPickupEnabled(includes(methods, 'pickup'))
      setIsDeliveryEnabled(includes(methods, 'delivery'))
      setIsCurbsideEnabled(includes(methods, 'curbside'))
      setIsShippingEnabled(includes(methods, 'shipping'))
      const defaultType = fulfillmentType || methods[0]
      setType(defaultType)
    }
  }, [locationId, appSettings])

  const setType = (type) => {
    const previousType = selectedType
    setSelectedType(type)
    if (type === 'pickup' || type === 'curbside') {
      setStoreAddress()
    }
    if (type === 'delivery' || type === 'shipping') {
      if (myAddress) {
        setClientAddress()
      } else {
        setAddress(null)
      }
    }
    props.onMethodSelected({ type, previousType })
  }

  const timeSelected = (selected) => {
    setScheduleTime(selected)
    setModalVisible(false)
    props.onAt(selected)
  }

  const handleAddressSelected = async (handleTextChange, clearSearch, el, fetchDetails) => {
    const details = await fetchDetails(el.place_id)
    const geo = get(details, 'geometry.location')
    el.address_components = get(details, 'address_components', {})

    handleTextChange(el.description)
    setModalAddress(el.description)
    setSelectedAddressObject(el)
    setSelectedAddressGeo(geo)
    setTimeout(() => {
      clearSearch();
    }, 500);
  }

  const saveAddress = () => {
    setMyAddress({ address: selectedAddressObject, apt, geo: selectedAddressGeo })
    setClientAddress(selectedAddressObject, selectedAddressGeo)
    setAddressModalVisible(false)
  }

  const showAddressModal = () => {
    if (myAddress) {
      setSelectedAddressObject(myAddress.address)
      setSelectedAddressGeo(myAddress.geo)
      setApt(myAddress.apt)
      setModalAddress(myAddress.address.description)
    }
    setAddressModalVisible(true)
  }

  const onAdressTextInputChangeText = async (t, handleTextChange) => {
    setModalAddress(t)
    handleTextChange(t)
  }

  return (
    <Card transparent style={{ margin: 0, padding: 0 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Image
          source={{ uri: logoUrl }}
          style={{ margin: 0, padding: 0, width: 65, height: 65 }}
        />

      </View>
      <CardItem style={{ paddingTop: 5, paddingBottom: 5, margin: 0 }}>
        <View style={{ backgroundColor: colors.white, flexDirection: 'row', justifyContent: 'center', paddingTop: 0, margin: 0, }}>
          <View style={{ marginLeft: 0, marginRight: 0, flex: 1, flexDirection: 'row', justifyContent: 'center', }}>
            <View style={{ borderColor: colors.grey, borderRadius: 20, borderWidth: 0.4, padding: 5, flexDirection: 'row', justifyContent: 'space-around' }}>
              {isShippingEnabled && <Button rounded small style={[styles.mr10, selectedType === 'shipping' ? styles.fullfilmentButtonSelected : styles.fullfilmentButton]} onPress={() => setType('shipping')}><Text>Shipping</Text></Button>}
              {isPickupEnabled && <Button rounded small style={[isCurbsideEnabled || isDeliveryEnabled ? styles.mr10 : {}, selectedType === 'pickup' ? styles.fullfilmentButtonSelected : styles.fullfilmentButton]} onPress={() => setType('pickup')}><Text>Pickup</Text></Button>}
              {isDeliveryEnabled && <Button rounded small style={[isCurbsideEnabled ? styles.mr10 : {}, selectedType === 'delivery' ? styles.fullfilmentButtonSelected : styles.fullfilmentButton]} onPress={() => setType('delivery')}><Text>Delivery</Text></Button>}
              {isCurbsideEnabled && <Button rounded small style={selectedType === 'curbside' ? styles.fullfilmentButtonSelected : styles.fullfilmentButton} onPress={() => setType('curbside')}><Text>Curbside</Text></Button>}
            </View>
          </View>
        </View>
      </CardItem>
      <CardItem style={{ paddingTop: 5, paddingBottom: 0 }}>
        <View style={{ flex: 1, flexDirection: 'column', }}>
          <Modal
            isVisible={addressModalVisible}
            onSwipeComplete={() => {
              setAddressModalVisible(false);
            }}
            swipeDirection={['down']}
            style={styles.bottomModal}>

            <View
              style={[styles.contentFilterBottom, { backgroundColor: colors.background }]}>
              <View style={styles.contentSwipeDown}>
                <View style={styles.lineSwipeDown} />
              </View>
              <View style={[styles.contentHeader]}>
                <Left>
                  <Button onPress={() => setAddressModalVisible(false)} icon style={{ backgroundColor: 'white' }}><Icon fontSize={18} style={{ fontSize: 30, color: colors.gray }} name={'close-outline'}></Icon></Button>
                </Left>
                <Body><Text style={{ fontWeight: '500', fontSize: 18, paddingTop: 15 }}>{selectedType === 'delivery' ? 'Delivery' : 'Shipping'} details</Text></Body>
              </View>
              <View style={styles.contentBodyAddressModal}>
                <GoogleAutoComplete apiKey="AIzaSyBswrWMXlq7nXk1SdetdXEDGxgEOJTmEgc" queryTypes={'address'} lat={lat} lng={lng} radius={'10000'} minLength={3}>
                  {({ inputValue, handleTextChange, handleEventChange, fetchDetails, locationResults, clearSearch }) => (
                    <React.Fragment>
                      <TextInput
                        autoFocus
                        style={{
                          marginTop: 10,
                          height: 40,
                          width: '100%',
                          borderWidth: 0,
                          backgroundColor: '#bebebe',
                          borderRadius: 20,
                          color: 'black',
                          paddingHorizontal: 16,
                        }}
                        value={modalAddress}
                        onChangeText={t => onAdressTextInputChangeText(t, handleTextChange)}
                        placeholderTextColor='#7e7e7e'
                        placeholder="Enter your address"
                      />
                      {(!locationResults || !locationResults.length) && <View>
                        <TextInput
                          style={{
                            marginTop: 10,
                            height: 40,
                            width: '100%',
                            borderWidth: 0,
                            backgroundColor: '#bebebe',
                            borderRadius: 20,
                            color: 'black',
                            paddingHorizontal: 16,
                          }}
                          value={apt}
                          onChangeText={setApt}
                          placeholderTextColor='#7e7e7e'
                          placeholder="Apt."
                        />
                        <Button onPress={() => saveAddress()} disabled={!selectedAddressObject} full iconRight rounded style={{ backgroundColor: !selectedAddressObject ? colors.darkGray : 'black', width: '100%', marginTop: 10, }}>
                          <Text>Save</Text>
                        </Button>
                      </View>
                      }
                      <SafeAreaView style={{ maxHeight: "70%", flexDirection: 'row' }}>
                        <List style={{ flex: 1 }}>
                          {map(locationResults || [], el => (<ListItem onPress={(item) => handleAddressSelected(handleTextChange, clearSearch, el, fetchDetails)} >
                            <Left style={{ width: '70%' }} >
                              <Icon style={{ marginRight: 7 }} name={'navigate'}></Icon>
                              <Text style={{ fontSize: 14 }}>{el.description.substr(0, 35) + '...'}</Text>
                            </Left>
                            <Right>
                              <Icon name="chevron-forward" />
                            </Right>
                          </ListItem>))
                          }
                        </List>
                      </SafeAreaView>
                    </React.Fragment>
                  )}
                </GoogleAutoComplete>
              </View>
            </View>
          </Modal>
          <View style={{ flex: 1, flexDirection: 'row'}}>
            <View style={{ padding: 4, flex: 1, flexDirection: 'row'}}>
              <Icon style={{ color: colors.black, fontSize: 20 }} name={'location-outline'}></Icon>
              <Text numberOfLines={1} style={{ marginLeft: -10}}>{capitalize(selectedType)} {selectedType === 'pickup' || selectedType === 'curbside' ? '@' : 'to'} {address || 'select address'}</Text>
            </View>
            { (selectedType !== 'pickup' && selectedType !== 'curbside') && 
              <Button rounded small style={[address ? styles.fullfilmentButtonSelected : styles.fullfilmentButtonError, styles.addressButton]} onPress={showAddressModal}>
              <Text>{ address ? 'Change' : 'Select' }</Text>
              </Button>
            }
          </View>
          <Modal
            isVisible={modalVisible}
            propagateSwipe={true}
            onSwipeComplete={() => {
              setModalVisible(false);
            }}
            swipeDirection={['down']}
            style={styles.bottomModal}>

            <TouchableWithoutFeedback>
              <View
                style={[styles.contentFilterBottom, { backgroundColor: colors.background }]}>
                <View style={styles.contentSwipeDown}>
                  <View style={styles.lineSwipeDown} />
                </View>
                <View style={styles.contentHeader}>
                  <Text style={{ fontWeight: '500', fontSize: 18 }}>Pick a day &amp; time</Text>
                  <Icon onPress={() => (setModalVisible(false))} style={{ color: 'gray' }} name="close" />
                </View>
                {!!prepTime && <View>
                  <Text style={{ fontWeight: '500', fontSize: 14 }}>Order preparation time is {prepTime}</Text>
                </View>}
                <View style={styles.daysContainer}>
                  {daysList().map((day, index) =>
                  (<Button transparent={selectedDay !== day} style={[styles.dayButton, { backgroundColor: selectedDay !== day ? 'white' : 'black' }]} onPress={() => (setSelectedDay(day))} >
                    <Text style={{ color: selectedDay === day ? 'white' : 'black' }}>{day}</Text>
                  </Button>))}
                </View>
                <View style={{ marginTop: 50,  }}>
                    <FlatList
                      data={times}
                      style={{ height: 400}}
                      renderItem={({ item, index }) => {
                        return <Pressable onPress={() => {timeSelected({ value: item.value, text: `${selectedDay !== 'Today' ? selectedDay : '' } ${item.time}`}) }}>
                          <View style={{ flex: 1, justifyContent: 'flex-start', flexDirection: 'row', marginTop: 20, marginHorizontal: 0, }}>
                            <Icon type="Feather" name="square" fontSize={12} />
                            <Text style={{ fontSize: 18, paddingTop: 2}}>{item.time}</Text>
                          </View>
                        </Pressable>
                      }}
                      keyExtractor={(item, index) => (`` + item.value)}
                    />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          {selectedType !== 'shipping' &&  <View style={{ flex: 1, flexDirection: 'row', marginTop: 10, }}>
            <View style={{ padding: 4, flex: 1, flexDirection: 'row'}}>
              <Icon style={{ color: colors.black, fontSize: 20 }} name={'time-outline'}></Icon>
              <Text numberOfLines={1} style={{ marginLeft: -10}}>{scheduleTime.text}</Text>
            </View>
            <Button rounded small style={[styles.fullfilmentButtonSelected, styles.addressButton]} onPress={() => (setModalVisible(true))}>
                <Text>Change</Text>
              </Button>
          </View>
          }
        </View>
      </CardItem >
    </Card >
  );
}


const styles = StyleSheet.create({
  contentForm: {
    padding: 4,
    width: '100%',
    alignItems: 'flex-start',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  contentFilterBottom: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 20,
  },
  contentSwipeDown: {
    paddingTop: 10,
    alignItems: 'center',
  },
  contentHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
    marginTop: 20
  },
  contentSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  daysContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
  },
  dayButton: {
    borderRadius: 50,
  },
  contentBodyIcon: {
    width: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentBody: {
    height: '60%'
  },
  contentBodyAddressModal: {
    height: '80%'
  },
  takeButton: {
    margin: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('screen').width / 3 - 30,
    height: Dimensions.get('screen').width / 3 - 30,
    backgroundColor: colors.background
  },
  activeTakeButton: {
    backgroundColor: colors.yellow,
  },
  takeButtonText: {
    color: colors.textInputColor,
    fontSize: 12,
  },
  contentBodyTailer: {},
  lineSwipeDown: {
    width: 30,
    height: 2.5,
    backgroundColor: colors.gray,
  },
  contentActionModalBottom: {
    flexDirection: 'row',
    paddingVertical: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  fullfilmentButton: {
    backgroundColor: '#bebebe',
  },
  fullfilmentButtonSelected: {
    backgroundColor: colors.black,
  },
  fullfilmentButtonError: {
    backgroundColor: '#FF1133',
  },
  addressButton: {
    justifyContent: 'center',
    textAlign: 'center',
  },
  mr10: {
    marginRight: 10,
  }
});

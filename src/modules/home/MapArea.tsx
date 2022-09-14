import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, FlatList, TextInput, ScrollView, PermissionsAndroid, Image } from 'react-native';
import { Text, CardItem, Left, List, ListItem, Icon, Right, Button } from 'native-base';
import { GoogleAutoComplete } from 'react-native-google-autocomplete';
import { styles } from './HomeStyle';
import MapView, { Marker, Callout } from 'react-native-maps';
import map from 'lodash/map'
import get from 'lodash/get'
import reduce from 'lodash/reduce'
import sortBy from 'lodash/sortBy'
import { colors } from '../../styles';


import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';

const StoreItem = ({ data, onSetData, menuBackgroundColor }) => {

  const makeTimeInMS = (h, m, s) => {
    let now = new Date();
    now.setHours(h || 0);
    now.setMinutes(m || 0);
    now.setSeconds(s || 0);
    return now.getTime();
  }

  const timeStrigify = (hour, minute) => {
    return `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`
  }

  const makeOpeningHoursString = (businessHours) => {
    if (!businessHours) {
      return ''
    }
    let openingHourString: string;

    let weekDaysName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    let weekDaysFullName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let todayInMS = new Date().getTime();
    let todayNumber = new Date().getDay();

    let i: number;
    for (i = todayNumber; i < todayNumber + 7; i++) {
      let currentDayName = weekDaysName[i];

      let j: number;
      for (j = 0; j < businessHours.length; j++) {
        const { day_of_week, start_local_time, end_local_time } = businessHours[j];
        let splitStartTime = start_local_time.split(':');
        let startHour = splitStartTime[0];
        let startMinute = splitStartTime[1];
        let startSecond = splitStartTime[2]
        let openingHoursInMS = makeTimeInMS(startHour, startMinute, startSecond);

        let splitEndTime = end_local_time.split(':');
        let endHour = splitEndTime[0];
        let endMinute = splitEndTime[1];
        let endSecond = splitEndTime[2];
        let closingHoursInMS = makeTimeInMS(endHour, endMinute, endSecond);

        if (currentDayName == day_of_week && i === todayNumber) {
          if (todayInMS < openingHoursInMS) {
            openingHourString = `Opens ${timeStrigify(startHour, startMinute)}`;
            break;
          }
          if (todayInMS > openingHoursInMS && todayInMS < closingHoursInMS) {
            openingHourString = `Open until ${timeStrigify(endHour, endMinute)}`;
            break;
          }
        }

        if (openingHourString) break;

        if (currentDayName == day_of_week && i === todayNumber + 1) {
          openingHourString = `Opens tomorrow at ${timeStrigify(startHour, startMinute)}`;
          break;
        }

        if (openingHourString) break;

        if (!openingHourString && currentDayName == day_of_week && i !== todayNumber && i !== todayNumber + 1) {
          openingHourString = `Opens ${weekDaysFullName[i]} ${timeStrigify(startHour, startMinute)}`
          break;
        }

        if (openingHourString) break;

      }
    }

    return openingHourString;
  }

  return <TouchableOpacity onPress={() => onSetData()}>
    <CardItem cardBody style={{ borderBottomColor: menuBackgroundColor, borderBottomWidth: 5, height: 140, backgroundColor: 'white', marginHorizontal: 10, borderRadius: 5, borderTopLeftRadius: 30, shadowColor: 'black', shadowRadius: 1, shadowOpacity: 0.6, shadowOffset: { width: 1, height: 1 } }}>
      <View style={{
        alignItems: 'flex-start',
        width: 250,
        borderRadius: 5,
        paddingLeft: 20,
        justifyContent: 'center'
      }}>
        <Text numberOfLines={1} style={{ color: colors.darkBlack, fontSize: 16, fontWeight: '700' }}>{data.name}</Text>
        <Text numberOfLines={1} style={{ color: colors.darkBlack, fontSize: 12, marginTop: 6, }}>{data.address}</Text>
        <Text numberOfLines={1} style={{ color: colors.darkBlack, fontSize: 12, textTransform: 'uppercase', marginTop: 6, fontWeight: '600' }}>{makeOpeningHoursString(data.locationData?.business_hours?.periods)}</Text>
        <Button rounded style={{ marginTop: 15, borderColor: colors.white, borderWidth: 0.4, backgroundColor: menuBackgroundColor, height: 30 }} onPress={onSetData}>
          <Text style={{ fontSize: 12, color: colors.white }}>Order Here</Text>
        </Button>
      </View>

    </CardItem>
  </TouchableOpacity>
};

export default function MapArea(props) {

  const [currentLatLng, setCurrentLatLng] = useState<any>({ lat: 0, lng: 0 });
  const [inputAddress, setInputAddress] = useState('');
  const [inputHeight, setInputHeight] = useState(0);
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 })
  const [isPermission, setPermission] = useState(false)
  const [sortedLocations, setSortedLocations] = useState([])
  const [markerLocations, setMarkerLocations] = useState([])

  const markerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapViewKey, setMapViewKey] = useState(0)

  const onAdressChange = async (t, handleTextChange, locationResults, clearSearch) => {
    if (locationResults.length > 0 && t.trim() != "") {
      setInputHeight(200)
    }
    else {
      setInputHeight(0)
      clearSearch()
    }
    setInputAddress(t)
    handleTextChange(t)
  }

  const searchFocus = async () => {
    Geolocation.getCurrentPosition(info => {
      setCoords(info.coords)
      permission()
      findLocation()
    });
  }

  async function findLocation() {
    Geolocation.getCurrentPosition(
      (position) => {
        Geocoder.from(position.coords.latitude, position.coords.longitude)
          .then(json => {
            let currentAddress = json?.results[0]?.formatted_address;
            setInputAddress(currentAddress)
            sortLocations(props.locations, { lat: position.coords.latitude, lng: position.coords.longitude })
          })
          .catch(error => {
            mapRef.current.fitToElements(true)
          });
      },
      (error) => {
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 100000
      }
    );
  }

  const permission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setPermission(true)
        findLocation()
      }
      else {
        setPermission(false);
      }
    }
    catch (err) {
      mapRef.current.fitToElements(true)
      // console.warn(err)
    }
  }

  const findDistance = (lat1, lon1, lat2, lon2, unit) => {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit === "K") { dist = dist * 1.609344 }
      if (unit === "M") { dist = dist * 0.8684 }
      return dist;
    }
  }

  const sortLocations = async (locations, selectedAddress, fetchDetails?, clearSearch?, altCoords?) => {
    var currentLatLng = { 
      lat: get(coords, 'latitude') || get(altCoords, 'latitude') || 35.0824099, 
      lng: get(coords, 'longitude') || get(altCoords, 'longitude') || -106.6764794 
    };
    if (clearSearch) {
      setInputHeight(0)
      clearSearch()
      setInputAddress(selectedAddress.description)
    }
    if (fetchDetails) {
      const details = await fetchDetails(selectedAddress.place_id)
      currentLatLng = get(details, 'geometry.location')
    }
    setCurrentLatLng(currentLatLng);
    if (locations.length > 0 && Object.keys(currentLatLng).length > 0) {
      let i: number;
      for (i = 0; i < locations.length; i++) {
        let restaurant = locations[i];
        let { latitude, longitude } = get(restaurant, 'locationData.coordinates', {})
        let { lat, lng } = currentLatLng;
        let distance = findDistance(latitude, longitude, lat, lng, "M");
        restaurant.distance = distance
      }
      setSortedLocations(sortBy(locations, ['distance']))
      return
    }
    setSortedLocations(locations);
  }

  useEffect(() => {
    sortLocations(props.locations, {})
    mapRef.current.fitToElements(true)
    
    try {
      setImmediate(() => {
        Geolocation.getCurrentPosition(info => {
          setCoords(info.coords)
          setImmediate(() => {
            if (!mapViewKey) {
              setMapViewKey(Math.floor(Math.random() * 100))
            }
            mapRef.current.fitToElements(true)
            sortLocations(props.locations, {}, null, null, info.coords)
          })
        },      (error) => {
          console.log(error.code, error.message);
          mapRef.current.fitToElements(true)
        },
        {
          enableHighAccuracy: false, timeout: 20000, maximumAge: 1000
        })
      })



    } catch (e) {
      mapRef.current.fitToElements(true)
    }
  }, []);

  useEffect(() => {
    if (!sortedLocations) {
      return
    }
    const mls = reduce(sortedLocations, (all, marker) => {
      if (marker.locationData?.coordinates) {
        all.push(marker)
      }
      return all
    }, [])
    setMarkerLocations(mls)
  }, [sortedLocations])

  return <View style={{ flex: 1 }}>
    <View style={[{ position: 'absolute', top: -10, height: "auto", width: "100%", zIndex: 1 }, inputHeight > 0 ? styles.searchFieldStyles : {}]}>
      <GoogleAutoComplete apiKey="AIzaSyBswrWMXlq7nXk1SdetdXEDGxgEOJTmEgc" queryTypes={"geocode"} radius={'10000'} minLength={3}
        lat={coords.latitude} lng={coords.longitude}>
        {({ inputValue, handleTextChange, handleEventChange, fetchDetails, locationResults, clearSearch }) =>
        (
          <React.Fragment>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                value={inputAddress}
                onChangeText={t => onAdressChange(t, handleTextChange, locationResults, clearSearch)}
                placeholderTextColor='#7e7e7e'
                placeholder="Search by city, state or Zip"
                onTouchEndCapture={() => { clearSearch(); setInputHeight(0) }}
                onFocus={() => { searchFocus() }}
                editable={!isPermission}
              />
            </View>
            <ScrollView style={{ maxHeight: "70%", flexDirection: 'row', backgroundColor: "#fff" }}>
              <List style={{ flex: 1 }}>
                {map(locationResults || [], el =>
                (<ListItem onPress={() => sortLocations(props.locations, el, fetchDetails, clearSearch)}>
                  <Left style={{ width: '80%' }}>
                    <Text style={{ fontSize: 14 }}>{el.description}</Text>
                  </Left>
                  <Right>
                    <Icon name="chevron-forward" />
                  </Right>
                </ListItem>))
                }
              </List>
            </ScrollView>
          </React.Fragment>
        )
        }
      </GoogleAutoComplete>
    </View>
    <MapView
      key={mapViewKey}
      region={{
        latitude: coords?.latitude ? coords.latitude : currentLatLng.lat,
        longitude: coords?.longitude ? coords.longitude : currentLatLng.lng,
        latitudeDelta: 0.0200,
        longitudeDelta: 0.0200,
      }}
      loadingEnabled
      showsUserLocation
      style={[{ flex: 1 }]}
      ref={mapRef}
    >
      {markerLocations && markerLocations.map((marker, index) => {
        return (
          <Marker
            key={index}
            coordinate={marker.locationData?.coordinates}
            title={marker.name}
            description={marker.address}
            onCalloutPress={() => props.goToDetail(marker)}
            ref={markerRef}
          >
            <Image
              source={require('../../assets/target.png')}
              style={{ height: 30, width: 30 }}
            />
            <Callout style={{ width: 200 }}>
              <TouchableOpacity style={styles.callout} >
                <Text style={styles.storename}>{marker.name}</Text>
                <Text style={styles.address}>{marker.address}</Text>
                <Text style={styles.order} onPress={() => props.goToDetail(marker)}>Order Here →</Text>
              </TouchableOpacity>
            </Callout>
          </Marker>
        )
      })}
    </MapView>
    <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 180 }} testID="locations-list">
      { !!sortedLocations  && <FlatList
        horizontal={true}
        data={sortedLocations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <StoreItem data={item} onSetData={() => props.goToDetail(item)} menuBackgroundColor={props.menuBackgroundColor} />}
      />}
    </View>
  </View>


}
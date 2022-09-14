import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import get from 'lodash/get'
import map from 'lodash/map'
import { CardItem, Button } from 'native-base';
import MapView, { Marker } from 'react-native-maps';
import findKey from 'lodash/findKey'
import find from 'lodash/find'
import { getLoyalty } from 'utils/helper';
import { generateId, startOrderListener } from 'utils/orderListener';
import { useFirestore } from 'react-redux-firebase';
import { RootState } from "core";
import { connect } from 'react-redux';
import { compose, lifecycle } from "recompose";

import { SMHeader, SMFooter } from '../../components';
import foodCore from '../../core/food'
import { colors } from 'styles';

const CategoryItem = ({ data, onSetData, height, index }) => {

    const hasPin = !!get(data, 'locationData.coordinates.latitude')

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

    return <View style={styles.cardContainer}>
        <View
            style={{
                borderBottomColor: 'black',
                borderBottomWidth: StyleSheet.hairlineWidth,
            }}
        />
        <CardItem style={styles.cardItem} >
            <View style={[styles.cardBody]}>
                <TouchableOpacity style={styles.textBody} onPress={() => onSetData()}>
                    <Text style={[styles.boldText, { textAlign: 'center', fontSize: 28, lineHeight: 40, }]}>{data.name}</Text>
                    <Text style={styles.simpleText}>{data.address}</Text>
                    {data.locationData.business_email && <Text style={[styles.simpleText]}>{data.locationData.business_email}</Text>}
                    {data.locationData.phone_number && <Text style={[styles.simpleText]}>{data.locationData.phone_number}</Text>}
                    <Text style={[styles.simpleText, styles.openingHours]}>{makeOpeningHoursString(data.locationData.business_hours.periods)}</Text>
                    <View style={{ flexDirection: 'row', flex: 1, padding: 0, marginTop: 10, }}>
                        <Button full rounded onPress={() => onSetData()} style={{ marginHorizontal: 50, backgroundColor: colors.black, height: 40, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: colors.ButtonTextColor, fontWeight: 'bold', fontSize: 15 }}>Order Now</Text>
                        </Button>
                    </View>
                </TouchableOpacity>
                {hasPin && <MapView
                    region={{
                        latitude: data.locationData.coordinates.latitude,
                        longitude: data.locationData.coordinates.longitude,
                        latitudeDelta: 0.0100,
                        longitudeDelta: 0.0100,
                    }}
                    style={styles.mapView}
                    zoomEnabled={true}
                    zoomTapEnabled={false}
                    zoomControlEnabled={false}
                    rotateEnabled={true}
                    scrollEnabled={true}
                >
                    <Marker
                        coordinate={data.locationData.coordinates}
                    />
                </MapView>}
            </View>

        </CardItem>
    </View>
};

const WelcomeScreen = props => {
    const appSettings = useSelector(state => foodCore.selectors.getAppSettings(state))
    const welcomeScreenData = get(appSettings, 'apps.apps-about-us')
    const locations = useSelector(state => foodCore.selectors.getLocations(state));
    const isWelcomeScreen = get(props.navigation, 'state.params.isWelcomeScreen', false)
    const hideLocationsScreen = get(appSettings, 'theme.hideLocationsScreen')
    const firestore = useFirestore()

    const goToDetail = async (item) => {
        const location = get(item, 'locationData')
        props.navigation.navigate('FoodMenu', { location });
    };

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

    const onTitlePress = async () => {
        AsyncStorage.setItem("welcomeScreen", 'true');

        if (hideLocationsScreen) {
            await startOrder(appSettings)
            props.navigation.navigate('FoodMenu')
        }
        else {
            props.navigation.navigate('Home')
        }
    }

    return (
        <View style={styles.container}>
            {!isWelcomeScreen && <SMHeader title={welcomeScreenData.navigation} navigation={props.navigation}
                isMenu={true} isHome={false} isRefresh={false} transparent={false}
            />}
            <ScrollView>
                <View style={{ marginTop: 0, paddingTop: 0, flex: 1 }}>
                    <Image source={{ uri: welcomeScreenData.img }} style={{ height: isWelcomeScreen ? Dimensions.get('window').height * 11 / 18 : 300 }} />
                    <View>
                        <Text style={styles.title}>{welcomeScreenData.title}</Text>
                        <Text style={styles.description}>{welcomeScreenData.body}</Text>
                    </View>
                    {(welcomeScreenData.showLocations && !isWelcomeScreen) ?
                        <View>
                            {locations && map(locations, (item, index) => {
                                return <CategoryItem key={index} height={250} data={item} index={index} onSetData={() => goToDetail(item)} />
                            })}
                        </View> : null}
                </View>
            </ScrollView>
            {isWelcomeScreen && <SMFooter>
                <View style={{ flexDirection: 'row', flex: 1, padding: 0, marginTop: -15 }}>
                    <Button testID="get_started" full rounded style={{ marginHorizontal: 20, backgroundColor: colors.black, height: 50, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                        onPress={onTitlePress}
                    >
                        <Text style={{ color: colors.ButtonTextColor, fontWeight: 'bold', fontSize: 18 }}>Get Started</Text>
                    </Button>
                </View>
            </SMFooter>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 0,
        padding: 0,
        flex: 1,
        backgroundColor: 'white',
    },
    body: {
        flex: 1,
        padding: 10,
    },
    title: {
        letterSpacing: 0.2,
        fontSize: 20,
        fontWeight: "bold",
        paddingTop: 10,
        color: colors.darkBlack,
        textAlign: 'center',
    },
    description: {
        padding: 8,
        letterSpacing: 0.15,
        lineHeight: 30,
        color: colors.darkBlack,
        fontSize: 18,
        textAlign: 'center',
    },
    textBody: {
        paddingTop: 0,
        paddingLeft: 0,
    },
    mapView: {
        marginTop: 20, alignItems: 'center', height: 180, width: "100%", borderRadius: 5,
    },
    cardBody: {
        padding: 20,
        flex: 1,
        backgroundColor: "#fff",
    },
    cardItem: {
        marginTop: 2,
        borderRadius: 5,
        elevation: 1,
    },
    boldText: {
        color: colors.textInputColor, fontSize: 14, fontWeight: "bold"
    },
    cardContainer: {
    },
    bgImage: {
        flex: 1, borderRadius: 5
    },
    openingHours: {
        color: colors.textInputColor, fontSize: 14, fontWeight: '600'
    },
    simpleText: {
        textAlign: 'center', color: colors.textInputColor, fontSize: 14, lineHeight: 22,
    }
});

export default compose(
    connect(
        (state: RootState) => ({
            users: state.firebase.ordered.user,
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
)(WelcomeScreen);
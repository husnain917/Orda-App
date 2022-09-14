import React, { useState, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, } from "react-native";
import Modal from 'react-native-modal';
import MapView, { Marker, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/AntDesign';

const MapModal = ({ isVisible, onCloseModal, locations, onPressOrder, currentLatLng }) => {
    const markerRef = useRef(null);
    const mapRef = useRef(null);
    const [coords, setCoords] = useState({ latitude: 0, longitude: 0 })
    const [mapViewKey, setMapViewKey] = useState(0)

    const onModalShow = () => {
        Geolocation.getCurrentPosition(info => {
            setCoords(info.coords)
            setImmediate(() => {
                if (!mapViewKey) {
                    setMapViewKey(Math.floor(Math.random() * 100))
                }
                mapRef.current.fitToElements(true)
            })
        })
    }

    return (
        <Modal
            isVisible={isVisible}
            style={styles.bottomModal}
            onModalShow={onModalShow}
        >
            <View style={styles.container}>
                <TouchableOpacity style={{ height: "15%" }} onPress={onCloseModal}></TouchableOpacity>
                <View style={styles.subContainer}>
                    <View style={styles.content}>
                        <TouchableOpacity onPress={onCloseModal} style={{ alignItems: 'flex-start' }}>
                            <Icon name='close' size={25} color={"gray"} style={{ padding: 10, right: 0}} />
                        </TouchableOpacity>
                        <MapView
                            key={mapViewKey}
                            region={{
                                latitude: currentLatLng?.lat ? currentLatLng.lat : coords.latitude,
                                longitude: currentLatLng?.lng ? currentLatLng.lng : coords.longitude,
                                latitudeDelta: 0.0200,
                                longitudeDelta: 0.0100,
                            }}
                            loadingEnabled
                            showsUserLocation
                            style={{ flex: 1, }}
                            ref={mapRef}
                            >
                            {locations.map((marker, index) => {
                                return (
                                    <Marker
                                        key={index}
                                        coordinate={marker.locationData?.coordinates}
                                        title={marker.name}
                                        description={marker.address}
                                        onCalloutPress={() => onPressOrder(marker)}
                                        ref={markerRef}
                                    >
                                        <Callout>
                                            <TouchableOpacity style={styles.callout} >
                                                <Text style={styles.storename}>{marker.name}</Text>
                                                <Text style={styles.address}>{marker.address}</Text>
                                                <Text style={styles.order} onPress={() => onPressOrder(marker)}>Order Now →</Text>
                                            </TouchableOpacity>
                                        </Callout>
                                    </Marker>
                                )
                            })}
                        </MapView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
export default MapModal;

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.1)",
    },
    subContainer: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    callout: {
        padding: 5,
    },
    order: {
        textAlign: 'right',
        marginTop: 12,
        fontWeight: 'bold',
        color: '#084DF8',
        fontSize: 16,
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    storename: {
        fontSize: 16, 
        fontWeight: '600', 
        lineHeight: 25
    },
    address: {
        maxWidth: 250,
        lineHeight: 22,
    }
})
import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native";
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/AntDesign';
import { Card, Button } from 'native-base';
import { colors } from "styles";
import { thumbnail, trimPrice } from "utils/helper";

const CheckoutModal = ({
    isVisible,
    onCloseModal,
    gotoCart,
    addItem = (item) => { }, 
    items,
    currency
}) => {

    return (
        <Modal
            isVisible={isVisible}
            style={styles.bottomModal}
            onSwipeComplete={onCloseModal}
        >
            <View style={styles.container}>
                <TouchableOpacity style={{ height: "25%" }} onPress={onCloseModal}></TouchableOpacity>
                <View style={styles.subContainer}>
                    <View style={styles.content}>
                        <TouchableOpacity onPress={onCloseModal}>
                            <Icon name='arrowleft' size={24} color={"gray"} style={{ padding: 10 }} />
                        </TouchableOpacity>
                        <Text style={styles.title}>People also liked</Text>
                        <FlatList
                            data={items.slice(0, 5)}
                            style={{ marginBottom: 50 }}
                            renderItem={({ item, index }) => (
                                <View style={{ marginTop: 1, marginHorizontal: 0, }}>
                                    <TouchableOpacity style={{ flex: 1, }} onPress={() => addItem(item)}>
                                        <Card noShadow key={index} style={[styles.itemContainer, { marginBottom: 0, marginTop: 0}]} >
                                            <View style={{ flex: 1, marginHorizontal: 10, justifyContent: 'space-between' }}>
                                                <View style={{ flex: 1, }}>
                                                    <Text style={styles.itemText}>{item.name}</Text>
                                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                                        <Icon name='like2' size={17} color={"green"} style={{ paddingRight: 10, }} />
                                                        <Text style={[styles.secondaryText, { marginVertical: 2 }]}>
                                                            {currency}{trimPrice(item.priceMin)}
                                                            {item.priceMin !== item.priceMax ? ` - ${currency}${trimPrice(item.priceMax)}` : ``}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.addNew}>
                                                        <Icon name='pluscircle' size={14} color={"darkgreen"} style={{ marginRight: 5, }} />
                                                        <Text style={[styles.secondaryText, { color: colors.black }]}>Add Now</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            { item.image && <Image source={{ uri: thumbnail(item.image, '512x512') }} style={{ width: 118, height: 118, marginLeft: 8, justifyContent: 'center', alignContent: 'center' }} />}
                                        </Card>
                                    </TouchableOpacity>
                                </View>

                            )}
                            keyExtractor={(index) => `item-${index}`} />
                        <View style={styles.buttonView}>
                            <Button full rounded style={styles.button} onPress={gotoCart}>
                                <Text style={styles.buttonText}>No thanks</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
export default CheckoutModal;

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.1)",
    },
    subContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    buttonView: {
        padding: 20,
        flex: 1,
        justifyContent: "flex-end"
    },
    title: {
        color: colors.black,
        fontSize: 30,
        margin: 10,
        fontWeight: "bold",
        marginLeft: 15
    },
    border: {
        borderWidth: 0.5,
        borderColor: "rgba(123, 132, 151, 0.4)",
        marginHorizontal: 12
    },
    itemContainer: {
        height: 130,
        flexDirection: 'row',
    },
    itemText: {
        marginTop: 20,
        color: colors.black,
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 30,
        maxHeight: 30,
        maxWidth: 300,
    },
    secondaryText: {
        color: colors.gray,
        fontSize: 14,
    },
    image: {
        flex: 1
    },
    details: {
        height: 70,
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    addNew: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: "#B6B6B6",
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        width: 110,
        marginBottom: 10,
        marginTop: 10,
    },
    button: {
        backgroundColor: colors.black, height: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 10
    },
    buttonText: {
        color: colors.ButtonTextColor, fontSize: 18,
    }
})
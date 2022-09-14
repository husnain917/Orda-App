import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, List, ListItem, Left, Right, Button } from 'native-base';
import AntDesignIcon from "react-native-vector-icons/MaterialIcons";
import { compose } from 'recompose';
import { connect } from 'react-redux';
import foodCore from "../../core/food";

import { colors } from '../../styles';
import { trimPrice } from "utils/helper";
import get from 'lodash/get'
import map from 'lodash/map'
import find from 'lodash/find'
import filter from 'lodash/filter'
import { useFirestore } from 'react-redux-firebase';
import { styles } from './ViewCartStyle'
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/AntDesign';
import { SwipeListView } from 'react-native-swipe-list-view';
import CheckoutModal from 'components/CheckoutModal';
import includes from 'lodash/includes'
import { useSelector, useDispatch } from "react-redux";

function ViewCart(props) {
    const firestore = useFirestore()
    const [discounts, setDiscounts] = useState(0);
    const [subTotalPrice, setSubTotalPrice] = useState(0);
    const [isChanged, setIsChanged] = useState(false);
    const [currency, setCurrency] = useState('USD')
    const [visible, setModalVisibility] = useState(false);
    const [recomendedItems, setRecommendedItems] = useState([]);
    const title = get(props.appSettings, `locationsMetadata.${props.locationId}.name`);
    const foods: any = useSelector(state => foodCore.selectors.getFoods(state));
    const fulfillmentType: any = useSelector(state => foodCore.selectors.getOrderFulfillmentType(state));
    const orderAt: any = useSelector(state => foodCore.selectors.getOrderAt(state));
    const recommendedItemIds: any = useSelector(state => foodCore.selectors.orderRecommendationIds(state));
    const [openSecondModal, setOpenModal] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!foods || !recommendedItemIds) {
            setOpenModal(false)
            return
        }
        const data = foods.filter(food => {
            return includes(recommendedItemIds, food.id)
        })
        setOpenModal(data.length > 0)
        setRecommendedItems(data)
    }, [foods, props.order])

    const renderItem = data => (
        <>
            <View
                style={styles.rowFront}
            >
                <View style={styles.itemContainer}>
                    <View style={styles.itemRow}>
                        <View style={styles.quantity}>
                            <Text style={styles.itemText}>{get(data.item, 'quantity')}</Text>
                        </View>
                        <View>
                            <Text style={styles.itemText}>{data.item.name}</Text>
                        </View>
                    </View>

                    <Text style={styles.itemText}>{currencySymbol()}{trimPrice(get(data.item, 'gross_sales_money.amount'))} </Text>
                </View>
                <View style={{ paddingLeft: 20 }}>
                    {get(data.item, 'modifiers', []).map(m => <Text numberOfLines={1} style={styles.modifierName}>{m.name}</Text>)}
                    {!!get(data.item, 'note') && <Text numberOfLines={1} style={styles.modifierName}>{data.item.note}</Text>}

                </View>
            </View>
            <View style={styles.border} />
        </>
    );

    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnRight]}
                onPress={() => deleteCart(data.item)}
            >
                <View style={[styles.iconContainer, { backgroundColor: '#FFF1EE' }]}>
                    <AntDesignIcon name='delete' size={14} color={"red"} />

                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnLeft]}
                onPress={() => editCart(data.item)}
            >
                <View style={styles.iconContainer}>
                    <AntDesignIcon name='edit' size={14} color={colors.black} />
                </View>
            </TouchableOpacity>
        </View>
    )

    const currencySymbol = () => {
        return currency === 'GBP' ? '£' : '$'
    }

    const getVariation = (editedLineItem: any) => {
        return find(props.variations, { id: editedLineItem.catalog_object_id })
    }

    const getItem = (editedLineItem: any) => {
        const variation = getVariation(editedLineItem)
        const id = get(variation, 'itemId')
        return find(props.items, { id })
    }

    const getOrderItems = (order) => {
        return filter(get(order, 'line_items'), o => (o.uid !== 'delivery' && o.uid !== 'service'))
    }

    const calculatedDeliveryFee = () => {
        const cartItems = get(props, 'order.line_items')
        return get(find(cartItems, { uid: 'delivery' }), 'total_money.amount', 0)
    }

    useEffect(() => {
        calculatePrice();
    }, [props.order]);

    useEffect(() => {
        setCurrency(get(props, 'appSettings.locations[0].currency', 'USD'))
    }, [props.appSettings]);

    useEffect(() => {
        if (isChanged) {
            setIsChanged(false);
            calculatePrice();
        }
    }, [isChanged]);

    const calculatePrice = () => {
        const discounts = get(props.order, 'net_amounts.discount_money.amount', 0)
        setDiscounts(discounts)
        const calc = get(props.order, 'net_amounts.total_money.amount', 0) - get(props.order, 'net_amounts.tax_money.amount', 0) - calculatedDeliveryFee()
        setSubTotalPrice(calc);
    }

    const editCart = (item) => {
        props.onCloseModal();
        props.navigation.push('FoodDetailScreen', { editedItem: item, isCheckoutModal: true  });
    };

    const deleteCart = async (key) => {
        await props.addOrdaOperation(firestore, props.locationId, {
            uid: key.uid,
            type: 1,
        })
    }

    const gotoCart = () => {
        Promise.resolve()
            .then(() => {
                setModalVisibility(false);
            })
            .then(() => {
                props.onCloseModal();
            })
            .then(() => {
                if (props.accountMobile) {
                    props.navigation.push('CartScreen', { fulfillmentType, orderAt });
                } else {
                    props.navigation.push('ProfileScreen', {});
                }    
            })
    }

    const addItem = (item) => {
        props.onCloseModal();
        setModalVisibility(false)
        props.navigation.push('FoodDetailScreen', { item, isEdit: false, upsell: true });
        return true
    }

    const subtotalComponent = () => {
    return <View style={{ flex: 1, marginBottom: 50, }}>
        <List style={{ backgroundColor: colors.white }}>

            {(discounts > 0) && <ListItem noBorder style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
                <Left>
                    <Text style={{ fontWeight: '600' }}>Discount:</Text>
                </Left>
                <Right>
                    <Text>-{currencySymbol()}{trimPrice(discounts)}</Text>
                </Right>
            </ListItem>}
            <ListItem noBorder style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
                <Left>
                    <Text style={{ fontWeight: '600' }}>Subtotal</Text>
                </Left>
                <Right>
                    <Text>{currencySymbol()}{trimPrice(subTotalPrice)}</Text>
                </Right>
            </ListItem>
        </List>
    </View>
    }

    return (
        <>
            <Modal
                isVisible={props.isVisible}
                style={styles.bottomModal}
            >
                <View style={styles.container}>
                    <TouchableOpacity style={{ height: "45%" }} onPress={props.onCloseModal}></TouchableOpacity>
                    <View style={styles.subContainer}>
                        <View style={styles.content}>
                            <TouchableOpacity onPress={props.onCloseModal}>
                                <Icon name='close' size={24} color={"gray"} style={{ margin: 10 }} />
                            </TouchableOpacity>
                            <Text style={styles.title}>{title}</Text>
                            <View style={[styles.border, { marginHorizontal: 0 }]} />
                                <SwipeListView
                                    data={getOrderItems(props.order)}
                                    key={Math.random().toString()}
                                    renderItem={renderItem}
                                    renderHiddenItem={renderHiddenItem}
                                    rightOpenValue={-100}
                                    previewRowKey={'0'}
                                    previewOpenValue={-40}
                                    previewOpenDelay={3000}
                                    ListFooterComponent={subtotalComponent}
                                />
                            <View style={styles.buttonView}>
                                <Button disabled={subTotalPrice === 0} full rounded style={styles.button} onPress={() => openSecondModal ? setModalVisibility(true) : gotoCart()}>
                                    <Text style={styles.buttonText}>Go to Checkout
                                    </Text>
                                    {
                                        get(props, 'ordaOperations.length') ? <ActivityIndicator size="small" animating={true} color={colors.whiteTwo} /> : null
                                    }
                                </Button>
                            </View>
                        </View>
                    </View>
                </View>
                <CheckoutModal isVisible={visible}
                    onCloseModal={() => setModalVisibility(false)}
                    gotoCart={gotoCart}
                    addItem={(item) => addItem(item)}
                    items={recomendedItems}
                    currency={currencySymbol()} />
            </Modal>
        </>
    );
}

export default compose(
    connect(
        state => ({
            carts: foodCore.selectors.getCarts(state),
            ordaId: foodCore.selectors.getOrdaId(state),
            order: foodCore.selectors.getOrder(state),
            ordaOperations: foodCore.selectors.getOrdaOperations(state),
            appSettings: foodCore.selectors.getAppSettings(state),
            locationId: foodCore.selectors.getLocationId(state),
            paymentErrors: foodCore.selectors.getPaymentErrors(state),
            payment: foodCore.selectors.getPayment(state),
            customer: foodCore.selectors.getCustomer(state),
            customerCards: foodCore.selectors.getCustomerCards(state),
            accountName: foodCore.selectors.getAccountName(state),
            accountMobile: foodCore.selectors.getAccountMobile(state),
            accountLoyalty: foodCore.selectors.getAccountLoyalty(state),
            account: foodCore.selectors.getAccount(state),
            orderPoints: foodCore.selectors.getOrderPoints(state),
            term: foodCore.selectors.getLoyaltyTerm(state),
            myAddress: foodCore.selectors.getMyAddress(state),
            variations: foodCore.selectors.getVariations(state),
            items: foodCore.selectors.getFoods(state),
            masterMerchant: foodCore.selectors.masterMerchant(state),
            currentMerchant: foodCore.selectors.currentMerchant(state),
            couponEnabled: foodCore.selectors.couponEnabled(state),
            redemption: foodCore.selectors.redemption(state),
            redemptionErrors: foodCore.selectors.redemptionErrors(state),
            couponCode: foodCore.selectors.couponCode(state),
        }),
        dispatch => ({
            setCustomerCards: (data) => dispatch(foodCore.actions.setCustomerCards(data)),
            setCouponCode: (data) => dispatch(foodCore.actions.setCouponCode(data)),
            addCart: (data) => dispatch(foodCore.actions.addCart(data)),
            addOrdaOperation: (firestore, locationId, item) => dispatch(foodCore.actions.addOrdaOperation(firestore, locationId, item)),
            cartListener: (doc) => dispatch(foodCore.actions.cartListener(doc)),
            setOrdaId: (ordaId) => dispatch(foodCore.actions.setOrdaId(ordaId)),
            addUnstagedSubtotal: (amount) => dispatch(foodCore.actions.addUnstagedSubtotal(amount)),

        }),
    ),
)(
    ViewCart,
);

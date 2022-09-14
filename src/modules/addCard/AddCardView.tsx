import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, FlatList, Platform, Alert, Modal, Image } from 'react-native';
import { Container, Text, List, ListItem, Left, Right, Card, Button, Icon } from 'native-base';
import AntDesignIcon from "react-native-vector-icons/AntDesign";
import { SQIPCardEntry, SQIPApplePay, SQIPGooglePay } from 'react-native-square-in-app-payments';

import { SMHeader, TakePicker, SMContent, SMFooter } from "../../components";
import Tipping from './Tipping'
import { colors } from '../../styles';
import { distance, isOpen, notEmpty, trimPrice } from "utils/helper";
import get from 'lodash/get'
import map from 'lodash/map'
import find from 'lodash/find'
import each from 'lodash/each'
import intersection from 'lodash/intersection'
import filter from 'lodash/filter'
import { ActivityIndicator } from "react-native";
import { useFirestore } from 'react-redux-firebase';
import { styles } from './AddCardStyle'
import Redeem from 'components/Redeem';
import SavedCards from './SavedCards';
import AddCoupon from './AddCoupon';

import messaging from '@react-native-firebase/messaging';
import { applePayMerchantId } from '../../config/config'

const CategoryItem = ({ data, onDeleteCart, onEditCart, currencySymbol }) => {
  const showEdit = get(data, 'uid') !== 'delivery' && get(data, 'uid') !== 'service'

  return showEdit && <Card transparent style={{ borderBottomWidth: 0.4 }}>
    <View style={{ marginBottom: 10, padding: 10, backgroundColor: colors.white, flexDirection: 'row' }}>
      <View style={{ flex: 1, marginVertical: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text numberOfLines={1} style={{ fontSize: Platform.OS === 'ios' ? 16 : 12, height: 20, width: 20, paddingHorizontal: 6, marginRight: 15, color: colors.darkGray, fontWeight: '500', backgroundColor: '#eeeeee' }}>{get(data, 'quantity')}</Text>
          <Text numberOfLines={1} style={{ fontWeight: '500', }}>{get(data, 'name')}</Text>
          <Text style={{ alignSelf: 'flex-end', fontSize: 16, color: colors.darkGray, paddingLeft: 7,  }}>{currencySymbol}{trimPrice(get(data, 'gross_sales_money.amount'))} </Text>
        </View>

        <View style={{ marginTop: 10}}>
          {get(data, 'modifiers', []).map(m => <Text numberOfLines={1} style={{ fontSize: 14, paddingBottom: 7, fontWeight: '300', textTransform: 'capitalize' }}>{m.name}</Text>)}
          {!!get(data, 'note') && <Text numberOfLines={1} style={{ fontSize: 12, paddingBottom: 7, fontWeight: '300', }}>{data.note}</Text>}
        </View>

        <View>
          <TouchableOpacity
            onPress={() => onDeleteCart()}
            style={{ position: 'absolute', justifyContent: 'center', bottom: 10, right: 5, width: 22, height: 22, zIndex: 100, backgroundColor: '#EF444433', borderRadius: 3, }}
          >
            <Icon type="FontAwesome" style={{ paddingLeft: 5, fontSize: 14, color: '#EF4444' }} name='trash'  />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onEditCart()}
            style={{ position: 'absolute', justifyContent: 'center', bottom: 10, right: 40, width: 22, height: 22, zIndex: 100, backgroundColor: '#E5E7EB', borderRadius: 3, }}
          >
            <Icon type="MaterialIcons" style={{ paddingLeft: 5, fontSize: 14 }} name='edit' />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Card>
};

export default function CartScreen(props) {
  const firestore = useFirestore()
  const [discounts, setDiscounts] = useState(0);
  const [tipPrice, setTipPrice] = useState(0);
  const [taxPrice, setTaxPrice] = useState(0);
  const [subTotalPrice, setSubTotalPrice] = useState(0);
  const [isChanged, setIsChanged] = useState(false);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [isApplePay, setApplePay] = useState(false)
  const [isGooglePay, setGooglePay] = useState(false)
  const [isLoyaltyOnlyPay, setLoyaltyOnlyPay] = useState(false)
  const [isSavedCards, setSavedCards] = useState(false)
  const [isShowMySavedCards, setShowMySavedCards] = useState(false)
  const [isShowAddCoupon, setShowAddCoupon] = useState(false)
  const [currentOperation, setCurrentOperation] = useState(null)
  const [paymentError, setPaymentErrors] = useState(null)
  const [addressError, setAddressError] = useState(false)
  const [minimumOrder, setMinimumOrder] = useState(0)
  const [deliveryRadius, setDeliveryRadius] = useState(1)
  const [shippingStates, setShippingStates] = useState(null)
  const [setupRequired, setSetupRequired] = useState(true)
  const [tipSettings, setTipSettings] = useState(null)
  const [currency, setCurrency] = useState('USD')
  const [couponCode, setCouponCode] = useState('')

  useEffect(() => {
    if (setupRequired) {
      setSetupRequired(false)
      if (Platform.OS === 'ios') {
        SQIPApplePay.initializeApplePay(applePayMerchantId).then(async () => {
          const canApplePay = await SQIPApplePay.canUseApplePay()
          setApplePay(canApplePay)
        })
      } else if (Platform.OS === 'android') {
        SQIPGooglePay.initializeGooglePay(props.locationId, SQIPGooglePay.EnvironmentProduction).then(async () => {
          const canGooglePay = await SQIPGooglePay.canUseGooglePay()
          setGooglePay(canGooglePay)
        })
      }
    }
  }, [props.locationId])

  useEffect(() => {
    if (props.couponCode && props.redemption) {
      setCouponCode(props.couponCode)
    }
  }, [props.couponCode, props.redemption])

  const [method, setMethod] = useState(props.navigation.getParam('fulfillmentType') || 'pickup')
  const [location, setLocation] = useState({ latitude: 0, longitude: 0, address: 0 })
  const [at, setAt] = useState(props.navigation.getParam('orderAt') || { text: 'ASAP', value: 'ASAP' })

  const currencySymbol = () => {
    return currency === 'GBP' ? '£' : '$'
  }

  const getLatitude = () => {
    return location.latitude
  }

  const getLongitude = () => {
    return location.longitude
  }

  const getAtText = () => {
    return at.text
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
    const lineItems = filter(get(order, 'line_items'), o => (o.uid !== 'delivery' && o.uid !== 'service'))
    return map(lineItems, li => {
      const item = getItem(li)
      return {
        modifiers: map(get(li, 'modifiers', []), m => (m.catalog_object_id)),
        note: li.note,
        quantity: 1,
        tax_ids: item.taxIds || [],
        text: li.name,
        variation: li.catalog_object_id,
      }
    })
  }

  const addBeanWithOrder = async () => {
    const bean = {
      addItemData: getOrderItems(props.order),
      connectAccountData: {
        mobile: get(props.account, 'mobile'),
        name: get(props.account, 'name'),
        prefix: get(props.account, 'prefix', '+1'),
      },
      createdAt: new Date().toISOString(),
      locationId: props.locationId,
      merchantId: props.currentMerchant || props.masterMerchant,
      programId: get(props.account, 'loyalty.program_id')
    }
    await firestore.set(`beans/${props.ordaId}`, bean)
  }

  const gotoSuccess = async () => {
    await addBeanWithOrder()

    // reset selected order info
    props.setOrderAt(null)
    props.setOrderFulfillmentType(null)

    const location = {
      latitude: getLatitude(),
      longitude: getLongitude(),
    }
    const fulfillment = {
      type: method,
      at: getAtText(),
    }
    props.navigation.navigate('SuccessScreen', { location, fulfillment })
  }

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await messaging().subscribeToTopic(props.masterMerchant)
      if (get(props, 'order.id')) {
        await messaging().subscribeToTopic(props.order.id)
      }
      console.log('Authorization status:', authStatus, props.ordaId);
    }
  }

  useEffect(() => {
    requestUserPermission()
  }, [])

  useEffect(() => {
    const serviceFee = get(props.appSettings, `apps.apps-service-fee.serviceFee`, 0)
    if (!subTotalPrice || !serviceFee) {
      return
    }
    props.addOrdaOperation(firestore, props.locationId, {
      serviceFee,
      type: 16,
    })
  }, [subTotalPrice])

  const isNotPickup = () => {
    return method === 'delivery' || method === 'shipping'
  }

  const calculatedDeliveryFee = () => {
    const cartItems = get(props, 'order.line_items')
    return get(find(cartItems, { uid: 'delivery' }), 'total_money.amount', 0)
  }

  const calculatedServiceFee = () => {
    const cartItems = get(props, 'order.line_items')
    return get(find(cartItems, { uid: 'service' }), 'total_money.amount', 0)
  }

  const getDeliveryFee = (type) => {
    if (type === 'delivery') {
      return get(props.appSettings, `apps.apps-doordash.deliveryFee`, 0) || get(props.appSettings, `postmates.deliveryFee`, 0) || get(props.appSettings, `apps.app-inhouse-deliveries.deliveryFee`, 0)
    } else if (type === 'shipping') {
      return get(props.appSettings, `apps.apps-shipping.shippingFee`, 0)
    }
    return 0
  }

  useEffect(() => {
    if (props.payment) {
      gotoSuccess()
    }
  }, [props.payment])

  useEffect(() => {
    setAddressError(null)
    if (method === 'delivery') {
      const geo = get(props, 'myAddress.geo', {})
      setAddressError(!validDistance(geo))
    }
    if (method === 'shipping') {
      setAddressError(!validStates(props.myAddress || {}))
    }
  }, [method, props.myAddress])

  useEffect(() => {
    if (props.paymentErrors && props.paymentErrors[currentOperation]) {
      const paymentErrorMessage = get(props.paymentErrors[currentOperation], '[0].detail')
      setPaymentErrors(paymentErrorMessage)
    } else {
      setPaymentErrors(null)
    }
  }, [props.paymentErrors])

  useEffect(() => {
    calculatePrice();
  }, [props.order]);

  const configureTipping = (method = null) => {
    const ts = get(props.appSettings, `apps.apps-tipping.isEnabled`) && get(props.appSettings, `apps.apps-tipping`)
    // make sure delivery orders tip is selected
    if (method === 'delivery' && ts && !ts.defaultValue && ts.tipOptions.length) {
      ts.defaultValue = ts.tipOptions[0].value
    }
    setTipSettings(ts)
  }

  useEffect(() => {
    const om = get(props.appSettings, `apps.apps-doordash.minimumOrder`, 0) || get(props.appSettings, `postmates.minimumOrder`, 0) || get(props.appSettings, `apps.app-inhouse-deliveries.minimumOrder`, 0) || get(props.appSettings, `apps.apps-shipping.minimumOrder`, 0)
    setMinimumOrder(parseFloat(om))

    const dr = get(props.appSettings, `apps.apps-doordash.deliveryRadius`) || get(props.appSettings, `postmates.deliveryRadius`) || get(props.appSettings, `apps.app-inhouse-deliveries.deliveryRadius`, 1)
    setDeliveryRadius(parseFloat(dr))

    const ss = get(props.appSettings, `apps.apps-shipping.shippingStates`, null)
    setShippingStates(ss)

    configureTipping()

    setCurrency(get(props, 'appSettings.locations[0].currency', 'USD'))
  }, [props.appSettings]);

  useEffect(() => {
    console.log('******* props.ordaOperations', props.ordaOperations)
    const isVisble = get(props, 'ordaOperations.length', 0) > 0
    setIsOperationLoading(isVisble)
    if (!get(props, 'order.line_items.length', 0) && !get(props, 'ordaOperations.length')) {
      props.navigation.pop()
    }
  }, [props.ordaOperations]);

  useEffect(() => {
    if (isChanged) {
      setIsChanged(false);
      calculatePrice();
    }
  }, [isChanged]);

  useEffect(() => {
    setSavedCards(get(props.customerCards, 'length') > 0)
  }, [props.customerCards])

  const calculatePrice = () => {
    const discounts = get(props.order, 'net_amounts.discount_money.amount', 0)
    setDiscounts(discounts)
    const calc = get(props.order, 'net_amounts.total_money.amount', 0) - get(props.order, 'net_amounts.tax_money.amount', 0) - calculatedDeliveryFee() - calculatedServiceFee()
    setSubTotalPrice(calc);
    const tax = get(props.order, 'net_amounts.tax_money.amount', 0)
    setTaxPrice(tax)
    setLoyaltyOnlyPay(discounts > 0 && (calc + tax + calculatedDeliveryFee() + calculatedServiceFee()) === 0)
  }

  const editCart = (item) => {
    props.navigation.push('FoodDetailScreen', { editedItem: item });
  };

  const deleteCart = (key) => {
    props.addOrdaOperation(firestore, props.locationId, {
      uid: key.uid,
      type: 1,
    })
  }

  const getDeliveryAddress = () => {
    const address_components = get(props.myAddress, 'address.address_components', [])
    const secondary = get(props.myAddress, 'address.structured_formatting.secondary_text', '')
    const splitted = secondary.split(', ')
    return isNotPickup() ? {
      address_line_1: get(props.myAddress, 'address.structured_formatting.main_text'),
      address_line_2: get(props.myAddress, 'apt'),
      locality: splitted[0] || '',
      administrative_district_level_1: splitted[1] || '',
      full_address: get(props, 'myAddress.address.description'),
      address_components,
    } : {}
  }

  const getStoreCordinates = () => {
    const storeLocation = find(get(props.appSettings, `locations`), { id: props.locationId })
    const latitude = get(storeLocation, 'coordinates.latitude', 40.77756)
    const longitude = get(storeLocation, 'coordinates.longitude', -73.978389)
    return { latitude, longitude }
  }

  const validStates = (myAddress) => {
    if (!shippingStates || !shippingStates.length) {
      return true
    }
    const states = map(shippingStates, 'city')
    const terms = get(myAddress, 'address.terms')
    if (!terms) {
      return false
    }
    const termsValues = map(terms, 'value')
    return (intersection(termsValues, states) || []).length > 0
  }

  const validDistance = (geo) => {
    return calcDistance(geo) <= deliveryRadius
  }

  const calcDistance = (geo) => {
    const storeCordinates = getStoreCordinates()
    return distance(storeCordinates.latitude, storeCordinates.longitude, geo.lat, geo.lng, "M")
  }

  const isAsap = () => {
    return get(at, 'text') === 'ASAP'
  }

  const pickupAt = () => {
    const date = isAsap() ? Date.now() : get(at, 'value')
    return new Date(date).toISOString()
  }

  const getDoordashInfo = () => {
    const doordashDisabled = !get(props.appSettings, 'apps.apps-doordash')
    if (doordashDisabled) {
      return {}
    }
    const geo = get(props, 'myAddress.geo', {})
    return {
      pickup: getRestaurantDetails(),
      enabled: true,
      distance: calcDistance(geo) || 4,
      order_value: get(props.order, 'net_amounts.total_money.amount', 100),
      external_store_id: props.currentMerchant,
      num_items: Math.max(1, get(props.order, 'line_items.length', 1) - 1),
    }
  }

  const checkAsapIsOutdated = () => {
    if (isAsap()) {
      const locationId = props.locationId
      const location = find(get(props, 'appSettings.locations'), { id: locationId })
      const periods = get(location, 'business_hours.periods')
      props.setOrderAheadTimes(get(location, 'business_hours.periods'))
      return !isOpen(periods, new Date())
    }
    return false
  }

  const nonceGenerated = async (ev) => {
    const nonce = ev.nonce
    const save = ev.save
    const customer_id = ev.customer_id
    console.log(nonce)
    const ordaOperation = {
      type: 3,
      source_id: nonce,
      is_app: true,
      is_curbside_pickup: this.diningType === 'Curbside',
      pickup_at: pickupAt(),
      fulfillment_type: method,
      account_name: props.accountName,
      account_phone: props.accountMobile,
      account_address: getDeliveryAddress(),
      is_asap: isAsap(),
      postmates: {
        apiKey: get(props, 'appSettings.postmates.apiKey', ''),
        customerId: get(props, 'appSettings.postmates.customerId', ''),
        pickup: getRestaurantDetails()
      },
      doordash: getDoordashInfo(),
      amount_money: {
        amount: totalPriceWithoutTip(),
        currency,
      },
      tip: tipPrice && {
        amount: tipPrice,
        currency,
      },
      customer_id,
      save
    }
    const createdAt = await props.addOrdaOperation(firestore, props.locationId, ordaOperation)
    setCurrentOperation(createdAt)
  }

  const getRestaurantDetails = () => {
    const storeLocation = find(get(props, `appSettings.locations`), { id: props.locationId })
    if (!storeLocation) {
      return null
    }

    const phone_number = get(props, `appSettings.locationsMetadata.${props.locationId}.phone`) || storeLocation.phone_number
    const address = get(storeLocation, 'address.address_line_1') + ", " + get(storeLocation, 'address.locality') + ", " + get(storeLocation, 'address.administrative_district_level_1') + ", " + get(storeLocation, 'address.postal_code')
    return {
      name: storeLocation.business_name || storeLocation.name,
      address,
      phone_number,
      business_name: storeLocation.business_name || storeLocation.name,
      full_address: get(storeLocation, 'address', {}),
      coordinates: get(storeLocation, 'coordinates', {})
    }
  }

  const onCardNonceRequestSuccess = (cardDetails) => {
    SQIPCardEntry.completeCardEntry(
      () => {
        if (!props.customer) {
          nonceGenerated(cardDetails)
          return
        }
        Alert.alert(
          "Save Credit Card?",
          "Your credit card will be saved securely in the app for future purchases so ordering is even faster",
          [
            {
              text: "Skip",
              onPress: () => {
                nonceGenerated(cardDetails)
              },
              style: "cancel"
            },
            {
              text: "Save Card", onPress: () => {
                cardDetails.save = {
                  customer: props.customer,
                  card: {
                    merchantId: props.currentMerchant,
                    brand: get(cardDetails, 'card.brand' || 'VISA'),
                    lastFourDigits: get(cardDetails, 'card.lastFourDigits' || '1111'),
                    expirationMonth: get(cardDetails, 'card.expirationMonth' || 11),
                    expirationYear: get(cardDetails, 'card.expirationYear' || new Date().getFullYear() + 1),
                  }
                }
                nonceGenerated(cardDetails)
              }
            }
          ]
        );
      }
    );
  }

  const onCardEntryCancel = () => {
  }

  const redeem = (id) => {
    const accountId = get(props.accountLoyalty, 'id')
    const rewardId = id
    props.addOrdaOperation(firestore, props.locationId, {
      type: 5,
      accountId,
      rewardId
    })
  }

  const unredeem = (id) => {
    const rewardId = id
    props.addOrdaOperation(firestore, props.locationId, {
      type: 6,
      rewardId
    })
  }

  const onCreditCard = () => {
    if (checkAsapIsOutdated()) {
      return
    }

    if (isSavedCards) {
      onStoredCard()
    } else {
      onCheckout()
    }
  }

  const onStoredCard = async () => {
    setShowMySavedCards(true)
  }

  const onDelete = (removed) => {
    const cards = []
    each(props.customerCards, card => {
      if (card.cardId !== removed.cardId) {
        cards.push(card)
      }
    })
    props.setCustomerCards(cards)
  }

  const onCheckout = async () => {
    const cardEntryConfig = {
      collectPostalCode: true,
      currencyCode: get(props.appSettings, 'locations[0].currency', 'USD'),
      buyerAction: 'Charge',
      amount: totalPrice(),
    };

    try {
      await SQIPCardEntry.startCardEntryFlow(
        cardEntryConfig,
        onCardNonceRequestSuccess,
        onCardEntryCancel,
      );
    } catch (e) {
      console.log("**** ERROR")
    }
  }

  const totalPrice = () => {
    return totalPriceWithoutTip() + tipPrice
  }

  const totalPriceWithoutTip = () => {
    return subTotalPrice + taxPrice + calculatedDeliveryFee() + calculatedServiceFee()
  }

  const onApplePayNonceRequestSuccess = async (cardDetails) => {
    await SQIPApplePay.completeApplePayAuthorization(true);
    nonceGenerated(cardDetails)
  }

  const onApplePayNonceRequestFailure = async (errorInfo) => {
    await SQIPApplePay.completeApplePayAuthorization(false, errorInfo.message);
  }

  const onApplePayEntryComplete = () => {
  }

  const onApplePay = async () => {
    if (checkAsapIsOutdated()) {
      return
    }

    const applePayConfig = {
      price: trimPrice(totalPrice()).toString(),
      summaryLabel: get(props.appSettings, 'general.appName'),
      countryCode: get(props.appSettings, 'locations[0].country'),
      currencyCode: get(props.appSettings, 'locations[0].currency'),
      paymentType: SQIPApplePay.PaymentTypeFinal,
    };

    try {
      await SQIPApplePay.requestApplePayNonce(
        applePayConfig,
        onApplePayNonceRequestSuccess,
        onApplePayNonceRequestFailure,
        onApplePayEntryComplete,
      );
    } catch (ex) {
      console.log(ex)
      // Handle InAppPaymentsException
    }
  }

  const onGooglePayNonceRequestSuccess = (cardDetails) => {
    nonceGenerated(cardDetails)
  }

  const onGooglePayNonceRequestFailure = (result) => {
    Alert.alert(
      "Google Pay Error",
      'Please setup your Google Pay settings first'
    )
  }
  const onGooglePayCancel = () => {
  }

  const onGooglePay = async () => {
    if (checkAsapIsOutdated()) {
      return
    }

    const googlePayConfig = {
      price: trimPrice(totalPrice()).toString(),
      currencyCode: get(props.appSettings, 'locations[0].currency'),
      priceStatus: SQIPGooglePay.TotalPriceStatusFinal,
    };
    try {
      await SQIPGooglePay.requestGooglePayNonce(
        googlePayConfig,
        onGooglePayNonceRequestSuccess,
        onGooglePayNonceRequestFailure,
        onGooglePayCancel,
      );
    } catch (ex) {
      Alert.alert(
        "Error with Google Pay",
        'Please setup your Google Pay settings first'
      )
      // Handle InAppPaymentsException
    }
  }

  const onLoyaltyPay = () => {
    if (checkAsapIsOutdated()) {
      return
    }

    nonceGenerated({ nonce: 0 })
  }

  const atUpdated = (at) => {
    props.setOrderAt(at)
    setAt(at)
  }

  const methodUpdated = ({ type, previousType }) => {
    const previousDeliveryFee = parseFloat(getDeliveryFee(previousType))
    const deliveryFee = parseFloat(getDeliveryFee(type))
    props.setOrderFulfillmentType(type)
    setMethod(type)
    configureTipping(type)
    if (!deliveryFee && !previousDeliveryFee) {
      return
    }
    const notPickup = (type === 'delivery' || type === 'shipping')
    if (notPickup && previousType !== type) {
      props.addOrdaOperation(firestore, props.locationId, {
        type: 12,
        fulfillment_type: type,
        deliveryFee: deliveryFee * 100,
        currency,
      })
    } else if (!notPickup && previousType !== type && previousType) {
      props.addOrdaOperation(firestore, props.locationId, {
        type: 12,
        fulfillment_type: type,
      })
    }
  }

  const isUnderMinimum = () => {
    return isNotPickup() && ((subTotalPrice + taxPrice) < 100 * minimumOrder)
  }

  const paymentDisabled = () => {
    if (isOperationLoading) { // loading
      return true
    }
    if (isNotPickup()) { // delivery with no address or under minimum
      return (!props.myAddress || addressError) || ((subTotalPrice + taxPrice) < 100 * minimumOrder)
    }
    return false
  }

  const onTipSelect = (tipSelected) => {
    setTipPrice(tipSelected || 0)
  }

  const addCoupon = () => {
    setShowAddCoupon(true)
  }

  const removeCoupon = () => {
    if (props.redemption) {
      const discountId = get(props.redemption, 'discount_code_id')
      const redemptionId = get(props.redemption, 'id')
      const redemptionVersion = get(props.redemption, 'version')
      props.addOrdaOperation(firestore, props.locationId, {
        type: 15,
        discountId,
        redemptionId,
        redemptionVersion,
      })
      props.setCouponCode('')
      setCouponCode('')
    }
  }

  const closeCouponModal = () => {
    setShowAddCoupon(false)
  }

  const onAddCouponClose = (code) => {
    if (!code) {
      return
    }
    setCouponCode(code)
    props.setCouponCode(code)
    closeCouponModal()
    setTimeout(() => {
      props.addOrdaOperation(firestore, props.locationId, {
        type: 14,
        code,
      })
    }, 1000);
  }

  return (
    <Container>
      <SMHeader title={"Your Order"} navigation={props.navigation} hasTabs isMenu={false} isBack isRefresh={false} />
      <SMContent>
        <Modal
          transparent={true}
          animationType={'none'}
          visible={isOperationLoading}>
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
              <ActivityIndicator animating={true} color={colors.black} />
              <Text style={{ paddingTop: 10, fontSize: 11 }}>{"Building your cart..."}</Text>
            </View>
          </View>
        </Modal>

        <SavedCards show={isShowMySavedCards} customerCards={props.customerCards} onNew={onCheckout} onSelected={nonceGenerated} onClose={() => setShowMySavedCards(false)} onDelete={onDelete} customerId={props.customer} currentMerchant={props.currentMerchant} />

        <TakePicker init={{ orderAt: props.navigation.getParam('orderAt'), fulfillmentType: props.navigation.getParam('fulfillmentType') }} onAt={atUpdated} onLocation={setLocation} onMethodSelected={methodUpdated} onCancel={() => { }} logoUrl={get(props.appSettings, 'general.logoUrl')} />

        <Redeem onApply={(id) => redeem(id)} onUnredeem={(id) => unredeem(id)} menuBackgroundColor={get(props.appSettings, 'theme.menuBackgroundColor', '#000')} />

        <AddCoupon show={isShowAddCoupon} onClose={onAddCouponClose} onCancel={closeCouponModal} />

        {notEmpty(props.order) && notEmpty(props.order.line_items) && props.order.line_items.map((item: any) => {
          return (<CategoryItem
            currencySymbol={currencySymbol()}
            data={item}
            onEditCart={() => editCart(item)}
            onDeleteCart={() => deleteCart(item)}
          />);
        })}
        <View style={{ flex: 1 }}>
          <List style={{ backgroundColor: colors.white }}>
            {props.couponEnabled && <ListItem noBorder style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
              <Left style={{ flex: 0.5 }}>
                <TouchableOpacity onPress={() => couponCode && !props.redemptionErrors ? removeCoupon() : addCoupon()} style={{ flex: 1, justifyContent: 'flex-start', flexDirection: 'row' }}>
                  <AntDesignIcon name={couponCode && !props.redemptionErrors ? 'minus' : 'plus'} size={14} color={colors.blue} />
                  <Text style={{ fontWeight: '300', fontSize: 14, marginLeft: 5, color: colors.blue }}>{couponCode && !props.redemptionErrors ? 'REMOVE' : 'ADD'} COUPON</Text>
                </TouchableOpacity>
              </Left>
              <Right style={{ flex: 0.5 }}>
                {!!props.redemptionErrors && <Text style={{ fontWeight: '400', fontSize: 14, marginLeft: 5, color: colors.darkRed }}>MISSING COUPON</Text>}
                {!props.redemptionErrors && !!couponCode && <Text style={{ fontWeight: '500', fontSize: 16, color: colors.blue }}>{couponCode}</Text>}
              </Right>
            </ListItem>}
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
            {!!taxPrice && <ListItem noBorder style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
              <Left>
                <Text style={{ fontWeight: '600' }}>Tax</Text>
              </Left>
              <Right>
                <Text>{currencySymbol()}{trimPrice(taxPrice)}</Text>
              </Right>
            </ListItem>}
            {!!tipPrice && <ListItem noBorder style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
              <Left>
                <Text style={{ fontWeight: '600' }}>Tip</Text>
              </Left>
              <Right>
                <Text>{currencySymbol()}{trimPrice(tipPrice)}</Text>
              </Right>
            </ListItem>}
            {(calculatedDeliveryFee() > 0) && (method === 'delivery' || method === 'shipping') && <ListItem noBorder style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
              <Left>
                <Text style={{ fontWeight: '600' }}>{method === 'delivery' ? 'Delivery' : 'Shipping'} Fee</Text>
              </Left>
              <Right>
                <Text>{currencySymbol()}{trimPrice(calculatedDeliveryFee())}</Text>
              </Right>
            </ListItem>}
            {(calculatedServiceFee() > 0) && <ListItem noBorder style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
              <Left>
                <Text style={{ fontWeight: '600' }}>Service Fee</Text>
              </Left>
              <Right>
                <Text>{currencySymbol()}{trimPrice(calculatedServiceFee())}</Text>
              </Right>
            </ListItem>}
            <ListItem noBorder style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
              <Left>
                <Text style={{ fontWeight: '600' }}>Total</Text>
              </Left>
              <Right>
                <Text>{currencySymbol()}{trimPrice(totalPrice())}</Text>
              </Right>
            </ListItem>
            {(props.orderPoints > 0) && <ListItem noBorder style={{ paddingBottom: 0, padding: 0, margin: 0 }}>
              <Left>
                <Text style={{ fontWeight: '600' }}>Earned {props.term.toLowerCase()} in this order</Text>
              </Left>
              <Right>
                <Text>{props.orderPoints}</Text>
              </Right>
            </ListItem>}
            {!!tipSettings && <Tipping tipSettings={tipSettings} currencyCode={currency} defaultValue={tipSettings && tipSettings.defaultValue} amount={totalPriceWithoutTip()} onTipSelect={onTipSelect} />}
          </List>
        </View>
      </SMContent>
      <SMFooter style={{ height: (75 + (isApplePay ? 50 : 0) + (isGooglePay ? 50 : 0)) }}>
        <View style={{ flex: 1, paddingHorizontal: 10, paddingBottom: 0 }}>
          {paymentError && <Text style={{ width: '100%', textAlign: 'center', paddingBottom: 10, color: '#ff0033' }}>{paymentError}</Text>}
          {props.myAddress && addressError && <Text style={{ width: '100%', textAlign: 'center', paddingBottom: 10, color: '#ff0033' }}>We currently don't {method == 'delivery' ? 'deliver' : 'ship'} to your addresses</Text>}
          {isUnderMinimum() && <Text style={{ width: '100%', textAlign: 'center', paddingBottom: 10, color: '#ff0033' }}>Delivery minimum order is {currencySymbol()}{minimumOrder}</Text>}
          {isGooglePay &&
            <Button full iconLeft rounded disabled={paymentDisabled()} style={{ height: 50, backgroundColor: paymentDisabled() ? colors.grey : colors.black }} onPress={onGooglePay}>
              <Image style={{ width: 125, height: 19, marginLeft: -10 }} source={require('../../assets/google_pay.png')} />
            </Button>}
          {isApplePay &&
            <Button full iconLeft rounded disabled={paymentDisabled()} style={{ height: 50, backgroundColor: paymentDisabled() ? colors.grey : colors.black }} onPress={onApplePay}>
              <Text style={{ color: colors.ButtonTextColor }}>Check out with</Text>
              <Image style={{ width: 49, height: 20, marginLeft: -10 }} source={require('../../assets/apple_pay.png')} />
            </Button>}
          {isLoyaltyOnlyPay &&
            <Button full iconLeft rounded disabled={paymentDisabled()} style={{ height: 50, backgroundColor: paymentDisabled() ? colors.grey : colors.black, marginTop: 10, }} onPress={onLoyaltyPay}>
              <Text style={{ color: colors.ButtonTextColor }}>Check out</Text>
            </Button>}
          {!isLoyaltyOnlyPay && <Button full rounded disabled={paymentDisabled()} style={{ height: 50, backgroundColor: paymentDisabled() ? colors.grey : colors.black, marginTop: 10, }} onPress={onCreditCard}>
            <Text style={{ color: colors.ButtonTextColor }}>Check out with Credit Card </Text>
          </Button>}
        </View>
      </SMFooter>

    </Container>
  );
}
import * as actions from './actions';
import { notEmpty, isOpen } from "utils/helper";
import moment from "moment";
import set from 'lodash/set'
import get from 'lodash/get'
import find from 'lodash/find'
import clone from 'lodash/clone'
import includes from 'lodash/includes'
import findKey from 'lodash/findKey'
import padStart from 'lodash/padStart'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const startOfHour = t => moment(t).startOf('hour')
const isAfter = (x, y) => x.isAfter(y)

const InitialState = {
  locations: [],
  appSettings: {},
  categories: null,
  variations: null,
  modifiers: null,
  foods: [],
  taxes: [],
  
  secondaryCategories: {},
  secondaryVariations: {},
  secondaryModifiers: {},
  secondaryFoods: {},
  secondaryTaxes: {},
  secondaryAppSettings: {},
  
  currentLocation: '',
  seletedCategory: null,
  currentMerchant: '',
  masterMerchant: '',

  favorite: {},
  orders: {},
  cartData: {},
  isLoading: false,

  order: { line_items: [], rewards: [], taxes: [], total_discount_money: { amount: 0 }, total_money: { amount: 0 }, recommendations: { items: [] } },
  locationId: '',
  ordaId: 0,
  ordaOperations: [],
  cartItems: [],
  cartSubtotal: 0,
  unstagedSubtotal: 0,
  cartTax: 0,
  cartTotal: 0,
  totalAmount: 0,
  currency: { id: 'USD', symbol: '$' },
  account: { name: 0, mobile: 0, loyalty: 0 },
  orderTime: 'ASAP',
  orderAheadTimes: {},
  isStoreOpen: true,
  diningType: 'Takeout',
  orderPoints: 0,
  squareOrderId: null,
  payment: 0,
  customer: 0,
  customerCards: [],
  paymentErrors: {},
  loyalty: 0,
  delivery: 0,
  discounts: 0,
  appliedReward: 0,
  upvotes: 0,
  styles: 0,
  table: 0,
  bean: 0,
  rewardErrors: 0,
  redemptionErrors: 0,
  redemption: 0,
  couponCode: 0,
  counts: 0, 
  storePause: false,
};

export default (state = InitialState, action) => {
  let cartData = state.cartData || {};
  let favorite = state.favorite || {};
  let orders = state.orders || {};
  let newState = state;
  const update: any = {}
  switch (action.type) {

    case actions.CURRENT_MERCHANT.SET:
      newState = Object.assign({}, newState, {
        currentMerchant: action.merchantId,
      });
      break;
    case actions.CURRENT_MERCHANT.CLEAR:
      newState = Object.assign({}, newState, {
        currentMerchant: null,
      });
      break;

    case actions.MASTER_MERCHANT.SET:
      newState = Object.assign({}, newState, {
        masterMerchant: action.merchantId,
      });
      break;
    case actions.MASTER_MERCHANT.CLEAR:
      newState = Object.assign({}, newState, {
        masterMerchant: null,
      });
      break;

    case actions.SELECTED_CATEGORY.SET:
      newState = Object.assign({}, newState, {
        seletedCategory: action.data,
      });
      break;
    case actions.SELECTED_CATEGORY.CLEAR:
      newState = Object.assign({}, newState, {
        seletedCategory: null,
      });
      break;
    case actions.GET_CATEGORY.SET:
      update.isLoading = false
      update.secondaryCategories = { ...state.secondaryCategories }
      set(update, action.secondaryId ? `secondaryCategories.${action.secondaryId}` : 'categories', action.categories)
      newState = Object.assign({}, newState, update)
      break;
    case actions.GET_CATEGORY.CLEAR:
      newState = Object.assign({}, newState, {
        categories: null,
      });
      break;
    case actions.IS_LOADING.SET:
      newState = Object.assign({}, newState, {
        isLoading: true,
      });
      break;
    case actions.GET_FOODS.SET:
      update.isLoading = false
      update.secondaryFoods = { ...state.secondaryFoods }
      set(update, action.secondaryId ? `secondaryFoods.${action.secondaryId}` : 'foods', action.foods)
      newState = Object.assign({}, newState, update)
      break;
    case actions.GET_FOODS.CLEAR:
      newState = Object.assign({}, newState, {
        foods: null,
      });
      break;
    case actions.GET_TAXES.SET:
      update.isLoading = false
      update.secondaryTaxes = { ...state.secondaryTaxes }
      set(update, action.secondaryId ? `secondaryTaxes.${action.secondaryId}` : 'taxes', action.taxes)
      newState = Object.assign({}, newState, update)
      break;
    case actions.GET_TAXES.CLEAR:
      newState = Object.assign({}, newState, {
        taxes: null,
      });
      break;
    case actions.GET_VARIATIONS.SET:
      update.isLoading = false
      update.secondaryVariations = { ...state.secondaryVariations }
      set(update, action.secondaryId ? `secondaryVariations.${action.secondaryId}` : 'variations', action.variations)
      newState = Object.assign({}, newState, update)
      break;
    case actions.GET_VARIATIONS.CLEAR:
      newState = Object.assign({}, newState, {
        variations: null,
      });
      break;
    case actions.GET_MODIFIERS.SET:
      update.isLoading = false
      update.secondaryModifiers = { ...state.secondaryModifiers }
      set(update, action.secondaryId ? `secondaryModifiers.${action.secondaryId}` : 'modifiers', action.modifiers)
      newState = Object.assign({}, newState, update)
      break;
    case actions.GET_MODIFIERS.CLEAR:
      newState = Object.assign({}, newState, {
        modifiers: null,
      });
      break;
    case actions.GET_LOCATIONS.SET:
      update.isLoading = false
      update.locations = action.secondaryId ? [...(state.locations || []), ...action.locations] : action.locations
      newState = Object.assign({}, newState, update);
      break;
    case actions.GET_LOCATIONS.CLEAR:
      newState = Object.assign({}, newState, {
        locations: null,
      });
      break;
    case actions.GET_APPSETTINGS.SET:
      update.isLoading = false
      update.secondaryAppSettings = { ...state.secondaryAppSettings }
      set(update, action.secondaryId ? `secondaryAppSettings.${action.secondaryId}` : 'appSettings', action.appSettings)
      newState = Object.assign({}, newState, update)
      break;
    case actions.GET_APPSETTINGS.CLEAR:
      newState = Object.assign({}, newState, {
        appSettings: null,
      });
      break;
    case actions.ADD_CART.SET:
      cartData[action.data.id] = {
        ...action.data,
      };
      newState = Object.assign({}, newState, {
        seletedCategory: action.data,
        cartData
      });
      break;
    case actions.ADD_CART.CLEAR:
      newState = Object.assign({}, newState, {
        seletedCategory: null,
        cartData: InitialState.cartData,
      });
      break;
    case actions.ADD_FAVORITE.SET:
      favorite[action.data.id] = {
        ...action.data,
      };
      newState = Object.assign({}, newState, { favorite });
      break;
    case actions.ADD_FAVORITE.CLEAR:
      newState = Object.assign({}, newState, { favorite: null });
      break;
    case actions.ADD_TO_ORDER.SET:
      Object.keys(action.data).map(key => {
        orders[key] = {
          ...action.data[key],
          orderDate: new Date().getTime()
        };
      });
      newState = Object.assign({}, newState, { orders });
      break;
    case actions.ADD_TO_ORDER.CLEAR:
      newState = Object.assign({}, newState, { orders: null });
      break;
    case actions.DELETE_ORDER.SET:
      delete orders[action.key];
      newState = Object.assign({}, newState, { orders });
      break;
    case actions.DELETE_FAVORITE.SET:
      delete favorite[action.key];
      newState = Object.assign({}, newState, { favorite });
      break;
    case actions.MYADRESS.SET:
      newState = Object.assign({}, newState, { myAddress: action.address });
      break;
    case actions.EDIT_CART.SET:
      cartData[action.key] = {
        ...action.data,
      };
      newState = Object.assign({}, newState, {
        seletedCategory: action.data,
        cartData
      });
      break;
    case actions.EDIT_CART.CLEAR:
      newState = Object.assign({}, newState, {
        seletedCategory: null,
        cartData: InitialState.cartData,
      });
      break;
    case actions.DELETE_CART.SET:
      cartData[action.data.id] = {
        ...action.data,
        amount: notEmpty(cartData[action.data.id]) ? cartData[action.data.id].amount - 1 : 1
      };
      delete cartData[action.data.id];
      newState = Object.assign({}, newState, {
        seletedCategory: action.data,
        cartData
      });
      break;
    case actions.DELETE_CART.CLEAR:
      newState = Object.assign({}, newState, {
        seletedCategory: null,
        cartData: InitialState.cartData,
      });
      break;
    case actions.CLEAR_CART.SET:
      delete cartData[action.data.id];
      newState = Object.assign({}, newState, {
        seletedCategory: action.data,
        cartData
      });
      break;

    case actions.CLEAR_CART.CLEAR:
      newState = Object.assign({}, newState, {
        seletedCategory: null,
        cartData: InitialState.cartData,
      });
      break;
    case actions.CLEAR_ALL_CART.SET:
      newState = Object.assign({}, newState, {
        seletedCategory: action.data,
        cartData: InitialState.cartData,
      });
      break;

    case actions.CLEAR_ALL_CART.CLEAR:
      newState = Object.assign({}, newState, {
        seletedCategory: null,
        cartData: InitialState.cartData,
      });
      break;


    case actions.ORDER.SET:
      newState = Object.assign({}, newState, {
        order: action.order
      })
      break

    case actions.LOCATIONID.SET:
      newState = Object.assign({}, newState, {
        locationId: action.locationId
      })
      break

    case actions.ORDAID.SET:
      newState = Object.assign({}, newState, {
        ordaId: action.ordaId,
        order: {},
        ordaOperations: [],
        cartItems: [],
        cartSubtotal: 0,
        unstagedSubtotal: 0,
        cartTax: 0,
        cartTotal: 0,
        totalAmount: 0,
        orderTime: 'ASAP',
        diningType: 'Takeout',
        orderPoints: 0,
        squareOrderId: null,
        delivery: 0,
        payment: 0,
        paymentErrors: {},
        discounts: 0,
        appliedReward: 0,
        table: 0,
        bean: 0,
        rewardErrors: 0,
        redemptionErrors: 0,
        redemption: 0,
        couponCode: 0,
        counts: 0,
      })
      break

    case actions.ORDERFULFILLMENTTYPE.SET:
      newState = Object.assign({}, newState, {
        fulfillmentType: action.fulfillmentType
      })
      break

    case actions.ORDERAT.SET:
      newState = Object.assign({}, newState, {
        orderAt: action.orderAt
      })
      break

    case actions.ORDAOPERATIONS.SET:
      state.ordaOperations.push(action.ordaOperation.createdAt)
      newState = Object.assign({}, newState, {
        ordaOperations: action.ordaOperations
      })
      break

    case actions.CARTITEMS.SET:
      newState = Object.assign({}, newState, {
        cartItems: action.cartItems
      })
      break

    case actions.CARTSUBTOTAL.SET:
      update.cartSubtotal = action.cartSubtotal
      if (state.ordaOperations.length === 0) {
        update.unstagedSubtotal = action.cartSubtotal
      }
      newState = Object.assign({}, newState, update)
      break

    case actions.UNSTAGEDSUBTOTAL.ADD:
      update.unstagedSubtotal = action.amount + state.unstagedSubtotal
      newState = Object.assign({}, newState, update)
      break

    case actions.UNSTAGEDSUBTOTAL.SET:
      newState = Object.assign({}, newState, {
        unstagedSubtotal: action.unstagedSubtotal
      })
      break

    case actions.CARTTAX.SET:
      newState = Object.assign({}, newState, {
        cartTax: action.cartTax
      })
      break

    case actions.CARTTOTAL.SET:
      newState = Object.assign({}, newState, {
        cartTotal: action.cartTotal
      })
      break

    case actions.TOTALAMOUNT.SET:
      newState = Object.assign({}, newState, {
        totalAmount: action.totalAmount
      })
      break

    case actions.CURRENCY.SET:
      const id = action.id
      const country = action.country
      const symbol = (id === 'USD') ? '$' : (id === 'GBP' ? '£' : (id === 'EUR' ? '€' : (id === 'JPY' ? '¥' : '$')))
      const countryCodeToRegionCodeMap = {
        1: ['US', 'AG', 'AI', 'AS', 'BB', 'BM', 'BS', 'CA', 'DM', 'DO', 'GD', 'GU', 'JM', 'KN', 'KY', 'LC', 'MP', 'MS', 'PR', 'SX', 'TC', 'TT', 'VC', 'VG', 'VI'],
        44: ['GB', 'GG', 'IM', 'JE'],
        61: ['AU', 'CC', 'CX'],
        81: ['JP']
      }
      const prefix = findKey(countryCodeToRegionCodeMap, function (o) { return includes(o, country) }) || 1
      newState = Object.assign({}, newState, {
        currency: {
          id, symbol, prefix
        }
      })
      break

    case actions.COUPONCODE.SET:
      newState = Object.assign({}, newState, {
        couponCode: action.couponCode
      })
      break

    case actions.ACCOUNT.SET:
      newState = Object.assign({}, newState, {
        account: action.account
      })
      break

    case actions.ORDERTIME.SET:
      newState = Object.assign({}, newState, {
        orderTime: action.orderTime
      })
      break

    case actions.ORDERAHEADTIMES.SET:
      const periods = action.periods;
      const now = new Date()
      update.isStoreOpen = isOpen(periods, now)
      const notSoonerThan = moment(now).add(15, 'minutes')
      let start = startOfHour(now)
      const originalDay = start.day()
      const result = []
      if (update.isStoreOpen) {
        result.push({
          value: 'ASAP',
          text: 'ASAP'
        })
      }
      let i = 0
      while (result.length < 240 && i < 672) {
        if (isAfter(start, notSoonerThan) && isOpen(periods, start.toDate())) {
          const dayName = (originalDay !== start.day()) ? (dayNames[start.day()] + ' ') : ''
          const text = `${dayName}${(start.hours() % 12) || 12}:${padStart(start.minutes(), 2, 0)}${start.hours() >= 12 ? ' P' : 'A'}M`
          const value = parseInt(start.format('x'))
          result.push({
            value,
            text
          })
        }
        start.add(15, 'minutes')
        i++
      }
      update.orderAheadTimes = result
      update.orderTime = result[0].value
      newState = Object.assign({}, newState, update)
      break

    case actions.ISSTOREOPEN.SET:
      newState = Object.assign({}, newState, {
        isStoreOpen: action.isStoreOpen
      })
      break

    case actions.DININGTYPE.SET:
      newState = Object.assign({}, newState, {
        diningType: action.diningType
      })
      break

    case actions.ORDERPOINTS.SET:
      newState = Object.assign({}, newState, {
        orderPoints: action.orderPoints
      })
      break

    case actions.SQUAREORDERID.SET:
      newState = Object.assign({}, newState, {
        squareOrderId: action.squareOrderId
      })
      break

    case actions.CUSTOMERCARDS.SET:
      newState = { ...state, customerCards: action.customerCards }
      break

    case actions.PAYMENT.SET:
      newState = Object.assign({}, newState, {
        payment: action.payment
      })
      break

    case actions.PAYMENTERRORS.SET:
      newState = Object.assign({}, newState, {
        paymentErrors: action.paymentErrors
      })
      break

    case actions.LOYALTY.SET:
      update.loyalty = action.loyalty
      newState = Object.assign({}, newState, update)
      break

    case actions.DISCOUNTS.SET:
      newState = Object.assign({}, newState, {
        discounts: action.discounts
      })
      break

    case actions.APPLIEDREWARD.SET:
      newState = Object.assign({}, newState, {
        appliedReward: action.appliedReward
      })
      break

    case actions.UPVOTES.SET:
      newState = Object.assign({}, newState, {
        upvotes: action.upvotes
      })
      break

    case actions.STYLES.SET:
      newState = Object.assign({}, newState, {
        styles: action.styles
      })
      break

    case actions.TABLE.SET:
      newState = Object.assign({}, newState, {
        table: action.table,
        diningType: 'Table seat',
      })
      break

    case actions.BEAN.SET:
      newState = Object.assign({}, newState, {
        bean: action.bean
      })
      break

    case actions.REWARDERRORS.SET:
      newState = Object.assign({}, newState, {
        rewardErrors: action.rewardErrors
      })
      break

    case actions.ORDAOPERATIONS.DONE:
      console.log('*** Start ORDAOPERATIONS.DONE')
      const doc = action.doc
      const data = doc.data()
      const account = get(data, 'account') || 0
      if (account) {
        if (get(state, 'account.name')) { // preserve the name
          account.name = '' + get(state, 'account.name')
        }
        update.account = account
      }
      const done = get(data, 'done') || []
      const ordaOperations = clone(get(state, 'ordaOperations', []))
      for (let i = ordaOperations.length - 1; i >= 0; i--) {
        if (includes(done, ordaOperations[i])) {
          ordaOperations.splice(i, 1)
        }
      }
      update.ordaOperations = ordaOperations
      const cartItems = get(data, 'order.line_items') || []
      update.cartItems = cartItems
      const cartTotal = get(data, 'order.total_money.amount') || 0
      update.cartTotal = cartTotal
      update.totalAmount = cartTotal
      const cartTax = get(data, 'order.total_tax_money.amount') || 0
      update.cartTax = cartTax
      const deliveryFee = get(find(cartItems, { uid: 'delivery' }), 'total_money.amount', 0)
      const serviceFee = get(find(cartItems, { uid: 'service' }), 'total_money.amount', 0)
      update.cartSubtotal = (cartTotal - cartTax - deliveryFee - serviceFee)
      update.unstagedSubtotal = update.cartSubtotal
      const squareOrderId = get(data, 'order.id')
      update.squareOrderId = squareOrderId
      const discounts = get(data, 'order.net_amounts.discount_money.amount')
      update.discounts = discounts
      const payment = get(data, 'payment') || 0
      payment && (update.payment = payment)
      const paymentErrors = get(data, 'payment_errors', 0)
      update.paymentErrors = paymentErrors
      const delivery = get(data, 'delivery') || 0
      delivery && (update.delivery = delivery)
      const points = get(data, 'points') || 0
      points && (update.orderPoints = points)
      const upvotes = get(data, 'upvotes') || 0
      upvotes && (update.upvotes = upvotes)
      const rewardErrors = get(data, 'rewardErrors')
      update.rewardErrors = rewardErrors
      const reward = get(data, 'reward') || 0
      if (reward) {
        update.appliedReward = reward
        update.rewardErrors = 0
      }
      update.redemptionErrors = get(data, 'redemption_error')
      const redemption = get(data, 'redemption.redemption', 0)
      if (redemption) {
        update.redemption = redemption
        update.redemptionErrors = 0
      }
      const loyaltyError = get(data, 'loyalty_error')
      loyaltyError && (update.loyalty_error = loyaltyError)
      const customer = get(data, 'customer.id') || get(data, 'account.loyalty.customer_id')
      customer && (update.customer = customer)
      const customerCard = get(data, 'card')
      customerCard && (update.customerCards = (state.customerCards ? [...state.customerCards, customerCard] : [customerCard]))
      const recommendations = get(data, 'recommendations') || 0
      recommendations && (update.recommendations = recommendations)
      update.order = get(data, 'order', {})
      update.counts = get(data, 'counts', 0)
      update.storePause = get(data, 'pause', false)
      newState = { ...state, ...update }
      console.log('*** End ORDAOPERATIONS.DONE')
      break

    case actions.RESET.SET:
      update.order = null
      update.ordaOperations = null
      update.cartItems = null
      update.cartTotal = 0
      update.totalAmount = 0
      update.cartTax = 0
      update.cartSubtotal = 0
      update.unstagedSubtotal = 0
      update.squareOrderId = 0
      update.discounts = 0
      update.delivery = 0
      update.payment = 0
      update.paymentErrors = 0
      update.orderPoints = 0
      update.appliedReward = 0
      update.rewardErrors = 0
      update.order = null
      update.locationId = null
      update.ordaId = null
      newState = Object.assign({}, state, update)
      break

    case actions.CARTITEM.SET:
      try {
        action.firestore.collection('orders').doc(state.ordaId).collection('cart').doc(action.createdAt).set({
          timestamp: action.createdAt,
          locationId: action.locationId,
          items: [ action.itemId ]
        })
      } catch (e) {
        // TODO: add fallback notification
      }
      break

    case actions.ORDAOPERATIONS.ADD:
      const ordaOperation: any = {
        createdAt: action.createdAt,
        merchantId: state.currentMerchant || state.masterMerchant,
        locationId: action.locationId,
        type: action.item.type || 0,
        item: action.item,
      }
      if (state.squareOrderId) {
        ordaOperation.squareOrderId = state.squareOrderId
      }
      const programId = get(state, 'loyalty.id')
      if (programId) {
        ordaOperation.programId = programId
      }
      const accountId = get(state, 'account.loyalty.id')
      if (accountId) {
        ordaOperation.accountId = accountId
      }
      const customerId = get(state, 'account.loyalty.customer_id')
      if (customerId) {
        ordaOperation.customerId = customerId
      }
      try {
        // console.log(ordaOperation)
        action.firestore.collection('orders').doc(state.ordaId).collection('operations').add(ordaOperation)
      } catch (e) {
        // TODO: add fallback notification
      }
      const oos = clone((get(state, 'ordaOperations', [])))
      oos.push(ordaOperation.createdAt)
      newState = Object.assign({}, state, {
        ordaOperations: oos
      })
      break
  }
  return newState;
};

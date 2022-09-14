import { compose } from 'recompose';
import {connect} from 'react-redux';
import CartScreen from './AddCardView';
import foodCore from "../../core/food";
import mainCore from "../../core/main";

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
          setOrderFulfillmentType: (type) => dispatch(foodCore.actions.setOrderFulfillmentType(type)),
          setOrderAt: (data) => dispatch(foodCore.actions.setOrderAt(data)),
          setCustomerCards: (data) => dispatch(foodCore.actions.setCustomerCards(data)),
          setCouponCode: (data) => dispatch(foodCore.actions.setCouponCode(data)),
          addCart: (data) => dispatch(foodCore.actions.addCart(data)),
          addOrdaOperation: (firestore, locationId, item) => dispatch(foodCore.actions.addOrdaOperation(firestore, locationId, item)),
          setOrderAheadTimes: (periods) => dispatch(foodCore.actions.setOrderAheadTimes(periods)),          
        }),
    ),
)(
  CartScreen,
);

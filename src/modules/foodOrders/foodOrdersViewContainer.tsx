import { compose, lifecycle } from 'recompose';
import {connect} from 'react-redux';
import FoodOrdersScreen from './foodOrdersView';
import foodCore from "../../core/food";

export default compose(
    connect(
        state => ({
          accountMobile: foodCore.selectors.getAccountMobile(state),
          appSettings: foodCore.selectors.getAppSettings(state),
          locations: foodCore.selectors.getLocations(state),
        }),
        dispatch => ({
          addOrdaOperation: (firestore, locationId, item) => dispatch(foodCore.actions.addOrdaOperation(firestore, locationId, item)),
          setOrderAheadTimes: (periods) => dispatch(foodCore.actions.setOrderAheadTimes(periods)),
          setOrdaId: (ordaId) => dispatch(foodCore.actions.setOrdaId(ordaId)),
          setCurrency: (id, country) => dispatch(foodCore.actions.setCurrency({ id, country })),
          setLoyalty: (loyalty) => dispatch(foodCore.actions.setLoyalty(loyalty)),
          cartListener: (doc) => dispatch(foodCore.actions.cartListener(doc)),
          setLocationId: (locationId) =>  dispatch(foodCore.actions.setLocationId(locationId)),
          setCurrentMerchant: (id) =>  dispatch(foodCore.actions.setCurrentMerchant(id)),
          resetOrder: () =>  dispatch(foodCore.actions.resetOrder()),
        }),
    ),
    lifecycle({
    }),
)(
  FoodOrdersScreen,
);

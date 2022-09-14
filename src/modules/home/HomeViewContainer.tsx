import { compose, lifecycle } from 'recompose';
import {connect} from 'react-redux';
import HomeScreen from './HomeView';
import foodCore from "../../core/food";

export default compose(
    connect(
        state => ({
          ordaId: foodCore.selectors.getOrdaId(state),
          locationId: foodCore.selectors.getLocationId(state),
        }),
        dispatch => ({
          selectCategory: (data) => dispatch(foodCore.actions.setCategory(data)),
          setLocationId: (locationId) => dispatch(foodCore.actions.setLocationId(locationId)),
          setCurrency: (id, country) => dispatch(foodCore.actions.setCurrency({ id, country })),
          setLoyalty: (loyalty) => dispatch(foodCore.actions.setLoyalty(loyalty)),
          setOrdaId: (id) => dispatch(foodCore.actions.setOrdaId(id)),
          addOrdaOperation: (firestore, locationId, item) => dispatch(foodCore.actions.addOrdaOperation(firestore, locationId, item)),
          cartListener: (doc) => dispatch(foodCore.actions.cartListener(doc)),
          setOrderAheadTimes: (periods) => dispatch(foodCore.actions.setOrderAheadTimes(periods)),
          resetOrder: () => dispatch(foodCore.actions.resetOrder()),
          setOrderFulfillmentType: (type) => dispatch(foodCore.actions.setOrderFulfillmentType(type)),
          setOrderAt: (data) => dispatch(foodCore.actions.setOrderAt(data)),
          setCurrentMerchant: (data) => dispatch(foodCore.actions.setCurrentMerchant(data)),
        }),
    ),
    lifecycle({
    }),
)(
  HomeScreen,
);

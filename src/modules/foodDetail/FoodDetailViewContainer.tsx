import { compose, lifecycle } from 'recompose';
import {connect} from 'react-redux';
import FoodMenuScreen from './FoodDetailView';
import foodCore from "../../core/food";

export default compose(
    connect(
        state => ({
          locationId: foodCore.selectors.getLocationId(state),
          ordaId: foodCore.selectors.getOrdaId(state),
          variations: foodCore.selectors.getVariations(state),
          appSettings: foodCore.selectors.getAppSettings(state),
          items: foodCore.selectors.getFoods(state),
          taxes: foodCore.selectors.getTaxes(state),
          inventory: foodCore.selectors.getInventory(state),
          downloadLink: foodCore.selectors.getDownloadLink(state),
          shareValue: foodCore.selectors.getShareValue(state),
        }),
        dispatch => ({
          addOrdaOperation: (firestore, locationId, item) => dispatch(foodCore.actions.addOrdaOperation(firestore, locationId, item)),
          addOrdaCartItem: (firestore, locationId, itemId) => dispatch(foodCore.actions.addOrdaCartItem(firestore, locationId, itemId)),
          addUnstagedSubtotal: (amount) => dispatch(foodCore.actions.addUnstagedSubtotal(amount)),
          setOrdaId: (ordaId) => dispatch(foodCore.actions.setOrdaId(ordaId)),
          cartListener: (doc) => dispatch(foodCore.actions.cartListener(doc)),
        }),
    ), 
    lifecycle({
    }),
)(
  FoodMenuScreen,
);

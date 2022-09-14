import { compose, lifecycle } from 'recompose';
import {connect} from 'react-redux';
import FoodMenuScreen from './FoodMenuView';
import foodCore from "../../core/food";

export default compose(
    connect(
        state => ({
          accountMobile: foodCore.selectors.getAccountMobile(state),
          appSettings: foodCore.selectors.getAppSettings(state),
          fulfillmentType: foodCore.selectors.getOrderFulfillmentType(state),
          orderLength: foodCore.selectors.orderLength(state),
          orderAt: foodCore.selectors.getOrderAt(state),
          locationId: foodCore.selectors.getLocationId(state),
          navBarLogo: foodCore.selectors.getNavBarLogo(state),
          storePause: foodCore.selectors.isStorePause(state),
        }),
        dispatch => ({
        }),
    ),
    lifecycle({
    }),
)(
  FoodMenuScreen,
);

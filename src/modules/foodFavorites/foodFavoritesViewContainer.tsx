import { compose, lifecycle } from 'recompose';
import {connect} from 'react-redux';
import FoodFavoritesScreen from './foodFavoritesView';
import foodCore from "../../core/food";

export default compose(
    connect(
        state => ({
          selectCategory: foodCore.selectors.getSelectedCategory(state),
        }),
        dispatch => ({
        }),
    ),
    lifecycle({
    }),
)(
  FoodFavoritesScreen,
);

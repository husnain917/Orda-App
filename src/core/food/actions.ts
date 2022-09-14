import { createAction, createSetTypes, createType } from '../../utils/actions';
import reduce from 'lodash/reduce';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import min from 'lodash/min';
import max from 'lodash/max';
import map from 'lodash/map';
import find from 'lodash/find';
import keyBy from 'lodash/keyBy';
import { getItemTag } from './helper';

export const SELECTED_CATEGORY = createSetTypes('FO_SELECTED_CATEGORY')
export const GET_CATEGORY = createSetTypes('FO_GET_CATEGORY')
export const GET_FOODS = createSetTypes('FO_GET_FOODS')
export const GET_TAXES = createSetTypes('FO_GET_TAXES')
export const GET_VARIATIONS = createSetTypes('FO_GET_VARIATIONS')
export const GET_MODIFIERS = createSetTypes('FO_GET_MODIFIERS')
export const GET_MODIFIERTYPES = createSetTypes('FO_GET_MODIFIERTYPES')
export const ADD_FAVORITE = createSetTypes('FO_ADD_FAVORITE')
export const DELETE_FAVORITE = createSetTypes('FO_DELETE_FAVORITE')
export const ADD_CART = createSetTypes('FO_ADD_CART')
export const EDIT_CART = createSetTypes('FO_EDIT_CART')
export const DELETE_CART = createSetTypes('FO_DELETE_CART')
export const CLEAR_CART = createSetTypes('FO_CLEAR_CART')
export const CLEAR_ALL_CART = createSetTypes('FO_CLEAR_ALL_CART')
export const ADD_TO_ORDER = createSetTypes('FO_ADD_TO_ORDER')
export const DELETE_ORDER = createSetTypes('FO_DELETE_ORDER')
export const IS_LOADING = createSetTypes('FO_IS_LOADING');
export const MASTER_MERCHANT = createSetTypes('MASTER_MERCHANT');
export const CURRENT_MERCHANT = createSetTypes('CURRENT_MERCHANT');
export const GET_LOCATIONS = createSetTypes('GET_LOCATIONS');
export const GET_APPSETTINGS = createSetTypes('GET_APPSETTINGS');

export const RESET = createType('RESET')
export const ORDER = createType('ORDER')
export const LOCATIONID = createType('LOCATIONID')
export const ORDAID = createType('ORDAID')
export const CARTITEMS = createType('CARTITEMS')
export const CARTSUBTOTAL = createType('CARTSUBTOTAL')
export const CARTTAX = createType('CARTTAX')
export const CARTTOTAL = createType('CARTTOTAL')
export const TOTALAMOUNT = createType('TOTALAMOUNT')
export const CURRENCY = createType('CURRENCY')
export const ACCOUNT = createType('ACCOUNT')
export const ORDERTIME = createType('ORDERTIME')
export const ORDERAHEADTIMES = createType('ORDERAHEADTIMES')
export const ISSTOREOPEN = createType('ISSTOREOPEN')
export const DININGTYPE = createType('DININGTYPE')
export const ORDERPOINTS = createType('ORDERPOINTS')
export const SQUAREORDERID = createType('SQUAREORDERID')
export const CUSTOMERCARDS = createType('CUSTOMERCARDS')
export const PAYMENT = createType('PAYMENT')
export const PAYMENTERRORS = createType('PAYMENTERRORS')
export const LOYALTY = createType('LOYALTY')
export const DISCOUNTS = createType('DISCOUNTS')
export const APPLIEDREWARD = createType('APPLIEDREWARD')
export const UPVOTES = createType('UPVOTES')
export const STYLES = createType('STYLES')
export const TABLE = createType('TABLE')
export const BEAN = createType('BEAN')
export const REWARDERRORS = createType('REWARDERRORS')
export const MYADRESS = createType('MYADRESS')
export const ORDERFULFILLMENTTYPE = createType('ORDERFULFILLMENTTYPE')
export const ORDERAT = createType('ORDERAT')
export const COUPONCODE = createType('COUPONCODE')
export const CARTITEM = createType('CARTITEM')

export const ORDAOPERATIONS = {
  ...createType('ORDAOPERATIONS'),
  ADD: 'ORDAOPERATIONS_ADD',
  DONE: 'ORDAOPERATIONS_DONE',
}
export const UNSTAGEDSUBTOTAL = {
  ...createType('UNSTAGEDSUBTOTAL'),
  ADD: 'UNSTAGEDSUBTOTAL_ADD',
}

export const setMasterMerchant = (merchantId) => async dispatch => {
  const action = {
    set: (merchantId) => createAction(MASTER_MERCHANT.SET, { merchantId }),
    clear: () => createAction(MASTER_MERCHANT.CLEAR, {}),
  };
  try {
    dispatch(action.set(merchantId));
  } catch (e) {
    dispatch(action.clear());
  }
}

export const setCurrentMerchant: any = (merchantId)=> async dispatch => {
  const action = {
    set: (merchantId) => createAction(CURRENT_MERCHANT.SET, { merchantId }),
    clear: () => createAction(CURRENT_MERCHANT.CLEAR, {}),
  };
  try {
    dispatch(action.set(merchantId));
  } catch (e) {
    dispatch(action.clear());
  }
}

export const setCategory: any = (data) => async dispatch => {
  const action = {
    set: () => createAction(SELECTED_CATEGORY.SET, { data }),
    clear: () => createAction(SELECTED_CATEGORY.CLEAR, {}),
  };
  try {
    dispatch(action.set());
  } catch (e) {
    dispatch(action.clear());
  }
}

export const getFoods = (location) => async dispatch => {
  const action = {
    loading: () => createAction(IS_LOADING.SET, true),
    set: (foods) => createAction(GET_FOODS.SET, { foods, secondaryId: location.merchant_id }),
    clear: () => createAction(GET_FOODS.CLEAR, {}),
  };
  try {
    dispatch(action.loading());
    const favorites = get(location, 'location.metadata.--stats--.globalItems') || {}
    const is = get(location, 'catalog.ITEM')
    const foods = sortBy(
      reduce(
        is,
        (all, item) => {
          const meta = get(location, `location.metadata.${item.id}`);
          const foodItemTags = getItemTag(location, item?.id);
          const variations = get(item, 'item_data.variations')
          const variationIds = map(variations, 'id')
          const variationPrices = map(variationIds, id => {
            return get(location, `catalog.ITEM_VARIATION.${id}.item_variation_data.price_money.amount`) || 
              get(location, `catalog.ITEM_VARIATION.${id}.item_variation_data.location_overrides[0].price_money.amount`)
          })
          const priceMin = min(variationPrices);
          const priceMax = max(variationPrices);
          if ((!meta || !meta.hidden) && priceMin && priceMax) {
            const image = item.image_id && get(location, `location.metadata.${item.image_id}.publicUrl`)
            const variationId = get(item, 'item_data.variations[0].id')
            const points = get(location, `location.metadata.${variationId}.points`)
            const taxIds = get(item, 'item_data.tax_ids')
            const rank = favorites[item.id] || 0
            const present_at_all_locations = get(item, 'present_at_all_locations')
            const present_at_location_ids = get(item, 'present_at_location_ids')
            const absent_at_location_ids = get(item, 'absent_at_location_ids')
            const priority = get(meta, 'priority')
            all.push({
              id: item.id,
              categoryId: get(item, 'item_data.category_id'),
              name: get(item, 'item_data.name'),
              available_online: get(item, 'item_data.available_online', true),
              description: get(item, 'item_data.description'),
              modifierListInfo: get(item, 'item_data.modifier_list_info'),
              image,
              priority: priority === 0 ? 0 : (priority || 99),
              points,
              taxIds,
              priceMin,
              priceMax,
              rank,
              present_at_all_locations,
              present_at_location_ids,
              absent_at_location_ids,
              tags: foodItemTags
            })
          }
          return all
        },
        []
      ),
      ['priority']
    );
    dispatch(action.set(foods));
  } catch (e) {
    dispatch(action.clear());
  }
}

export const getTaxes = (location) => async dispatch => {
  const action = {
    loading: () => createAction(IS_LOADING.SET, true),
    set: (taxes) => createAction(GET_TAXES.SET, { taxes, secondaryId: location.merchant_id }),
    clear: () => createAction(GET_TAXES.CLEAR, {}),
  };
  try {
    dispatch(action.loading());
    const is = get(location, 'catalog.TAX')
    const taxes = reduce(is, (ts, item) => {
      if (get(item, 'tax_data.enabled')) {
        ts.push({
          id: item.id,
          inclusion_type: get(item, 'tax_data.inclusion_type'),        
          present_at_all_locations: item.present_at_all_locations,
          present_at_location_ids: item.present_at_location_ids,
          absent_at_location_ids: item.absent_at_location_ids,
        })
      }
      return ts
    }, [])
    dispatch(action.set(taxes));
  } catch (e) {
    dispatch(action.clear());
  }
}

export const getCategory = (payload) => async dispatch => {
  const action = {
    set: (categories) => createAction(GET_CATEGORY.SET, { categories, secondaryId: payload.merchant_id }),
    clear: () => createAction(GET_CATEGORY.CLEAR, {}),
  };
  try {
    const cs = get(payload, 'catalog.CATEGORY')
    const meta = get(payload, `merchant.data.categoriesMetadata.selectedCategories`, [])
    const categories = sortBy(
      reduce(
        cs,
        (all, category) => {
          const priority = meta.indexOf(category.id) 
          if (priority > -1) {
            all.push({
              id: category.id,
              name: get(category, 'category_data.name'),
              image: get(category, 'category_data.image'),
              present_at_all_locations: category.present_at_all_locations,
              absent_at_location_ids: category.absent_at_location_ids,
              present_at_location_ids: category.present_at_location_ids,
              is_deleted: category.is_deleted,
              priority,
            })
          }
          return all
        },
        []
      ),
      ['priority']
    )
    dispatch(action.set(categories));
  } catch (e) {
    dispatch(action.clear());
  }
};

export const getVariations = (payload) => async dispatch => {
  const action = {
    set: (variations) => createAction(GET_VARIATIONS.SET, { variations, secondaryId: payload.merchant_id }),
    clear: () => createAction(GET_VARIATIONS.CLEAR, {}),
  };
  try {
    const is = get(payload, 'catalog.ITEM_VARIATION')
    const variations = sortBy(
      reduce(
        is,
        (all, itemVariation) => {
          const itemId = get(itemVariation, 'item_variation_data.item_id')
          const meta = get(this, `location.metadata.${itemVariation.id}`)
          all.push({
            id: itemVariation.id,
            itemId,
            present_at_all_locations: itemVariation.present_at_all_locations,
            absent_at_location_ids: itemVariation.absent_at_location_ids,
            present_at_location_ids: itemVariation.present_at_location_ids,
            is_deleted: itemVariation.is_deleted,
            location_overrides: keyBy(get(itemVariation, 'item_variation_data.location_overrides'), 'location_id'),
            track_inventory: get(itemVariation, 'track_inventory'),
            name: get(itemVariation, 'item_variation_data.name'),
            price: (get(itemVariation, 'item_variation_data.price_money.amount')) || 0,
            priority: get(meta, 'priority') || 99
          })
          return all
        },
        []
      ),
      ['priority']
    )
    dispatch(action.set(variations));
  } catch (e) {
    dispatch(action.clear());
  }
};

export const getModifiers = (payload) => async dispatch => {
  const action = {
    set: (modifiers) => createAction(GET_MODIFIERS.SET, { modifiers, secondaryId: payload.merchant_id }),
    clear: () => createAction(GET_MODIFIERS.CLEAR, {}),
  };
  try {
    const ms = get(payload, 'catalog.MODIFIER_LIST')
    dispatch(action.set(ms));
  } catch (e) {
    dispatch(action.clear());
  }
};

export const getLocations = ({ merchant, merchant_id }) => async dispatch => {
  const action = {
    set: (locations) => createAction(GET_LOCATIONS.SET, { locations, secondaryId: merchant_id }),
    clear: () => createAction(GET_LOCATIONS.CLEAR, {}),
  };
  try {
    const ls = get(merchant, 'data.locations', [])
    const lsMetadata = get(merchant, 'data.locationsMetadata', {})
    const locations = reduce(ls, (filtered, l) => {
      const md = lsMetadata[l.id]
      md && md.enabled && filtered.push({
        ...md,
        locationData: l,
      })
      return filtered
    }, [])
    dispatch(action.set(locations));
  } catch (e) {
    dispatch(action.clear());
  }
};

export const getAppSettings = ({ merchant, merchant_id }) => async dispatch => {
  const action = {
    set: (appSettings) => createAction(GET_APPSETTINGS.SET, { appSettings, secondaryId: merchant_id }),
    clear: () => createAction(GET_APPSETTINGS.CLEAR, {}),
  };
  try {
    const data = get(merchant, 'data', {})
    dispatch(action.set(data));
  } catch (e) {
    dispatch(action.clear());
  }
};

export const getModifierTypes = (selectedItem, allModifiers) => dispatch => {
  const action = {
    set: (modifiedTypes) => createAction(GET_MODIFIERTYPES.SET, { modifiedTypes }),
    clear: () => createAction(GET_MODIFIERTYPES.CLEAR, {}),
  };
  try {
    const list = get(selectedItem, 'modifierListInfo')
    const mls = allModifiers
    const modifiedTypes = sortBy(reduce(list, (allModifierTypes, modifierType) => {
      if (modifierType.enabled) {
        const modifierOverrides = modifierType.modifier_overrides
        const id = modifierType.modifier_list_id
        const max = modifierType.max_selected_modifiers
        const min = modifierType.min_selected_modifiers
        const modifierListData = mls[id]
        const modifierSpec = get(modifierListData, 'modifier_list_data.modifiers')
        const modifierOrdinal = get(modifierListData, 'modifier_list_data.ordinal')
        const present_at_all_locations = get(modifierListData, 'present_at_all_locations')
        const present_at_location_ids = get(modifierListData, 'present_at_location_ids')
        const absent_at_location_ids = get(modifierListData, 'absent_at_location_ids')
        const modifiers = sortBy(reduce(modifierSpec, (all, modifier) => {
          if (!modifier.is_deleted) {
            const modifierOverride = find(modifierOverrides, ['modifier_id', modifier.id])
            all.push({
              id: modifier.id,
              name: get(modifier, 'modifier_data.name'),
              ordinal: get(modifier, 'modifier_data.ordinal'),
              price: (get(modifier, 'modifier_data.price_money.amount')) || 0,
              on_by_default: get(modifierOverride, 'on_by_default')
            })
          }
          return all
        }, []), 'ordinal')
        const isMultiple = get(modifierListData, 'modifier_list_data.selection_type') === 'MULTIPLE'
        allModifierTypes.push({
          max: (max === -1) ? modifiers.length : max,
          min: (min === -1) ? (isMultiple ? 0 : 1) : min,
          id,
          name: get(modifierListData, 'modifier_list_data.name'),
          isMultiple,
          modifiers,
          priority: modifierOrdinal || 1,
          present_at_all_locations,
          present_at_location_ids,
          absent_at_location_ids
        })
      }
      return allModifierTypes
    }, []), 'priority')
    dispatch(action.set(modifiedTypes));
    return modifiedTypes;
  } catch (e) {
    dispatch(action.clear());
  }
}

export const getVariationsTypes = (selectedItem, allVariations) => dispatch => {
  const action = {
    set: (modifiedTypes) => createAction(GET_MODIFIERTYPES.SET, { modifiedTypes }),
    clear: () => createAction(GET_MODIFIERTYPES.CLEAR, {}),
  };
  try {
    const variations = sortBy(reduce(allVariations, (all, itemVariation) => {
      const itemId = get(itemVariation, 'itemId')
      if (itemId === selectedItem.id) {
        all.push({
          ...itemVariation,
          price: itemVariation.price || 0,
        })
      }
      return all
    }, []), 'price')
    dispatch(action.set(variations));
    return variations;
  } catch (e) {
    dispatch(action.clear());
  }
};

export const addFavorite = (data) => async dispatch => {
  const action = {
    set: () => createAction(ADD_FAVORITE.SET, { data }),
    clear: () => createAction(ADD_FAVORITE.CLEAR, {}),
  };
  try {
    dispatch(action.set());
  } catch (e) {
    dispatch(action.clear());
  }
}

export const deleteFavorite = (key) => async dispatch => {
  dispatch(createAction(DELETE_FAVORITE.SET, { key }));
}

export const addCart: any = (data) => async dispatch => {
  const action = {
    set: () => createAction(ADD_CART.SET, { data }),
    clear: () => createAction(ADD_CART.CLEAR, {}),
  };
  try {
    dispatch(action.set());
  } catch (e) {
    dispatch(action.clear());
  }
}

export const editCart: any = (key, data) => async dispatch => {
  const action = {
    set: () => createAction(EDIT_CART.SET, { key, data }),
    clear: () => createAction(EDIT_CART.CLEAR, {}),
  };
  try {
    dispatch(action.set());
  } catch (e) {
    dispatch(action.clear());
  }
}

export const addToOrder = (data) => async dispatch => {
  const action = {
    set: () => createAction(ADD_TO_ORDER.SET, { data }),
    clear: () => createAction(ADD_TO_ORDER.CLEAR, {}),
  };
  try {
    dispatch(action.set());
  } catch (e) {
    dispatch(action.clear());
  }
}

export const deleteOrder = (key) => async dispatch => {
  dispatch(createAction(DELETE_ORDER.SET, { key }));
}

export const clearAllCart = () => async dispatch => {
  const action = {
    set: () => createAction(CLEAR_ALL_CART.SET, {}),
    clear: () => createAction(CLEAR_ALL_CART.CLEAR, {}),
  };
  try {
    dispatch(action.set());
  } catch (e) {
    dispatch(action.clear());
  }
};

export const clearCart = (data) => async dispatch => {
  const action = {
    set: () => createAction(CLEAR_CART.SET, { data }),
    clear: () => createAction(CLEAR_CART.CLEAR, {}),
  };
  try {
    dispatch(action.set());
  } catch (e) {
    dispatch(action.clear());
  }
};

export const deleteCart = (data) => async dispatch => {
  const action = {
    set: () => createAction(DELETE_CART.SET, { data }),
    clear: () => createAction(DELETE_CART.CLEAR, {}),
  };
  try {
    dispatch(action.set());
  } catch (e) {
    dispatch(action.clear());
  }
}

export const setOrderFulfillmentType : any = (fulfillmentType) => async dispatch => {
  dispatch(createAction(ORDERFULFILLMENTTYPE.SET, { fulfillmentType }));
}

export const setOrderAt : any= (orderAt) => async dispatch => {
  dispatch(createAction(ORDERAT.SET, { orderAt }));
}

export const setOrder = (key) => async dispatch => {
  dispatch(createAction(ORDER.SET, { key }));
}

export const setLocationId: any = (locationId) => async dispatch => {
  dispatch(createAction(LOCATIONID.SET, { locationId }));
}

export const resetOrdaId = () => async dispatch => {
  dispatch(createAction(ORDAID.SET, { ordaId: '' }))
}

export const setOrdaId = (ordaId): any => async dispatch => {
  dispatch(createAction(ORDAID.SET, { ordaId }));
  return ordaId
}

export const setOrdaOperations = (key) => async dispatch => {
  dispatch(createAction(ORDAOPERATIONS.SET, { key }));
}

export const setCartItems = (key) => async dispatch => {
  dispatch(createAction(CARTITEMS.SET, { key }));
}

export const setCartSubtotal = (key) => async dispatch => {
  dispatch(createAction(CARTSUBTOTAL.SET, { key }));
}

export const setUnstagedSubtotal = (key) => async dispatch => {
  dispatch(createAction(UNSTAGEDSUBTOTAL.SET, { key }));
}

export const addUnstagedSubtotal: any = (amount) => async dispatch => {
  dispatch(createAction(UNSTAGEDSUBTOTAL.ADD, { amount }));
}

export const setCartTax = (key) => async dispatch => {
  dispatch(createAction(CARTTAX.SET, { key }));
}

export const setCartTotal = (key) => async dispatch => {
  dispatch(createAction(CARTTOTAL.SET, { key }));
}

export const setTotalAmount = (key) => async dispatch => {
  dispatch(createAction(TOTALAMOUNT.SET, { key }));
}

export const setCurrency = (action): any => async dispatch => {
  dispatch(createAction(CURRENCY.SET, action));
}

export const setCouponCode = (couponCode): any => async dispatch => {
  dispatch(createAction(COUPONCODE.SET, { couponCode }));
}

export const setAccount = (account) => async dispatch => {
  dispatch(createAction(ACCOUNT.SET, { account }));
}

export const setOrderTime = (key) => async dispatch => {
  dispatch(createAction(ORDERTIME.SET, { key }));
}

export const setOrderAheadTimes: any = (periods) => async dispatch => {
  dispatch(createAction(ORDERAHEADTIMES.SET, { periods }));
}

export const setIsStoreOpen = (key) => async dispatch => {
  dispatch(createAction(ISSTOREOPEN.SET, { key }));
}

export const setDiningType = (key) => async dispatch => {
  dispatch(createAction(DININGTYPE.SET, { key }));
}

export const setOrderPoints = (key) => async dispatch => {
  dispatch(createAction(ORDERPOINTS.SET, { key }));
}

export const setSquareOrderId = (key) => async dispatch => {
  dispatch(createAction(SQUAREORDERID.SET, { key }));
}

export const setCustomerCards: any = (customerCards) => async dispatch => {
  dispatch(createAction(CUSTOMERCARDS.SET, { customerCards }));
}

export const setPayment = (key) => async dispatch => {
  dispatch(createAction(PAYMENT.SET, { key }));
}

export const setPaymentErrors = (key) => async dispatch => {
  dispatch(createAction(PAYMENTERRORS.SET, { key }));
}

export const setLoyalty = (loyalty): any => async dispatch => {
  dispatch(createAction(LOYALTY.SET, { loyalty }));
}

export const setDiscounts = (key) => async dispatch => {
  dispatch(createAction(DISCOUNTS.SET, { key }));
}

export const setAppliedReward = (key) => async dispatch => {
  dispatch(createAction(APPLIEDREWARD.SET, { key }));
}

export const setUpvotes = (key) => async dispatch => {
  dispatch(createAction(UPVOTES.SET, { key }));
}

export const setStyles = (key) => async dispatch => {
  dispatch(createAction(STYLES.SET, { key }));
}

export const setTable = (key) => async dispatch => {
  dispatch(createAction(TABLE.SET, { key }));
}

export const setBean = (key) => async dispatch => {
  dispatch(createAction(BEAN.SET, { key }));
}

export const setRewardErrors = (key) => async dispatch => {
  dispatch(createAction(REWARDERRORS.SET, { key }));
}

export const addOrdaOperation: any = (firestore, locationId, item) => async dispatch => {
  const createdAt = new Date().toISOString()
  dispatch(createAction(ORDAOPERATIONS.ADD, { firestore, locationId, item, createdAt }));
  return createdAt
}

export const addOrdaCartItem: any = (firestore, locationId, itemId) => async dispatch => {
  const createdAt = new Date().toISOString()
  dispatch(createAction(CARTITEM.SET, { firestore, locationId, itemId, createdAt }));
  return createdAt
}

export const cartListener = (doc): any => async dispatch => {
  console.log("*** orda_operation_done called")
  dispatch(createAction(ORDAOPERATIONS.DONE, { doc }));
  console.log("*** orda_operation_done ended")
}

export const setMyAddress = (address): any => async dispatch => {
  dispatch(createAction(MYADRESS.SET, { address }))
}

export const resetOrder = (): any => async dispatch => {
  dispatch(createAction(RESET.SET, null))
}

import { RootState } from "../";
import * as constants from './interfaces';
import get from 'lodash/get'
import trim from 'lodash/trim'
import capitalize from 'lodash/capitalize'

const EMPTY_ARRAY = []


export const masterMerchant = (state): string => {
  return get(state, `${constants.NAME}.masterMerchant`)
};

export const currentMerchant = (state): string => {
  return get(state, `${constants.NAME}.currentMerchant`) || masterMerchant(state)
};

export const isMasterSelected = (state): boolean => {
  return currentMerchant(state) === masterMerchant(state)
};

export const loading = (state): Object => {
  return get(state, `${constants.NAME}.isLoading`, false)
};

export const getSelectedCategory = (state): Object => {
  return get(state, `${constants.NAME}.seletedCategory`, null)
};

export const getCategories = (state): Object => {
  return isMasterSelected(state) ?
    get(state, `${constants.NAME}.categories`, EMPTY_ARRAY): 
    get(state, `${constants.NAME}.secondaryCategories.${currentMerchant(state)}`, EMPTY_ARRAY)
};

export const getFoods = (state): Object => {
  return isMasterSelected(state) ?
    get(state, `${constants.NAME}.foods`, EMPTY_ARRAY) :
    get(state, `${constants.NAME}.secondaryFoods.${currentMerchant(state)}`, EMPTY_ARRAY)
};

export const getTaxes = (state): Object => {
  return isMasterSelected(state) ?
    get(state, `${constants.NAME}.taxes`, EMPTY_ARRAY) :
    get(state, `${constants.NAME}.secondaryTaxes.${currentMerchant(state)}`, EMPTY_ARRAY)
}

export const getVariations = (state): Object => {
  return isMasterSelected(state) ?
    get(state, `${constants.NAME}.variations`, EMPTY_ARRAY) :
    get(state, `${constants.NAME}.secondaryVariations.${currentMerchant(state)}`, EMPTY_ARRAY)
}

export const getModifiers = (state): Object => {
  return isMasterSelected(state) ?
    get(state, `${constants.NAME}.modifiers`, EMPTY_ARRAY) :
    get(state, `${constants.NAME}.secondaryModifiers.${currentMerchant(state)}`, EMPTY_ARRAY)
};

export const getLocations = (state): Array<Object> => {
  return get(state, `${constants.NAME}.locations`, EMPTY_ARRAY)
};

export const getAppSettings = (state): Array<Object> => {
  return isMasterSelected(state) ?
    get(state, `${constants.NAME}.appSettings`, EMPTY_ARRAY) :
    get(state, `${constants.NAME}.secondaryAppSettings.${currentMerchant(state)}`, EMPTY_ARRAY)
}

export const getPrepTime = (state): any => {
  const appSettings = getAppSettings(state)
  const minutes = get(appSettings, 'catalogSettings.prepTime.minutes')
  const hours = get(appSettings, 'catalogSettings.prepTime.hours')
  const days = get(appSettings, 'catalogSettings.prepTime.days')

  const segments = []
  days && segments.push(days + (days > 1 ? ' days': ' day'))
  hours && segments.push(hours + (hours > 1 ? ' hours': ' hour'))
  minutes && segments.push(minutes + (minutes > 1 ? ' minutes' : ' minute'))

  const result = segments.join(' and ')
  return result
};

export const getDownloadLink = (state): string => {
  const appSettings = getAppSettings(state)
  const download = get(appSettings, 'download.google_play')
  return download ? ('https://download.getorda.com/' + download) : null
}

export const getShareValue = (state): string => {
  const appSettings = getAppSettings(state)
  return get(appSettings, 'apps.apps-share')
}

export const getNavBarLogo = (state): string => {
  const appSettings = getAppSettings(state)
  return get(appSettings, 'theme.navBarLogo')
}

export const couponEnabled = (state): boolean => {
  const appSettings = getAppSettings(state)
  return !!get(appSettings, 'apps.apps-coupons.connected')
}

export const getOrderFulfillmentType = (state): Object => {
  return get(state, `${constants.NAME}.fulfillmentType`)
};

export const orderLength = (state): number => {
  return get(state, `${constants.NAME}.order.line_items.length`)
};

export const orderRecommendationIds = (state): number => {
  return get(state, `${constants.NAME}.recommendations.items`)
};

export const getOrderAt = (state): Object => {
  return get(state, `${constants.NAME}.orderAt`)
};

export const getCarts = (state): Object => {
  return get(state, `${constants.NAME}.cartData`)
};

export const getFavorites = (state): Object => {
  return get(state, `${constants.NAME}.favorite`)
};

export const getOrders = (state): Object => {
  return get(state, `${constants.NAME}.orders`)
};

export const getOrder = (state): Object => {
  return get(state, `${constants.NAME}.order`)
};

export const getLocationId = (state): Object => {
  return get(state, `${constants.NAME}.locationId`)
};

export const getOrdaId = (state): Object => {
  return get(state, `${constants.NAME}.ordaId`, null)
};

export const getOrdaOperations = (state): any[] => {
  return get(state, `${constants.NAME}.ordaOperations`, [])
};

export const getCartItems = (state): Object => {
  return get(state, `${constants.NAME}.cartItems`)
};

export const getCartSubtotal = (state): Object => {
  return get(state, `${constants.NAME}.cartSubtotal`, null)
};

export const getUnstagedSubtotal = (state): Object => {
  return get(state, `${constants.NAME}.unstagedSubtotal`)
};

export const getCartTax = (state): Object => {
  return get(state, `${constants.NAME}.cartTax`)
};

export const getCartTotal = (state): Object => {
  return get(state, `${constants.NAME}.cartTotal`)
};

export const getTotalAmount = (state): Object => {
  return get(state, `${constants.NAME}.totalAmount`)
};

export const getCurrency = (state): Object => {
  return get(state, `${constants.NAME}.currency`)
};

export const getAccount = (state): any => {
  return get(state, `${constants.NAME}.account`)
};

export const getAccountName = (state): String => {
  const name = get(state, `${constants.NAME}.account.name`, null)
  if (!name) {
    return 'Buyer'
  }
  const si = trim(name).indexOf(' ')
  return capitalize(si === -1 ? name : name.substr(0, si))
};

export const getAccountLoyalty = (state): any => {
  return get(state, `${constants.NAME}.account.loyalty`, 0)
};

export const getAccountLoyaltyBalance = (state): any => {
  return get(state, `${constants.NAME}.account.loyalty.balance`, 0)
};

export const getAccountMobile = (state): String => {
  return get(state, `${constants.NAME}.account.mobile`, '')
};

export const getAccountError = (state): String => {
  return get(state, `${constants.NAME}.account.error`, '')
};

export const getLoyaltyError = (state): String => {
  return get(state, `${constants.NAME}.loyalty_error`, '')
};

export const getOrderTime = (state): Object => {
  return get(state, `${constants.NAME}.orderTime`)
};

export const getOrderAheadTimes = (state): any[] => {
  return get(state, `${constants.NAME}.orderAheadTimes`)
};

export const getIsStoreOpen = (state): Object => {
  return get(state, `${constants.NAME}.isStoreOpen`)
};

export const getDiningType = (state): Object => {
  return get(state, `${constants.NAME}.diningType`)
};

export const getOrderPoints = (state): number => {
  return get(state, `${constants.NAME}.orderPoints`)
};

export const getSquareOrderId = (state): Object => {
  return get(state, `${constants.NAME}.squareOrderId`)
};

export const getDelivery = (state): Object => {
  return get(state, `${constants.NAME}.delivery`)
};

export const getPayment = (state): Object => {
  return get(state, `${constants.NAME}.payment`)
};

export const getPaymentErrors = (state): Object => {
  return get(state, `${constants.NAME}.paymentErrors`)
};

export const getCustomer = (state): string => {
  return get(state, `${constants.NAME}.customer`)
};

export const getCustomerCards = (state): string => {
  return get(state, `${constants.NAME}.customerCards`, EMPTY_ARRAY)
};

export const getInventory = (state): any[] => {
  return get(state, `${constants.NAME}.counts`, EMPTY_ARRAY)
};

export const isStorePause  = (state): Boolean => {
  return get(state, `${constants.NAME}.storePause`, false)
};

export const getLoyalty = (state): Object => {
  return get(state, `${constants.NAME}.loyalty`)
};

export const getLoyaltyTerm = (state, isToLower = false): String => {
  const terms = get(state, `${constants.NAME}.loyalty.terminology.other`, 'Points')
  return isToLower ? terms.toLowerCase() : terms;
};

export const getDiscounts = (state): Object => {
  return get(state, `${constants.NAME}.discounts`)
};

export const getAppliedReward = (state): any => {
  return get(state, `${constants.NAME}.appliedReward`)
};

export const getUpvotes = (state): Object => {
  return get(state, `${constants.NAME}.upvotes`)
};

export const getStyles = (state): Object => {
  return get(state, `${constants.NAME}.styles`)
};

export const getTable = (state): Object => {
  return get(state, `${constants.NAME}.table`)
};

export const getBean = (state): Object => {
  return get(state, `${constants.NAME}.bean`)
};

export const getRewardErrors = (state): Object => {
  return get(state, `${constants.NAME}.rewardErrors`)
};

export const redemptionErrors = (state): Object => {
  return get(state, `${constants.NAME}.redemptionErrors`)
};

export const redemption = (state): Object => {
  return get(state, `${constants.NAME}.redemption`)
};

export const couponCode = (state): Object => {
  return get(state, `${constants.NAME}.couponCode`)
};

export const getMyAddress = (state): any => {
  return get(state, `${constants.NAME}.myAddress`)
};

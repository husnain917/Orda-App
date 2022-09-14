import R from 'ramda'
import get from 'lodash/get'
import includes from 'lodash/includes'
import reduce from 'lodash/reduce'
import padStart from 'lodash/padStart'
import AsyncStorage from '@react-native-community/async-storage'

const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem('@' + key, value)
  } catch (e) {
    // saving error
  }
}

export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem('@' + key)
    return value
  } catch (e) {
    return null
  }
}

export const isEmpty = (data) => {
  return R.empty(data);
};

export const displayHours = (time) => {
  const timeVal = parseFloat(time);

  let mins: any = Math.round(timeVal * 60);
  let hrs = Math.floor(mins / 60);

  mins = mins % 60;
  mins = '' + mins;
  let pad = '00';
  mins = pad.substring(0, pad.length - mins.length) + mins;

  return hrs + ':' + mins;
};

export const notEmpty = (data) => {
  const type = Object.prototype.toString.call(data).slice(8, -1).toLowerCase();

  switch (type) {
    case 'null':
    case 'undefined':
      return false;
    case 'object':
      return Object.keys(data).length > 0;
    case 'array':
    case 'string':
      return data !== 'undefined' && data !== 'null' && data.length > 0;
    case 'boolean':
      return !!data;
    default:
      return true;
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const trimPrice = (price) => {
  const formatted = price / 100;
  return price % 100 ? formatted.toFixed(2) : formatted;
};

export const thumbnail = (image, dimension) => {
  if (image) {
    return [image.substr(0, image.lastIndexOf('.')), `_${dimension}`, image.substr(image.lastIndexOf('.'))].join('');
  }
  return '';
};

export const getLoyalty = (appSettings, locationId) => {
  const loyalty = get(appSettings, 'loyalty[0]', null)
  const isActive = get(loyalty, 'status') === 'ACTIVE' && includes(get(loyalty, 'location_ids'), locationId)
  return isActive ? loyalty : null
}

export const isOpen = (periods, date) => {
  if (!periods || !periods.length) {
    return true
  }
  const dayOfWeek = days[date.getDay()]
  const localTime = `${padStart(date.getHours(), 2, '0')}:${padStart(date.getMinutes(), 2, '0')}`
  return reduce(periods, (open, period) => {
    return open || (period.day_of_week === dayOfWeek && period.start_local_time <= localTime && period.end_local_time >= localTime)
  }, false)
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
export const distance = (lat1, lon1, lat2, lon2, unit) => {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist;
  }
}

export const pickTextColorBasedOnBgColorAdvanced = (bgColor, lightColor = '#FFFFFF', darkColor = '#000000') => {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return (L > 0.179) ? darkColor : lightColor;
}


export const formatToTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export const formatSearchTextIgnoreQuotes = (text: string) => {
  text = text.replace('“', '"');
  text = text.replace('”', '"');
  text = text.replace('‘', '\'');
  text = text.replace('’', '\'');

  let replacedQuotes = replaceAllOccurenceFromString(text, '\"', '\'');
  return replacedQuotes.replace(/'([^']+)'|\s+/g, (m, g1) => g1 ? g1 : ",")?.split(',')
}

export const replaceAllOccurenceFromString = (str, search, replacement) => {
  return str.replace(new RegExp(search, 'g'), replacement);
}

export const splitTextIgnoreQuotes = (text: string) => {
  let res = text.match(/"[^"]+"|[^\s]+/g,)
  return res ? res : []
}
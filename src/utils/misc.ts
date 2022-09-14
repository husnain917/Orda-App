import {Alert, PermissionsAndroid, Platform} from "react-native";
import Geolocation from "@react-native-community/geolocation";

export const permisionsCheck = () => {
  try {
    if (Platform.OS === 'android'){
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]).then(result => {

      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const geolocationPermisionsCheck = () => {
  try {
    if (Platform.OS === 'android'){
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Site Manage App Geolocation Permission',
          message:'Site Manage App needs access to your geolocation',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      ).then(cameraGranted => {
        if (cameraGranted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
          console.log('Geolocation permission denied');
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const evaluate = (expression) => {
  return new Function('return ' + expression + ';').call(null);
};

export const getCurrentLocation = () => {
  return new Promise((res, rej) => {
    Geolocation.getCurrentPosition(info => {
      return res({
        lat: Math.round(info.coords.latitude*1000000)/1000000,
        lng: Math.round(info.coords.longitude*1000000)/1000000
      });
    }, () => {
      Geolocation.getCurrentPosition(info => {
        return res({
          lat: Math.round(info.coords.latitude*1000000)/1000000,
          lng: Math.round(info.coords.longitude*1000000)/1000000
        });
      }, error => {
        return res({ lat: 0, lng: 0 });
      }, {
        timeout: 5000,
        maximumAge: 10000,
        enableHighAccuracy: false // Get Wifi location
      });
    }, {
      timeout: 5000,
      maximumAge: 10000,
      enableHighAccuracy: true // Get device's GPS.
    });
  });
};

const ConvertDMSToDD = (degrees, minutes, seconds, direction) => {
  let dd =  evaluate(degrees)+  evaluate(minutes)/60 + evaluate(seconds)/(60*60);
  if (direction === "S" || direction === "W") {
    dd = dd * -1;
  }
  return Math.round(dd*1000000)/1000000;

};

export const ParseLatLong = (input, direction) => {
  let parts = input.split('/1,');
  return ConvertDMSToDD(parts[0], parts[1], parts[2], direction);
};

export const cameraPermisionsCheck = () => {
  try {
    if (Platform.OS === 'android'){
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Site Manage App Camera Permission',
          message:
            'Site Manage App needs access to your camera and gallery' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      ).then(cameraGranted => {
        if (cameraGranted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
          console.log('Camera permission denied');
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const genRandomString = (deeps = 10) => {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < deeps; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


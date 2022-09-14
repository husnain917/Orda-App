// Initialize Firebase
export function init () {
  if (window.firebase.apps.length) {
    return
  }

  const firebaseConfig = {
    apiKey: 'AIzaSyAE_c3kyHIxCMRyu3tjG8CF-nB9U7m1eTU',
    authDomain: 'fav-ordering.firebaseapp.com',
    databaseURL: 'https://fav-ordering.firebaseio.com',
    projectId: 'fav-ordering',
    storageBucket: 'fav-ordering.appspot.com',
    messagingSenderId: '317455480351',
    appId: '1:317455480351:web:6ce9a18e145681a0c1472a',
    measurementId: 'G-KC3JLCJF3B'
  }
  window.firebase.initializeApp(firebaseConfig)
}

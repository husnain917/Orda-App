import AsyncStorage from '@react-native-community/async-storage';

export default class LocalStorage {
  get = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key)
      if(value !== null) {
        return value;
      }
      return null;
    } catch(e) {
      return null;
    }
  };

  set = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch (e) {
      // saving error
    }
  };
}

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeLocalStorage = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error('Error storing in local storage');
  }
};

export const getLocalStorage = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (e) {
    console.error('Error getting data from local storage');
  }
  return null;
};

export const storeJSONLocalStorage = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error storing JSON data in local storage', e);
  }
};

export const getJSONLocalStorage = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue !== null) {
      const value = JSON.parse(jsonValue);
      return value;
    }
  } catch (e) {
    console.error('Error getting JSON data from local storage', e);
  }
  return null;
};

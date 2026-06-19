import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const RN = require('react-native');
  if (!RN.codegenNativeComponent) {
    RN.codegenNativeComponent = () => {};
  }
  if (!RN.codegenNativeCommands) {
    RN.codegenNativeCommands = () => ({});
  }
  if (RN.UIManager) {
    if (!RN.UIManager.hasViewManagerConfig) {
      RN.UIManager.hasViewManagerConfig = () => false;
    }
    if (RN.UIManager.default && !RN.UIManager.default.hasViewManagerConfig) {
      RN.UIManager.default.hasViewManagerConfig = () => false;
    }
    if (!RN.UIManager.default) {
      try {
        RN.UIManager.default = RN.UIManager;
      } catch (e) {

      }
    }
  }


  try {
    const SecureStore = require('expo-secure-store');
    SecureStore.getItemAsync = async (key) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    };
    SecureStore.setItemAsync = async (key, value) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    };
    SecureStore.deleteItemAsync = async (key) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    };
  } catch (e) {
    console.error('Falha ao aplicar polyfill em expo-secure-store:', e);
  }
}

import 'expo-router/entry';
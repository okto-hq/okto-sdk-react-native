import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';

export const refFunctions = {
  reload: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  injectJavaScript: jest.fn(),
};

export const WebView = forwardRef((_props, ref) => {
  useImperativeHandle(ref, () => refFunctions);
  return <View />;
});

export default WebView;

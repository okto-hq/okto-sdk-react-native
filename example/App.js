import React from 'react';
import App from './src/App';
import { OktoBottomSheetProvider } from 'okto-sdk-react-native';

export default function AppMain() {
  return (
    <OktoBottomSheetProvider>
      <App />
    </OktoBottomSheetProvider>
  );
}

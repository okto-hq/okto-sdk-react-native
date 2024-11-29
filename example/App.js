import React from 'react';
import App from './src/App';
import { OktoProvider } from 'okto-sdk-react-native';
import { OKTO_CLIENT_API } from '@env';
import { BuildType } from 'okto-sdk-react-native';
import { GoogleLogin } from './src/SignIn';

export default function AppMain() {

  async function handleGAuth() {
    try {
      const response = await GoogleLogin();
      if (response && response.idToken) {
        const { idToken } = response;
        return idToken;
      } else {
        console.error('Google Login, No idToken found', response);
      }
      return '';
    } catch (apiError) {
      console.error(apiError);
    }
  }

  return (
    <OktoProvider apiKey={OKTO_CLIENT_API} buildType={BuildType.SANDBOX} gAuthCb={handleGAuth}>
      <App />
    </OktoProvider>
  );
}

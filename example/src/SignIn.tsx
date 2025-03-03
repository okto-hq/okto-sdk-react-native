import { Button } from 'react-native';
import {
  GoogleSignin,
  type ConfigureParams,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import React from 'react';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
} as ConfigureParams);

export const GoogleLogin = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  return userInfo;
};

export const GoogleLogout = async () => {
  await GoogleSignin.signOut();
};

interface SignInProps {
  onSignIn: (idToken: string) => void; // Define the type of the onSignIn prop
}

export default function SignIn({ onSignIn }: SignInProps) {
  const handleGoogleLogin = async () => {
    try {
      const response = await GoogleLogin();
      if (response && response.idToken) {
        const { idToken } = response;
        onSignIn(idToken);
      } else {
        console.error('Google Login, No idToken found', response);
      }
    } catch (apiError) {
      console.error(apiError);
    }
  };

  // useEffect(()=>{
  //   handleGoogleLogin();
  // });

  return <Button title="SignIn" onPress={handleGoogleLogin} />;
}

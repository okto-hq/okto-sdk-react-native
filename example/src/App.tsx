import * as React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { init, authenticate, BuildType } from 'okto-sdk-react-native';
import SignIn from './SignIn';

import { OKTO_CLIENT_API } from '@env';

init(OKTO_CLIENT_API, BuildType.SANDBOX);

export default function App() {
  const [idToken, setIdToken] = React.useState<string>();

  function handleSignIn(idToken: string) {
    console.log('handleSignIn', idToken);
    setIdToken(idToken);
  }

  return (
    <View style={styles.container}>
      <Text>Okto SDK TEST App</Text>
      <SignIn onSignIn={handleSignIn} />
      <Button
        title="authenticate"
        onPress={() => {
          authenticate(idToken!, (result, error) => {
            if (result) {
              console.log('authentication successful');
            }
            if (error) {
              console.error('authentication error', error);
            }
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});

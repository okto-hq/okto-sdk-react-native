import * as React from 'react';

import { StyleSheet, View, Text, Button, SafeAreaView, ScrollView} from 'react-native';
import * as Okto from 'okto-sdk-react-native';
import SignIn from './SignIn';
import GetButton from './components/GetButton';
import { OKTO_CLIENT_API } from '@env';
import TransferTokens from './components/TransferTokens';

Okto.init(OKTO_CLIENT_API, Okto.BuildType.SANDBOX);

export default function App() {
  const [idToken, setIdToken] = React.useState<string>();

  const { showBottomSheet } = Okto.useOktoBottomSheet() as Okto.SheetContextType;

  function handleAuthenticate(result: any, error: any) {
    if (result) {
      console.log('authentication successful');
    }
    if (error) {
      console.error('authentication error:', error);
    }
  }

  function handleSignIn(_idToken: string) {
    console.log('Google signIn: Success');
    Okto.authenticate(_idToken, handleAuthenticate);
    setIdToken(_idToken);
  }

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Okto SDK TEST App</Text>
        <View style={styles.buttonGroup}>
          <SignIn onSignIn={handleSignIn} />
          <View style={styles.padding} />
          <Button
            title="authenticate"
            onPress={() => {
              Okto.authenticate(idToken!, handleAuthenticate);
            }}
          />
          <View style={styles.padding} />
          <Button
            title="openOktoBottomsheet"
            onPress={() => {
              showBottomSheet(Okto.BottomSheetType.WIDGET);
            }}
          />
          <View style={styles.padding} />
          <Button
            title="ShowPinScreen"
            onPress={() => {
              showBottomSheet(Okto.BottomSheetType.PIN);
            }}
          />
        </View>

        <GetButton title="getPortfolio" apiFn={Okto.getPortfolio} />
        <GetButton
          title="getSupportedNetworks"
          apiFn={Okto.getSupportedNetworks}
        />
        <GetButton title="getSupportedTokens" apiFn={Okto.getSupportedTokens} />
        <GetButton title="getUserDetails" apiFn={Okto.getUserDetails} />
        <GetButton title="getWallets" apiFn={Okto.getWallets} />
        <GetButton title="createWallet" apiFn={Okto.createWallet} />
        <GetButton title="orderHistory" apiFn={Okto.orderHistory} />
        <GetButton title="getNftOrderDetails" apiFn={Okto.getNftOrderDetails} />

        <View style={styles.padding} />
        <TransferTokens />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  buttonGroup: {
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  padding: {
    padding: 5,
  },
});

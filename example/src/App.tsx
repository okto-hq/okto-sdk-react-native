import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  Button,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useOkto, type OktoContextType } from 'okto-sdk-react-native';
import SignIn, { GoogleLogout } from './SignIn';
import GetButton from './components/GetButton';
import TransferTokens from './components/TransferTokens';
import { EmailOTPVerification } from './components/EmailOtp';
import { PhoneOTPVerification } from './components/PhoneOtp';

export default function App() {
  const [idToken, setIdToken] = React.useState<string>();

  const {
    showWidgetSheet,
    authenticate,
    getPortfolio,
    getSupportedNetworks,
    getSupportedTokens,
    getUserDetails,
    getWallets,
    createWallet,
    orderHistory,
    getNftOrderDetails,
    logOut,
    showOnboardingWidget,
    readContractData,
  } = useOkto() as OktoContextType;

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
    authenticate(_idToken, handleAuthenticate);
    setIdToken(_idToken);
  }

  // Add this new function to handle the read contract data
  async function handleReadContract() {
    try {
      const result = await readContractData('POLYGON',
        {
          contractAddress: '0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3',
          abi: {
            inputs: [],
            name: 'totalSupply',
            outputs: [
              {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
          args: {},
        }
      );
      return result;
    } catch (error) {
      console.error('Read contract error:', error);
      return { error };
    }
  }

  async function handleReadContractAptos() {
    try {
      const result = await readContractData('APTOS_TESTNET',
        {
          function:
          '0x0000000000000000000000000000000000000000000000000000000000000001::chain_id::get',
          typeArguments: [],
          functionArguments: [],
        }
      );
      return result;
    } catch (error) {
      console.error('Read contract error:', error);
      return { error };
    }
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
              authenticate(idToken!, handleAuthenticate);
            }}
          />
          <View style={styles.padding} />
          <Button
            title="logout"
            onPress={() => {
              logOut();
              GoogleLogout();
              Alert.alert('Success', 'logged out');
            }}
          />
          <View style={styles.padding} />
          <Button
            title="openOktoBottomsheet"
            onPress={() => {
              showWidgetSheet();
            }}
          />
          <View style={styles.padding} />
          <Button
            title="openOnboardingWidget"
            onPress={() => {
              showOnboardingWidget();
            }}
          />
        </View>

        <GetButton title="getPortfolio" apiFn={getPortfolio} />
        <GetButton title="getSupportedNetworks" apiFn={getSupportedNetworks} />
        <GetButton title="getSupportedTokens" apiFn={getSupportedTokens} />
        <GetButton title="getUserDetails" apiFn={getUserDetails} />
        <GetButton title="getWallets" apiFn={getWallets} />
        <GetButton title="Read Contract Data" apiFn={handleReadContract} />
        <GetButton title="Read Contract Aptos" apiFn={handleReadContractAptos} />
        <GetButton title="createWallet" apiFn={createWallet} />
        <GetButton title="orderHistory" apiFn={() => orderHistory({})} />
        <GetButton
          title="getNftOrderDetails"
          apiFn={() => getNftOrderDetails({})}
        />
        <EmailOTPVerification />
        <PhoneOTPVerification />

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

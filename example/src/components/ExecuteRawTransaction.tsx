import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, Text, StyleSheet } from 'react-native';
import {
  useOkto,
  type OktoContextType,
} from 'okto-sdk-react-native';

function getTestInstructions(signer: string) {
  return [
    {
      keys: [
        {
          pubkey: signer,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: 'Eeaq9tfNzk2f8ijdiHNZpjsBV96agB2F3bNmwx6fdVr6',
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: '11111111111111111111111111111111',
      data: [2, 0, 0, 0, 128, 150, 152, 0, 0, 0, 0, 0],
    },
  ];
}

export function ExecuteRawTransaction() {
  const { executeRawTransaction, getWallets } = useOkto() as OktoContextType;
  const [networkName, setNetworkName] = useState('SOLANA_DEVNET');
  const [instructions, setInstructions] = useState<any[]>([]);
  const [signers, setSigners] = useState<string[]>([]);

  //Get the wallet address
  useEffect(() => {
    (async () => {
      try {
        const wallets = (await getWallets()).wallets;
        const wallet = wallets.find(
          (x) => x.network_name === networkName
        );
        if (!wallet) {
          console.error(`Could not find ${networkName} in wallets = `, wallets);
          return;
        }
        console.log('wallet: ', wallet);
        setSigners([wallet.address]);
        setInstructions(getTestInstructions(wallet.address));
      } catch (error) {
        console.log('error calling get wallets', error);
      }

    })();
  }, [networkName, getWallets]);


  const handleSubmit = () => {
    console.log('Calling Raw transacion: ', {
      networkName,
    });
    executeRawTransaction({
      network_name: networkName,
      transaction: {
        instructions,
        signers,
      },
    })
      .then((result) => {
        console.log('Raw Transaction success', result);
      })
      .catch((error) => {
        console.log('Raw Transaction error', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raw Transaction</Text>
      <TextInput
        style={styles.input}
        value={networkName}
        onChangeText={(value) => setNetworkName(value)}
        placeholder="Enter Network Name"
      />
      <Button title="Raw Transaction" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

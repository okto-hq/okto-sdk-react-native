import React, { useState } from 'react';
import { View, Button, TextInput, Text, StyleSheet } from 'react-native';
import { transferTokens } from 'okto-sdk-react-native';

function TransferTokens() {
  const [networkName, setNetworkName] = useState('SOLANA_DEVNET');
  const [tokenAddress, setTokenAddress] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [recipientAddress, setRecipientAddress] = useState(
    'Eeaq9tfNzk2f8ijdiHNZpjsBV96agB2F3bNmwx6fdVr6'
  );
  const handleSubmit = () => {
    console.log('Calling transfer funds: ', {
      networkName,
      tokenAddress,
      recipientAddress,
      quantity,
    });
    transferTokens(
      {
        network_name: networkName,
        token_address: tokenAddress,
        recipient_address: recipientAddress,
        quantity,
      },
      (result: any, error: any) => {
        if (result) {
          console.log('Transfer success', result);
        }
        if (error) {
          console.log('Transfer error', error);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfer Tokens</Text>
      <TextInput
        style={styles.input}
        value={networkName}
        onChangeText={(value) => setNetworkName(value)}
        placeholder="Enter Network Name"
      />
      <TextInput
        style={styles.input}
        value={tokenAddress}
        onChangeText={(value) => setTokenAddress(value)}
        placeholder="Enter Token Address"
      />
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={(value) => setQuantity(value)}
        placeholder="Enter Quantity"
      />
      <TextInput
        style={styles.input}
        value={recipientAddress}
        onChangeText={(value) => setRecipientAddress(value)}
        placeholder="Enter Recipient Address"
      />
      <Button title="Transfer Tokens" onPress={handleSubmit} />
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

export default TransferTokens;

import React, { useState } from 'react';
import {
  View,
  Button,
  Modal,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface GetButtonProps {
  title: string;
  apiFn: (callback: any) => void;
}

function GetButton({ title, apiFn }: GetButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [resultData, setResultData] = useState('');

  function callback(result: any, error: any) {
    if (result) {
      console.log(`${title}:`, result);
      setResultData(JSON.stringify(result, null, 2)); // Pretty print the JSON
      setModalVisible(true);
    }
    if (error) {
      console.error(`${title} error:`, error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonGroup}>
        <Button
          title={title}
          onPress={() => {
            apiFn(callback);
          }}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <ScrollView style={styles.modalView} nestedScrollEnabled={true}>
          <Text style={styles.modalText}>{resultData}</Text>
        </ScrollView>
        <Button title="Close" onPress={() => setModalVisible(!modalVisible)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    width: '100%',
    paddingVertical: 5,
  },
  modalView: {
    marginTop: 22,
    padding: 20,
    backgroundColor: 'white',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
  },
});

export default GetButton;

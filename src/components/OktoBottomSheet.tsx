import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { OktoWebViewWidget } from './OktoWebViewWidget';

const _OktoBottomSheet = ({}: {}, ref: any) => {
  const [showScreen, setShowScreen] = useState<boolean>(false);
  const [webViewCanGoBack, setWebViewCanGoBack] = useState(false);
  const webViewRef = useRef<any>(null);

  const openSheet = () => {
    setShowScreen(true);
  };

  const closeSheet = () => {
    setShowScreen(false);
  };

  useImperativeHandle(ref, () => ({
    openSheet,
    closeSheet,
  }));

  function handleBackPress() {
    if (webViewCanGoBack) {
      webViewRef.current?.goBack();
    } else {
      closeSheet();
    }
  }

  return (
    <Modal
      transparent
      visible={showScreen}
      animationType="slide"
      onRequestClose={handleBackPress}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalEmpty} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <OktoWebViewWidget
            webViewRef={webViewRef}
            canGoBack={webViewCanGoBack}
            setCanGoBack={setWebViewCanGoBack}
          />
        </View>
      </View>
    </Modal>
  );
};
export const OktoBottomSheet = forwardRef(_OktoBottomSheet);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalEmpty: {
    flex: 1,
  },
  modalContent: {
    height: '75%',
    backgroundColor: 'black',
  },
});

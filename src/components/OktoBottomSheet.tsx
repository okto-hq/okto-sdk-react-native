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
import { PinScreenWidget } from './PinScreenWidget';
import { BottomSheetType } from '../types';

const _OktoBottomSheet = ({}: {}, ref: any) => {
  const [currentScreen, setCurrentScreen] = useState<BottomSheetType | null>(
    null
  );
  const [webViewCanGoBack, setWebViewCanGoBack] = useState(false);
  const webViewRef = useRef<any>(null);
  const pinCallback = useRef<any>(null);

  const setPinCallback = (callback: any) => {
    pinCallback.current = callback;
  };

  const callPinCallback = (res: any) => {
    if (pinCallback.current) {
      pinCallback.current(res);
    }
  };

  const openSheet = (
    screen: BottomSheetType | null,
    callback: (success: boolean) => void
  ) => {
    setCurrentScreen(screen);
    setPinCallback(callback);
  };

  const closeSheet = () => {
    setCurrentScreen(null);
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
      visible={currentScreen != null}
      animationType="slide"
      onRequestClose={handleBackPress}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalEmpty} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          {currentScreen === BottomSheetType.WIDGET ? (
            <OktoWebViewWidget
              webViewRef={webViewRef}
              canGoBack={webViewCanGoBack}
              setCanGoBack={setWebViewCanGoBack}
            />
          ) : (
            <PinScreenWidget
              webViewRef={webViewRef}
              canGoBack={webViewCanGoBack}
              setCanGoBack={setWebViewCanGoBack}
              onResult={(result: boolean) => {
                callPinCallback(result);
                closeSheet();
              }}
            />
          )}
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

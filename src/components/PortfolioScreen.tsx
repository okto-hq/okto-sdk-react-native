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
  type ColorValue,
} from 'react-native';
import { RnOktoSdk } from '../OktoWallet';
import WebView from 'react-native-webview';
import { widgetUrls } from '../constants';

const _PortfolioScreen = ({}: {}, ref: any) => {
  const [showScreen, setShowScreen] = useState<boolean>(false);
  const [webViewCanGoBack, setWebViewCanGoBack] = useState(false);
  const webViewRef = useRef<any>(null);

  const open = () => {
    setShowScreen(true);
  };

  const close = () => {
    setShowScreen(false);
  };

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  function handleBackPress() {
    if (webViewCanGoBack) {
      webViewRef.current?.goBack();
    } else {
      close();
    }
  }

  function handleNavigationStateChange(navState: any) {
    if (webViewCanGoBack !== navState.canGoBack) {
      setWebViewCanGoBack(navState.canGoBack);
    }
  }

  function getInjecteJs(): string {
    let injectJs = '';
    const authToken = RnOktoSdk.getAuthToken();
    const theme = RnOktoSdk.getTheme();
    const buildType = RnOktoSdk.getBuildType();

    injectJs +=
      `window.localStorage.setItem('ENVIRONMENT', '${buildType}');` +
      `window.localStorage.setItem('textPrimaryColor', '${theme.textPrimaryColor}');` +
      `window.localStorage.setItem('textSecondaryColor', '${theme.textSecondaryColor}');` +
      `window.localStorage.setItem('textTertiaryColor', '${theme.textTertiaryColor}');` +
      `window.localStorage.setItem('accent1Color', '${theme.accent1Color}');` +
      `window.localStorage.setItem('accent2Color', '${theme.accent2Color}');` +
      `window.localStorage.setItem('strokeBorderColor', '${theme.strokeBorderColor}');` +
      `window.localStorage.setItem('strokeDividerColor', '${theme.strokeDividerColor}');` +
      `window.localStorage.setItem('surfaceColor', '${theme.surfaceColor}');` +
      `window.localStorage.setItem('backgroundColor', '${theme.backgroundColor}');`;

    if (authToken) {
      injectJs +=
        `window.localStorage.setItem('authToken', '${authToken}');`;
    }
    return injectJs;
  }

  const theme = RnOktoSdk.getTheme();
  const webViewStyles = StyleSheet.create({
    webView: { flex: 1 , backgroundColor: theme.backgroundColor as ColorValue},
  });

  const buildType = RnOktoSdk.getBuildType();

  return (
    <Modal
      transparent
      visible={showScreen}
      animationType="slide"
      onRequestClose={handleBackPress}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles.modalEmpty} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <WebView
            ref={webViewRef}
            source={{ uri: widgetUrls[buildType] }}
            style={webViewStyles.webView}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            injectedJavaScriptBeforeContentLoaded={getInjecteJs()}
          />
        </View>
      </View>
    </Modal>
  );
};
export const PortfolioScreen = forwardRef(_PortfolioScreen);

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
  },
});

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
import WebView from 'react-native-webview';
import { widgetUrls } from '../constants';
import type { BuildType, Theme } from '../types';
import base64 from 'react-native-base64';

const _PortfolioScreen = ({
  authToken,
  buildType,
  theme,
}: {
  authToken: string | undefined,
  buildType: BuildType,
  theme: Theme,
}, ref: any) => {
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
    const webViewData = {
      "ENVIRONMENT": buildType,
      "textPrimaryColor": theme.textPrimaryColor,
      "textSecondaryColor": theme.textSecondaryColor,
      "textTertiaryColor": theme.textTertiaryColor,
      "accent1Color": theme.accent1Color,
      "accent2Color": theme.accent2Color,
      "strokeBorderColor": theme.strokeBorderColor,
      "strokeDividerColor": theme.strokeDividerColor,
      "surfaceColor": theme.surfaceColor,
      "backgroundColor": theme.backgroundColor,
      "authToken": ""
    };

    if(authToken){
      webViewData["authToken"] = authToken
    }
    
    const webViewDataEncoded = base64.encode(JSON.stringify(webViewData));
    injectJs += `window.localStorage.setItem("webviewData", atob("${webViewDataEncoded}"));`;

    return injectJs;
  }

  const webViewStyles = StyleSheet.create({
    webView: { flex: 1 , backgroundColor: theme.backgroundColor as ColorValue},
  });


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

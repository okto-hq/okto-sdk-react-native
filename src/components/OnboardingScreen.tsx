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
import { WebView } from 'react-native-webview';
import { onBoardingUrls } from '../constants';
import type { AuthDetails, AuthType, BrandData, BuildType, Theme } from '../types';
import Clipboard from '@react-native-clipboard/clipboard';

const _OnboardingScreen = ({
    updateAuthCb,
    gAuthCb,
    buildType,
    apiKey,
    brandData,
    primaryAuth,
    theme,
}: {
  updateAuthCb: (authDetails: AuthDetails) => Promise<void>,
  gAuthCb: () => Promise<string>,
  buildType: BuildType,
  apiKey: string,
  brandData: BrandData,
  primaryAuth: AuthType,
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
    const webViewData={
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
      "API_KEY": apiKey,
      "primaryAuthType": primaryAuth,
      "brandTitle": brandData.title,
      "brandSubtitle": brandData.subtitle,
      "brandIconUrl": brandData.iconUrl
    }
    const webViewDataString=JSON.stringify(webViewData);


    injectJs +=
      `window.localStorage.setItem('webviewData', ${webViewDataString});`;
    const injectionScript = `
    (function() {
      const originalSendMessageToApp = window.sendMessageToApp;
      
      window.sendMessageToApp = function(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      };
      true;
    })();
  `;

    return injectJs + injectionScript;
  }

  const sendMessageToWebView = (type: string, data: any) => {
    const message = { type, data };
    const jsCode = `
      (function() {
        window.postMessage('${JSON.stringify(message)}', '*');
        true;
      })();
    `;

    webViewRef.current?.injectJavaScript(jsCode);
};

  async function handleMessage(event: any) {
    try {
        let message = JSON.parse(event.nativeEvent.data);

        if (typeof message === 'string') {
          try {
            message = JSON.parse(message);
          } catch (error) {
            console.error('Error parsing okto widget data', error);
          }
        }

        if (message.type === 'go_back') {
          close();
        } else if (message.type === 'g_auth') {
          //handle google auth
          const idToken = await gAuthCb();
          sendMessageToWebView('g_auth', idToken);
        } else if (message.type === 'copy_text') {
          const clipboardText = await Clipboard.getString();
          const trimmedText = clipboardText.trim();
          sendMessageToWebView('copy_text', trimmedText);
        } else if (message.type === 'auth_success') {
          //handle auth success
          const authData = message.data;
          const authDetails: AuthDetails = {
            authToken: authData.auth_token,
            refreshToken: authData.refresh_auth_token,
            deviceToken: authData.device_token,
          };
          await updateAuthCb(authDetails);
          close();
        }
      } catch (error) {
        console.error('Error parsing okto widget data', error);
      }
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
            source={{ uri: onBoardingUrls[buildType] }}
            style={webViewStyles.webView}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            injectedJavaScriptBeforeContentLoaded={getInjecteJs()}
          />
        </View>
      </View>
    </Modal>
  );
};
export const OnboardingScreen = forwardRef(_OnboardingScreen);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalEmpty: {
    flex: 1,
  },
  modalContent: {
    height: '100%',
  },
});

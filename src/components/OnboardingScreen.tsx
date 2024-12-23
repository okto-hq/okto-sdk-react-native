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
import { RnOktoSdk } from '../OktoWallet';
import { onBoardingUrls } from '../constants';
import type { AuthDetails, AuthType, BrandData } from '../types';
import Clipboard from '@react-native-clipboard/clipboard';

const _OnboardingScreen = ({
    gAuthCb,
    brandData,
    primaryAuth,
}: {
  gAuthCb: () => Promise<string>,
  brandData: BrandData,
  primaryAuth: AuthType
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
      `window.localStorage.setItem('backgroundColor', '${theme.backgroundColor}');` +
      `window.localStorage.setItem('API_KEY', '${RnOktoSdk.getApiKey()}');` +
      `window.localStorage.setItem('primaryAuthType', '${primaryAuth}');` +
      `window.localStorage.setItem('brandTitle', '${brandData.title}');` +
      `window.localStorage.setItem('brandSubtitle', '${brandData.subtitle}');` +
      `window.localStorage.setItem('brandIconUrl', '${brandData.iconUrl}');`;

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
          await RnOktoSdk.updateAuthDetails(authDetails);
          close();
        }
      } catch (error) {
        console.error('Error parsing okto widget data', error);
      }
  }

  const theme = RnOktoSdk.getTheme();
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
            source={{ uri: onBoardingUrls[RnOktoSdk.getBuildType()] }}
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

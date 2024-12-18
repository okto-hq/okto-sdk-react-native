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
import { WebView } from 'react-native-webview';
import { RnOktoSdk } from '../OktoWallet';
import { Loading } from './Loading';
import { onBoardingUrls } from '../constants';
import type { AuthDetails, AuthType, OnboardingModalData } from '../types';
import Clipboard from '@react-native-clipboard/clipboard';

const _OnboardingWidget = ({gAuthCb}: {gAuthCb: () => Promise<string>}, ref: any) => {
  const [showScreen, setShowScreen] = useState<boolean>(false);
  const [webViewCanGoBack, setWebViewCanGoBack] = useState(false);
  const webViewRef = useRef<any>(null);
  const [onBoardingModalData, setOnBoardingModalData] = useState<OnboardingModalData>();

  const openSheet = (primaryAuth: AuthType, title: string, subtitle: string, iconUrl: string) => {
    setOnBoardingModalData({ primaryAuthType: primaryAuth, brandTitle: title, brandSubtitle: subtitle, brandIconUrl: iconUrl });
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
      `window.localStorage.setItem('primaryAuthType', '${onBoardingModalData?.primaryAuthType}');` +
      `window.localStorage.setItem('brandTitle', '${onBoardingModalData?.brandTitle}');` +
      `window.localStorage.setItem('brandSubtitle', '${onBoardingModalData?.brandSubtitle}');` +
      `window.localStorage.setItem('brandIconUrl', '${onBoardingModalData?.brandIconUrl}');`;

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
          closeSheet();
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
        }
      } catch (error) {
        console.error('Error parsing okto widget data', error);
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
          <WebView
            ref={webViewRef}
            source={{ uri: onBoardingUrls[RnOktoSdk.getBuildType()] }}
            style={styles.webView}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            injectedJavaScriptBeforeContentLoaded={getInjecteJs()}
            renderLoading={() => <Loading />}
            webviewDebuggingEnabled
          />
        </View>
      </View>
    </Modal>
  );
};
export const OnboardingWidget = forwardRef(_OnboardingWidget);

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
  webView: { flex: 1 },
});

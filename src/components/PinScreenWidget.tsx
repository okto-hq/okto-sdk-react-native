import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Loading } from './Loading';
import { RnOktoSdk } from '../OktoWallet';
import { pinScreenUrl } from '../constants';

export function PinScreenWidget({
  webViewRef,
  canGoBack,
  setCanGoBack,
  onClose,
}: {
  webViewRef: any;
  canGoBack: boolean;
  setCanGoBack: (x: boolean) => void;
  onClose: () => void;
}) {
  function handleNavigationStateChange(navState: any) {
    if (canGoBack !== navState.canGoBack) {
      setCanGoBack(navState.canGoBack);
    }
  }

  function getInjectJs(): string {
    const pinScreenData = {
      api_key: RnOktoSdk.getApiKey(),
      base_url: RnOktoSdk.getBaseUrl(),
      id_token: RnOktoSdk.getIdToken(),
      token: RnOktoSdk.getAuthToken(),
    };
    const injectJs = `
    try {
      window.localStorage.setItem("PinScreenData", '${JSON.stringify(pinScreenData)}');
    } catch(e) {
      window.ReactNativeWebView.postMessage('{"status":"failed"}')
    }
    `;
    return injectJs;
  }

  const onMessage = (payload: any) => {
    // console.log('payload ->', payload.nativeEvent.data);
    try {
      RnOktoSdk.updateAuthFromSetPincode(JSON.parse(payload.nativeEvent.data));
    } catch {
      console.log(payload.nativeEvent.data);
    }
    finally {
      onClose();
    }
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: pinScreenUrl }}
      style={styles.webView}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState
      javaScriptEnabled
      domStorageEnabled
      injectedJavaScriptBeforeContentLoaded={getInjectJs()}
      onMessage={onMessage}
      renderLoading={() => <Loading />}
      // webviewDebuggingEnabled
    />
  );
}

const styles = StyleSheet.create({
  webView: { flex: 1 },
});

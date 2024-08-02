import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Loading } from './Loading';
import { RnOktoSdk } from '../OktoWallet';
import { widgetUrl } from '../constants';

export function OktoWebViewWidget({
  webViewRef,
  canGoBack,
  setCanGoBack,
}: {
  webViewRef: any;
  canGoBack: boolean;
  setCanGoBack: (x: boolean) => void;
}) {

  function handleNavigationStateChange(navState: any) {
    if (canGoBack !== navState.canGoBack) {
      setCanGoBack(navState.canGoBack);
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
      `window.localStorage.setItem('accentColor', '${theme.accentColor}');` +
      `window.localStorage.setItem('accent2Color', '${theme.accent2Color}');` +
      `window.localStorage.setItem('strokBorderColor', '${theme.strokBorderColor}');` +
      `window.localStorage.setItem('strokDividerColor', '${theme.strokDividerColor}');` +
      `window.localStorage.setItem('surfaceColor', '${theme.surfaceColor}');` +
      `window.localStorage.setItem('backgroundColor', '${theme.backgroundColor}');`;

    if (authToken) {
      injectJs +=
        `window.localStorage.setItem('authToken', '${authToken}');`;
    }
    return injectJs;
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: widgetUrl }}
      style={styles.webView}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState
      javaScriptEnabled
      domStorageEnabled
      injectedJavaScriptBeforeContentLoaded={getInjecteJs()}
      renderLoading={() => <Loading />}
      // webviewDebuggingEnabled
    />
  );
}

const styles = StyleSheet.create({
  webView: { flex: 1 },
});

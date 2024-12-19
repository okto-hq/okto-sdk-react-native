import React from 'react';
import { StyleSheet, type ColorValue } from 'react-native';
import { WebView } from 'react-native-webview';
import { RnOktoSdk } from '../OktoWallet';
import { widgetUrls } from '../constants';

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
  const styles = StyleSheet.create({
    webView: { flex: 1 , backgroundColor: theme.backgroundColor as ColorValue},
  });

  const buildType = RnOktoSdk.getBuildType();

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: widgetUrls[buildType] }}
      style={styles.webView}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState
      javaScriptEnabled
      domStorageEnabled
      injectedJavaScriptBeforeContentLoaded={getInjecteJs()}
    />
  );
}

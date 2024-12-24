
import React, { useState, useCallback, memo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import App from './src/App';
import { OktoProvider } from 'okto-sdk-react-native';
import { BuildType } from 'okto-sdk-react-native';
import { GoogleLogin } from './src/SignIn';
import { OKTO_CLIENT_API } from '@env';

const BuildTypeButton = memo(({ type, label, buildType, onPress }) => (
  <TouchableOpacity
    style={[
      styles.toggleButton,
      buildType === BuildType[type] && styles.toggleButtonActive,
    ]}
    onPress={() => onPress(BuildType[type])}
  >
    <Text style={[
      styles.toggleText,
      buildType === BuildType[type] && styles.toggleTextActive,
    ]}>{label}</Text>
  </TouchableOpacity>
));

const ConfigScreen = memo(({ apiKey, setApiKey, buildType, setBuildType, onSave }) => (
  <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.content}
    >
      <Text style={styles.title}>Configuration</Text>
      <Text style={styles.subtitle}>Set up your Okto SDK credentials</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>API Key</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your API key"
          placeholderTextColor="#666"
          value={apiKey}
          onChangeText={setApiKey}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          keyboardType="visible-password"
          returnKeyType="done"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.buildTypeContainer}>
        <Text style={styles.label}>Build Type</Text>
        <View style={styles.toggleContainer}>
          <BuildTypeButton type="SANDBOX" label="Sandbox" buildType={buildType} onPress={setBuildType} />
          <BuildTypeButton type="STAGING" label="Staging" buildType={buildType} onPress={setBuildType} />
          <BuildTypeButton type="PRODUCTION" label="Prod" buildType={buildType} onPress={setBuildType} />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, !apiKey && styles.saveButtonDisabled]}
        onPress={onSave}
        disabled={!apiKey}
      >
        <Text style={styles.saveButtonText}>Save Configuration</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  </SafeAreaView>
));

export default function AppMain() {
  const [apiKey, setApiKey] = useState(OKTO_CLIENT_API);
  const [isConfigured, setIsConfigured] = useState(false);
  const [buildType, setBuildType] = useState(BuildType.SANDBOX);

  const handleGAuth = useCallback(async () => {
    try {
      const response = await GoogleLogin();
      if (response && response.idToken) {
        const { idToken } = response;
        return idToken;
      } else {
        console.error('Google Login, No idToken found', response);
      }
      return '';
    } catch (apiError) {
      console.error(apiError);
    }
  }, []);

  const handleSave = useCallback(() => {
    setIsConfigured(true);
  }, []);

  const handleBuildTypeChange = useCallback((newBuildType) => {
    setBuildType(newBuildType);
  }, []);

  return isConfigured ? (
    <OktoProvider apiKey={apiKey} buildType={buildType} gAuthCb={handleGAuth}>
      <App />
    </OktoProvider>
  ) : (
    <ConfigScreen
      apiKey={apiKey}
      setApiKey={setApiKey}
      buildType={buildType}
      setBuildType={handleBuildTypeChange}
      onSave={handleSave}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  buildTypeContainer: {
    marginBottom: 32,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

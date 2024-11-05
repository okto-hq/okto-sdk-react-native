import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useOkto, type OktoContextType } from 'okto-sdk-react-native';

interface EmailOTPVerificationProps {
  onVerificationSuccess?: () => void;
  onVerificationError?: (error: Error) => void;
}

export const EmailOTPVerification: React.FC<EmailOTPVerificationProps> = ({
  onVerificationSuccess,
  onVerificationError,
}) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const { sendEmailOTP, verifyEmailOTP } = useOkto() as OktoContextType;

  const validateEmail = (e: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e);
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await sendEmailOTP(email);
      setOtpToken(response.token);
      setStep('otp');
      Alert.alert('Success', 'OTP sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
      console.error('Send OTP Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const success = await verifyEmailOTP(
        email,
        otp,
        otpToken!,
      );
      if (success) {
        onVerificationSuccess?.();
        Alert.alert('Success', 'Email verified successfully');
      } else {
        Alert.alert('Error', 'Invalid OTP');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(errorMessage);
      onVerificationError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {step === 'email' ? (
        <>
          <TextInput
            style={[styles.input]}
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading || !email}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={[styles.input]}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              setError(null);
            }}
            keyboardType="numeric"
            maxLength={6}
            editable={!loading}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading || !otp}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              setStep('email');
              setOtp('');
              setError(null);
            }}
          >
            <Text style={styles.resendText}>Change Email / Resend OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    height: 48,
    backgroundColor: '#905BF5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    padding: 8,
    alignItems: 'center',
  },
  resendText: {
    color: '#905BF5',
    fontSize: 14,
    fontWeight: '500',
  },
});

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

interface PhoneOTPVerificationProps {
  onVerificationSuccess?: () => void;
  onVerificationError?: (error: Error) => void;
}

export const PhoneOTPVerification: React.FC<PhoneOTPVerificationProps> = ({
  onVerificationSuccess,
  onVerificationError,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('IN'); // Default to India
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const { sendPhoneOTP, verifyPhoneOTP } = useOkto() as OktoContextType;

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/; // Basic validation for 10 digits
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await sendPhoneOTP(phoneNumber, countryCode);
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
      const success = await verifyPhoneOTP(
        phoneNumber,
        countryCode,
        otp,
        otpToken!
      );
      if (success) {
        onVerificationSuccess?.();
        Alert.alert('Success', 'Phone number verified successfully');
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
      {step === 'phone' ? (
        <>
          <View style={styles.phoneContainer}>
            <TextInput
              style={[styles.countryInput]}
              placeholder="Country"
              value={countryCode}
              onChangeText={setCountryCode}
              maxLength={2}
              autoCapitalize="characters"
            />
            <TextInput
              style={[styles.phoneInput]}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text.replace(/[^0-9]/g, ''));
                setError(null);
              }}
              keyboardType="numeric"
              maxLength={10}
              editable={!loading}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading || !phoneNumber || !countryCode}
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
              setOtp(text.replace(/[^0-9]/g, ''));
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
              setStep('phone');
              setOtp('');
              setError(null);
            }}
          >
            <Text style={styles.resendText}>Change Number / Resend OTP</Text>
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
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  countryInput: {
    height: 48,
    width: 80,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
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

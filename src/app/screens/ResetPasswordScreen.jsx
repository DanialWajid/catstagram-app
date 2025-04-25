import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Lock } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { resetPassword, error, isLoading, message } = useAuthStore();
  const route = useRoute();
  const navigation = useNavigation();
  const { token } = route.params || {};

  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /\d/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(password)) {
      return "Password must be at least 8 characters long.";
    }
    if (!uppercase.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!lowercase.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!number.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!specialChar.test(password)) {
      return "Password must contain at least one special character.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validatePassword(password);

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(token, password);
      Alert.alert(
        'Success',
        'Password reset successfully, redirecting to login page...',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Error resetting password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, styles.containerDark]}
      >
        <View style={[styles.formContainer, styles.formContainerDark]}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <Text style={styles.headerText}>Reset Password</Text>
          </LinearGradient>

          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {message && (
            <Text style={styles.successText}>{message}</Text>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Lock size={20} color="#9ca3af" />
            </View>
            <TextInput
              style={[styles.input, styles.inputDark]}
              placeholder="New Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Lock size={20} color="#9ca3af" />
            </View>
            <TextInput
              style={[styles.input, styles.inputDark]}
              placeholder="Confirm New Password"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Animated.View style={[animatedStyle, styles.buttonContainer]}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleSubmit}
              disabled={isLoading}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.resetButtonText}>Set New Password</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formContainerDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  headerGradient: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  errorText: {
    color: '#ef4444',
    marginHorizontal: 16,
    marginTop: 16,
    fontSize: 14,
  },
  successText: {
    color: '#10b981',
    marginHorizontal: 16,
    marginTop: 16,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
  },
  iconContainer: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  inputDark: {
    color: '#f9fafb',
    borderColor: '#374151',
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#10b981',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;
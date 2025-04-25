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
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, Cat, User } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signup, error, isLoading } = useAuthStore();
  const navigation = useNavigation();

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
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignUp = async () => {
    if (!validatePassword(password)) {
      setPasswordError("Please Fill The Meter");
      return;
    }

    setPasswordError('');
    try {
      await signup(email, password, name);
      navigation.navigate('VerifyEmail');
    } catch (error) {
      console.log(error);
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
            <Text style={styles.headerText}>Create Account</Text>
          </LinearGradient>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <User size={20} color="#9ca3af" />
            </View>
            <TextInput
              style={[styles.input, styles.inputDark]}
              placeholder="User Name"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Cat size={20} color="#9ca3af" />
            </View>
            <TextInput
              style={[styles.input, styles.inputDark]}
              placeholder="Email Address"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Lock size={20} color="#9ca3af" />
            </View>
            <TextInput
              style={[styles.input, styles.inputDark]}
              placeholder="Enter Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <View style={styles.passwordMeterContainer}>
            <PasswordStrengthMeter password={password} />
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Animated.View style={[animatedStyle, styles.buttonContainer]}>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignUp}
              disabled={isLoading}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={[styles.footerContainer, styles.footerContainerDark]}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              style={styles.loginText}
              onPress={() => navigation.navigate('Login')}
            >
              Login
            </Text>
          </Text>
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
  passwordMeterContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    marginHorizontal: 16,
    marginTop: 8,
    fontSize: 14,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  signupButton: {
    backgroundColor: '#10b981',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  footerContainerDark: {
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  loginText: {
    color: '#10b981',
    fontWeight: '600',
  },
});

export default SignupScreen;
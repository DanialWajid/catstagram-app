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
import { Lock, Cat } from 'lucide-react-native';
import { CommonActions } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigation = useNavigation();

  // Animation values
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

// In LoginScreen.js, modify the navigation calls:
const handleForgotPassword = () => {
  navigation.navigate('ForgotPassword'); // Now this will work directly
};

const handleSignup = () => {
  navigation.navigate('Signup'); // Now this will work directly
};

const handleLogin = async () => {
  try {
    const success = await login(email, password);
    if (success) {
      navigation.navigate('Home');
    }
  } catch (err) {
    console.error('Login error:', err);
    // Consider showing an error to the user
    Alert.alert('Login Failed', err.message || 'Could not log in');
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          <LinearGradient
            colors={['#10b981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <Text style={styles.headerText}>Welcome Back</Text>
          </LinearGradient>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Cat size={20} color="#9ca3af" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Lock size={20} color="#9ca3af" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Animated.View style={[animatedStyle, styles.buttonContainer]}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text
              style={styles.signupText}
              onPress={handleSignup}
            >
              Sign up
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
    borderColor: '#374151',
    backgroundColor: '#1f2937',
  },
  iconContainer: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#f9fafb',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#10b981',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 14,
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#10b981',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
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
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  signupText: {
    color: '#10b981',
    fontWeight: '600',
  },
});

export default LoginScreen;
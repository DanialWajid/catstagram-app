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
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isLoading, forgotPassword, error } = useAuthStore();
  const navigation = useNavigation();

  // Animation values
  const scale = useSharedValue(1);
  const checkmarkScale = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const checkmarkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkmarkScale.value }]
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleSubmit = async () => {
    await forgotPassword(email);
    setIsSubmitted(true);
    checkmarkScale.value = withTiming(1, {
      duration: 500,
      easing: Easing.elastic(1.2),
    });
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
            <Text style={styles.headerText}>Forgot Password</Text>
          </LinearGradient>

          {!isSubmitted ? (
            <>
              <Text style={styles.instructionText}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Mail size={20} color="#9ca3af" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <Animated.View style={[animatedStyle, styles.buttonContainer]}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isLoading || !email}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Animated.View 
                style={[
                  styles.checkmarkContainer,
                  checkmarkAnimatedStyle
                ]}
              >
                <Mail size={32} color="#ffffff" />
              </Animated.View>
              <Text style={styles.successText}>
                If an account exists for {email}, you will receive a password reset link shortly.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <ArrowLeft size={16} color="#10b981" />
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
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
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    color: '#f9fafb',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
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
  submitButton: {
    backgroundColor: '#10b981',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    padding: 24,
  },
  checkmarkContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#f9fafb',
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#10b981',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default ForgotPasswordScreen;
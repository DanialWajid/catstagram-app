import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Mail, ArrowLeft } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useAuthStore } from "../../store/authStore";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Use state for
  const { forgotPassword } = useAuthStore();
  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Validation", "Please enter your email address.");
      return;
    }
    try {
      const result = await forgotPassword(email);
      setIsSubmitted(true);
      Alert.alert(
        "Success",
        result.message || "Check your email for the reset link."
      );
    } catch (err) {
      Alert.alert("Error", err.message || "Something went wrong.");
    }
  };

  return (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.container}>
      <LinearGradient
        colors={["#4c1d95", "#7e22ce", "#6b21a8"]} // Gradient from purple shades
        style={styles.gradientBackground} // Apply the gradient style here
      >
        <View style={styles.innerContainer}>
          {/* Gradient Text Heading using MaskedView */}

          <View style={styles.card}>
            <MaskedView
              style={styles.maskedView}
              maskElement={
                <Text style={styles.headingMask}>Forgot Password</Text>
              }
            >
              <LinearGradient
                colors={["#34D399", "#10B981"]} // from-green-400 to-emerald-500
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </MaskedView>
            {!isSubmitted ? (
              <>
                <Text style={styles.description}>
                  Enter your email address and we'll send you a link to reset
                  your password.
                </Text>
                <View style={styles.inputWrapper}>
                  <Mail color="#ccc" size={20} />
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.submitButton}
                  activeOpacity={0.9}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.centered}>
                <View style={styles.iconCircle}>
                  <Mail color="white" size={32} />
                </View>
                <Text style={styles.description}>
                  If an account exists for {email}, you will receive a password
                  reset link shortly.
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.backLink}
          >
            <ArrowLeft size={16} color="#34D399" />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default ForgotPasswordPage;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%", // Ensure the container takes the full height of the screen
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignSelf: "center",
    flex: 1, // Ensure it takes up the full height
  },
  gradientBackground: {
    flex: 1, // Ensure the gradient covers the entire height
  },
  innerContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center", // Center the content vertically
  },
  maskedView: {
    height: 40,
    marginBottom: 20,
  },
  headingMask: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "black", // This doesn't matter, it's just for the mask
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#34D399",
  },
  description: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d3748",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 10,
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  iconCircle: {
    backgroundColor: "#10B981",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "center",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "rgba(31,41,55,0.2)",
    backgroundColor: "rgba(17,24,39,0.5)",
    alignItems: "center",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#34D399",
    marginLeft: 5,
    fontSize: 14,
  },
});

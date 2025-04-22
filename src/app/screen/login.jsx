import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  async function signInWithEmail() {
    setLoading(true);
    // Simulating login action
    setTimeout(() => {
      Alert.alert("Success", "Logged in successfully!");
      setLoading(false);
    }, 2000);
  }

  async function signUpWithEmail() {
    setLoading(true);
    // Simulating sign-up action
    setTimeout(() => {
      Alert.alert("Success", "Account created successfully!");
      setLoading(false);
    }, 2000);
  }

  async function resetPassword() {
    if (!email) return Alert.alert("Error", "Please enter your email");
    setLoading(true);
    setTimeout(() => {
      Alert.alert("Success", "Password reset instructions sent to your email");
      setLoading(false);
    }, 2000);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4c1d95", "#7e22ce", "#6b21a8"]}
        style={styles.background}
      >
        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            <Ionicons name="moon" size={20} color="#34d399" />
            <View style={styles.toggleCircle} />
          </View>

          <Text style={styles.title}>Welcome Back</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#34d399"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#a1a1aa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#34d399"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#a1a1aa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} // Conditionally hide/show password
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)} // Toggle visibility
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#34d399"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={resetPassword}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={onLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Loading..." : "Login"}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={signUpWithEmail}>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};
export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(30, 27, 75, 0.9)",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    marginLeft: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34d399",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#1e293b",
  },
  eyeIcon: {
    marginLeft: 8,
  },
  forgotPassword: {
    color: "#34d399",
    textAlign: "left",
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#34d399",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  signupText: {
    color: "#cbd5e1",
  },
  signupLink: {
    color: "#34d399",
    fontWeight: "bold",
  },
});

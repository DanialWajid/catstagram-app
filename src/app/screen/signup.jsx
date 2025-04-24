import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
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
import PasswordMeter from "../../components/PasswordStrengthMeter";
import { useAuthStore } from "../../store/authStore";
import { use } from "react";

const Signup = ({ onSignup }) => {
  const navigation = useNavigation();
  const [username, setUsername] = useState(""); // Added username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signup, error, isLoading } = useAuthStore();
  async function handleSignUp() {
    if (!username || !email || !password) {
      return Alert.alert("Error", "Please fill in all fields");
    }

    try {
      setLoading(true);
      const data = await signup(email, password, username);
      if (data.success) {
        navigation.navigate("Verification");
        Alert.alert("Success", data.message);
      } else {
        Alert.alert("Error Occurred", data.message);
      }
      Alert.alert(
        "Success !",
        `Welcome, ${username}! Email Sent successfully!`
      );
      if (onSignup) onSignup();
    } catch (err) {
      console.error("Signup error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const goToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4c1d95", "#7e22ce", "#6b21a8"]}
        style={styles.background}
      >
        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            <Ionicons name="sunny" size={20} color="#34d399" />
            <View style={styles.toggleCircle} />
          </View>

          <Text style={styles.title}>Create Account</Text>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#34d399"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#a1a1aa"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
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

          {/* Password */}
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
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#34d399"
              />
            </TouchableOpacity>
          </View>

          {/* Password Strength Meter */}
          <View style={{ marginBottom: 16 }}>
            <PasswordMeter password={password} />
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isLoading}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Already have an account? </Text>
            <TouchableOpacity onPress={goToLogin}>
              <Text style={styles.signupLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Signup;

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

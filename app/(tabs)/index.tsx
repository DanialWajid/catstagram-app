import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  return (
    <LinearGradient colors={["#2a0845", "#6441a5"]} style={styles.container}>
      <SafeAreaView style={styles.loginCard}>
        <View style={styles.toggleRow}>
          <Ionicons name="moon" size={20} color="white" />
          <Switch
            value={darkMode}
            onValueChange={() => setDarkMode(!darkMode)}
          />
        </View>

        <Text style={styles.title}>Welcome Back</Text>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-circle"
            size={20}
            color="green"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="danialwajid112@gmail.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed"
            size={20}
            color="green"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={{ color: "limegreen" }}>Sign up</Text>
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  loginCard: {
    margin: 20,
    backgroundColor: "#2e1b47",
    borderRadius: 15,
    padding: 25,
    elevation: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: "limegreen",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 45,
    color: "#000",
  },
  forgotText: {
    color: "limegreen",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "limegreen",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
  },
  signupText: {
    color: "#ccc",
    textAlign: "center",
  },
});

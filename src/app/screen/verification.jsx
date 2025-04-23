import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // If using Expo

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleSubmit = () => {
    const verificationCode = code.join("");
    if (verificationCode.length === 6) {
      setTimeout(() => {
        Alert.alert("Email verified successfully");
      }, 1000);
    } else {
      Alert.alert("Please enter a valid 6-digit code.");
    }
  };

  return (
    <LinearGradient
      colors={["#4c1d95", "#7e22ce", "#6b21a8"]}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.instruction}>
          Enter the 6-digit code sent to your email address.
        </Text>

        <View style={styles.inputContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              style={styles.input}
              maxLength={1}
              keyboardType="numeric"
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.customButton,
            {
              backgroundColor: code.every((digit) => digit)
                ? "#34d399"
                : "#1e1e2f",
            },
          ]}
          onPress={handleSubmit}
          disabled={code.some((digit) => !digit)}
        >
          <Text
            style={[
              styles.buttonText,
              { color: code.every((digit) => digit) ? "#1e1e2f" : "#34d399" },
            ]}
          >
            Verify Email
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1e1e2f",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#34d399",
    textAlign: "center",
    marginBottom: 16,
  },
  instruction: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  input: {
    width: 40,
    height: 50,
    backgroundColor: "#333",
    color: "#34d399",
    textAlign: "center",
    fontSize: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#34d399",
  },
  customButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EmailVerificationPage;

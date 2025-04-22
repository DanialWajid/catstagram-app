import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const PasswordStrengthMeter = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    calculateStrength(password);
  }, [password]);

  const calculateStrength = (password) => {
    let strengthScore = 0;
    let strengthMessage = "";

    if (!password) {
      setStrength(0);
      setMessage("");
      return;
    }

    // Length check
    if (password.length >= 8) {
      strengthScore += 1;
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strengthScore += 1;
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      strengthScore += 1;
    }

    // Number check
    if (/\d/.test(password)) {
      strengthScore += 1;
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strengthScore += 1;
    }

    // Set message based on strength
    switch (strengthScore) {
      case 0:
        strengthMessage = "Very Weak";
        break;
      case 1:
        strengthMessage = "Weak";
        break;
      case 2:
        strengthMessage = "Fair";
        break;
      case 3:
        strengthMessage = "Good";
        break;
      case 4:
        strengthMessage = "Strong";
        break;
      case 5:
        strengthMessage = "Very Strong";
        break;
      default:
        strengthMessage = "";
    }

    setStrength(strengthScore);
    setMessage(strengthMessage);
  };

  // Get color based on strength
  const getColor = (index) => {
    if (!password) return "#e5e7eb"; // Gray for empty

    if (index <= strength) {
      switch (strength) {
        case 1:
          return "#ef4444"; // Red for weak
        case 2:
          return "#f97316"; // Orange for fair
        case 3:
          return "#eab308"; // Yellow for good
        case 4:
          return "#22c55e"; // Green for strong
        case 5:
          return "#10b981"; // Emerald for very strong
        default:
          return "#e5e7eb";
      }
    }

    return "#e5e7eb"; // Gray for unfilled
  };

  return (
    <View style={styles.container}>
      <View style={styles.meterContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[styles.meterSegment, { backgroundColor: getColor(index) }]}
          />
        ))}
      </View>
      {password && <Text style={styles.strengthText}>{message}</Text>}
      <Text style={styles.requirementsText}>
        Password must contain at least 8 characters, including uppercase,
        lowercase, number and special character.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  meterContainer: {
    flexDirection: "row",
    height: 8,
    marginBottom: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  meterSegment: {
    flex: 1,
    height: "100%",
    marginHorizontal: 2,
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 14,
    color: "#d1d5db",
    marginBottom: 4,
  },
  requirementsText: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

export default PasswordStrengthMeter;

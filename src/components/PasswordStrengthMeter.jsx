import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, X } from "lucide-react-native";

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <View style={styles.criteriaContainer}>
      {criteria.map((item) => (
        <View key={item.label} style={styles.criteriaItem}>
          {item.met ? (
            <Check size={16} color="#22c55e" style={styles.icon} />
          ) : (
            <X size={16} color="#9ca3af" style={styles.icon} />
          )}
          <Text
            style={[
              styles.criteriaText,
              { color: item.met ? "#22c55e" : "#9ca3af" },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const getColor = (strength) => {
    if (strength === 0) return "#ef4444"; // red-500
    if (strength === 1) return "#f87171"; // red-400
    if (strength === 2) return "#facc15"; // yellow-500
    if (strength === 3) return "#fde047"; // yellow-400
    return "#22c55e"; // green-500
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  return (
    <View style={{ marginTop: 8 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Password strength</Text>
        <Text style={styles.headerText}>{getStrengthText(strength)}</Text>
      </View>

      <View style={styles.barContainer}>
        {[...Array(4)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor:
                  index < strength ? getColor(strength) : "#4b5563",
              }, // gray-600
            ]}
          />
        ))}
      </View>

      <PasswordCriteria password={password} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerText: {
    fontSize: 12,
    color: "#9ca3af", // gray-400
  },
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bar: {
    height: 6,
    flex: 1,
    borderRadius: 50,
    marginHorizontal: 2,
  },
  criteriaContainer: {
    marginTop: 8,
  },
  criteriaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  icon: {
    marginRight: 6,
  },
  criteriaText: {
    fontSize: 12,
  },
});

export default PasswordStrengthMeter;

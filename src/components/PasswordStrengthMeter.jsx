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
            <Check color="#10B981" size={16} />
          ) : (
            <X color="#9CA3AF" size={16} />
          )}
          <Text
            style={[
              styles.criteriaText,
              { color: item.met ? "#10B981" : "#9CA3AF" },
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
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z\d]/.test(pass)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const getStrengthText = (strength) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const getStrengthColor = (strength) => {
    return ["#DC2626", "#F87171", "#FBBF24", "#FACC15", "#10B981"][strength];
  };

  return (
    <View>
      <View style={styles.strengthHeader}>
        <Text style={styles.strengthLabel}>Password strength</Text>
        <Text style={styles.strengthText}>{getStrengthText(strength)}</Text>
      </View>

      <View style={styles.strengthBar}>
        {[...Array(4)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.strengthSegment,
              {
                backgroundColor:
                  index < strength ? getStrengthColor(strength) : "#374151",
              },
            ]}
          />
        ))}
      </View>

      <PasswordCriteria password={password} />
    </View>
  );
};

const styles = StyleSheet.create({
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  strengthLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  strengthText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  strengthBar: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 8,
  },
  criteriaContainer: {
    marginTop: 8,
    gap: 4,
  },
  criteriaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  criteriaText: {
    fontSize: 12,
  },
});

export default PasswordStrengthMeter;

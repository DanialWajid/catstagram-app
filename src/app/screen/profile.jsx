import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { User as UserIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SideNav from "../../components/SideNav";

export default function Profile() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState({});

  // Get system color scheme
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Fetching user data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userName = await AsyncStorage.getItem("userinfo");
        const userEmail = await AsyncStorage.getItem("userEmail");
        if (userName && userEmail) {
          setProfile({ name: userName, email: userEmail });
        }
      } catch (error) {
        console.error("Error fetching user data from AsyncStorage:", error);
      }
    };
    fetchUserData();
  }, []);

  // Apply theme-based styling
  const themeStyles = {
    container: {
      backgroundColor: isDarkMode ? "#1F2937" : "#f5f5f5",
    },
    profileCard: {
      backgroundColor: isDarkMode ? "#374151" : "#FFFFFF",
    },
    text: {
      color: isDarkMode ? "#FFFFFF" : "#000000",
    },
    secondaryText: {
      color: isDarkMode ? "#9CA3AF" : "#666666",
    },
  };

  return (
    <View style={[styles.container, themeStyles.container]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={[styles.profileCard, themeStyles.profileCard]}>
          <View style={styles.profileHeader}>
            {/* Profile Image */}
            <View style={styles.profileImageWrapper}>
              <UserIcon size={64} color={isDarkMode ? "#9CA3AF" : "gray"} />
            </View>

            {/* Profile Details */}
            <View style={styles.profileDetails}>
              <Text style={[styles.name, themeStyles.text]}>
                {profile.name || "Catstagram User"}
              </Text>
              <Text style={[styles.email, themeStyles.secondaryText]}>
                {profile.email || "user@example.com"}
              </Text>
            </View>
          </View>

          {/* Profile Owner Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => {}}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteButton]}>
              <Text style={styles.buttonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Place the SideNav at the bottom */}
      <SideNav style={styles.sideNav} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 80, // Space for the bottom nav
  },
  profileCard: {
    borderRadius: 10,
    padding: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 20,
  },
  profileDetails: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  buttonsContainer: {
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#3b82f6",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  sideNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

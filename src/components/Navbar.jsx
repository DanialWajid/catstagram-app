"use client";

import { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  LogOut,
  Users,
  Menu as HamburgerIcon,
  X as CloseIcon,
  UserPlus,
} from "lucide-react-native";

// Import logo - you'll need to adjust this based on your React Native project structure
const logo = require("../assets/images/logo.jpg");

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation();

  const handleLogout = () => {
    // Implement your logout logic here
    // For example:
    // logout();
    navigation.navigate("Login");
  };

  // Toggle menu handler
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        {/* Logo and Title */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => navigation.navigate("Home")}
        >
          <Image source={logo} style={styles.logo} />
          <Text style={styles.title}>Catstagram</Text>
        </TouchableOpacity>

        {/* Menu Toggle Button */}
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          {isMenuOpen ? (
            <CloseIcon width={24} height={24} color="#FFFFFF" />
          ) : (
            <HamburgerIcon width={24} height={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Menu (Dropdown) */}
      {isMenuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("Friends");
              toggleMenu();
            }}
          >
            <Users
              width={20}
              height={20}
              color="#FFFFFF"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>My Friends</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              navigation.navigate("FriendRequests");
              toggleMenu();
            }}
          >
            <UserPlus
              width={20}
              height={20}
              color="#FFFFFF"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Friend Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleLogout();
              toggleMenu();
            }}
          >
            <LogOut
              width={20}
              height={20}
              color="#FFFFFF"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000000", // Black background for the navbar
    borderBottomWidth: 1,
    borderBottomColor: "#6B7280",
    zIndex: 10,
  },
  navbar: {
    height: 80,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#000000", // Black background for navbar
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    marginLeft: 8,
    color: "#FFFFFF", // White text color
    fontFamily: "Billabong", // Custom font, ensure it's added to your project
  },
  menuButton: {
    padding: 8,
  },
  menu: {
    width: "100%",
    backgroundColor: "#000000", // Black background for dropdown
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#6B7280",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginVertical: 4,
    backgroundColor: "#000000", // Black background for each item
  },
  menuIcon: {
    marginRight: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF", // White text color for menu items
  },
});

export default Navbar;

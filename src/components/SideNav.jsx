import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { Home, Bookmark, Compass, User, PlusCircle } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const SideNav = () => {
  const navigation = useNavigation();

  const mockUser = {
    _id: "12345",
    name: "John Doe",
    profileImage: "https://i.pravatar.cc/300",
  };

  const navItems = [
    {
      icon: <Home color="#fff" size={24} />,
      screen: "Home",
    },
    {
      icon: <Compass color="#fff" size={24} />,
      screen: "ExploreFriends",
    },
    {
      icon: <PlusCircle color="#fff" size={30} />,
      screen: "CreatePost",
      isSpecial: true,
    },
    {
      icon: <Bookmark color="#fff" size={24} />,
      screen: "SavedPosts",
    },
    {
      icon: (
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile", { id: mockUser._id })}
        >
          <Image
            source={{ uri: mockUser.profileImage }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      ),
      screen: "Profile",
    },
  ];

  return (
    <View style={[styles.container]}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.navItem,
            item.isSpecial ? styles.specialButtonContainer : null,
          ]}
          onPress={() => navigation.navigate(item.screen, { id: mockUser._id })}
        >
          <View
            style={[styles.icon, item.isSpecial ? styles.glowEffect : null]}
          >
            {item.icon}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#000", // Black background
    borderTopWidth: 1,
    borderTopColor: "#333", // Slight gray border to match black bg
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  icon: {
    marginBottom: 2,
  },
  specialButtonContainer: {
    backgroundColor: "#9333EA", // Purple background for the Create button
    borderRadius: 50,
    padding: 14,
    marginTop: -30,
    ...Platform.select({
      ios: {
        shadowColor: "#9333EA",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  glowEffect: {
    backgroundColor: "#9333EA", // Glowing purple effect for special button
    borderRadius: 50,
    padding: 12,
    shadowColor: "#c084fc", // Light purple glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    transform: [{ scale: 1.1 }],
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E9D5FF", // Light purple border around profile pic
  },
});

export default SideNav;

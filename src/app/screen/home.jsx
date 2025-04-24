import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getUserInfo } from "../../store/AccStore"; // adjust path
import { useAuthStore } from "../../store/authStore"; // adjust path
import SideNav from "../../components/SideNav"; // adjust path
import Navbar from "../../components/Navbar"; // adjust path

const Home = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const { logout } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUserInfo();
      setUserInfo(user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  return (
    <View style={styles.main}>
      <Navbar />
      <View style={styles.container}>
        <Text style={styles.title}>Home Screen</Text>

        {userInfo ? (
          <Text style={styles.subtitle}>
            Welcome, {userInfo.name || userInfo.email}!
          </Text>
        ) : (
          <Text style={styles.subtitle}>Loading user info...</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <SideNav user={userInfo} />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: "#666",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#DC3545",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Home;

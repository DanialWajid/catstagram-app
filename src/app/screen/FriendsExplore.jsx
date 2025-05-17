import React, { useState, useEffect } from "react";
import SideNav from "../../components/SideNav";
import * as SecureStore from "expo-secure-store";
import Navbar from "../../components/Navbar";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import UserCard from "../../components/UserCard";
import { Search } from "lucide-react-native";

const FriendsExplore = () => {
  const [potentialFriends, setPotentialFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = "http://192.168.0.123:8000";

  useEffect(() => {
    fetchPotentialFriends();
  }, []);

  const fetchPotentialFriends = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await axios.get(`${API_URL}/api/friends/potential`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPotentialFriends(response.data);
    } catch (error) {
      console.error("Error fetching potential friends:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPotentialFriends();
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
  };

  const filteredFriends = potentialFriends.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderFriendItem = ({ item }) => (
    <UserCard
      key={item._id}
      cardUser={item}
      isPrivate={item.isPrivate}
      isFriend={false}
      onFriendUpdate={fetchPotentialFriends}
    />
  );

  return (
    <View style={styles.container}>
      <Navbar />
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor="#9ca3af"
          value={searchTerm}
          onChangeText={handleSearchChange}
        />
      </View>

      {/* Friends List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a78bfa" />
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchTerm
                  ? "No friends match your search."
                  : "No potential friends found."}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#a78bfa"]}
              tintColor="#a78bfa"
              progressBackgroundColor="#1f2937"
            />
          }
        />
      )}
      <SideNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    paddingBottom: 70,
  },
  headerGradient: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  searchContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    backgroundColor: "#1f2937",
    borderColor: "#374151",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export default FriendsExplore;

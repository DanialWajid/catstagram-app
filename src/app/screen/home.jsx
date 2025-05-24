import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import SideNav from "../../components/SideNav";
import Navbar from "../../components/Navbar";
import PostCard from "../../components/PostCard";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
// Import the icon library
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Home = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const API_URL = "http://192.168.0.107:8000/api";
  const LIMIT = 5;

  // Initial load
  useEffect(() => {
    fetchInitialPosts();
  }, []);

  // Refresh posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Home screen focused - refreshing posts");
      fetchInitialPosts();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  // Separate function for initial/refresh posts to ensure clean state
  const fetchInitialPosts = async () => {
    try {
      setLoading(true);

      // Force cache bypass with timestamp
      const timestamp = new Date().getTime();
      const response = await axios.get(
        `${API_URL}/posts/${user._id}?page=1&limit=${LIMIT}&search=${searchQuery}&_t=${timestamp}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      const newPosts = response.data.data;

      console.log(`Fetched ${newPosts.length} posts on refresh`);

      setPosts(newPosts);
      setPage(2); // Reset to page 2 for next load

      setHasMore(newPosts.length >= LIMIT);
    } catch (error) {
      console.error("Error fetching initial posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to load more posts when scrolling
  const fetchMorePosts = async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/posts/${user._id}?page=${page}&limit=${LIMIT}&search=${searchQuery}`
      );

      const newPosts = response.data.data;

      console.log(`Fetched ${newPosts.length} more posts when scrolling`);

      if (newPosts.length < LIMIT) {
        setHasMore(false);
      }

      setPosts((prevPosts) => {
        // Get existing post IDs
        const existingIds = new Set(prevPosts.map((post) => post._id));

        // Filter out any new posts that already exist
        const uniqueNewPosts = newPosts.filter(
          (post) => !existingIds.has(post._id)
        );

        return [...prevPosts, ...uniqueNewPosts];
      });

      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchLoading(true);
    fetchInitialPosts();
  };

  const handleRefresh = async () => {
    console.log("Pull-to-refresh triggered");
    setRefreshing(true);
    await fetchInitialPosts();
  };

  // Navigate to chat screen
  const navigateToChat = () => {
    navigation.navigate("chat");
  };

  // Create a truly unique key for each post
  const getUniqueKey = (item, index) => {
    if (item._id) {
      return `post-${item._id}`;
    }
    // If no _id, use a combination of index and timestamp to ensure uniqueness
    return `post-${index}-${Date.now()}`;
  };

  const renderPostItem = ({ item }) => <PostCard post={item} user={user} />;

  return (
    <View style={styles.container}>
      <Navbar />

      {/* 🔍 Search Bar */}
      {/* <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          {searchLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View> */}

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={getUniqueKey}
        contentContainerStyle={styles.listContainer}
        onEndReached={fetchMorePosts}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#a78bfa"]}
            tintColor="#a78bfa"
          />
        }
        ListFooterComponent={
          loading &&
          !refreshing && <ActivityIndicator size="small" color="#a78bfa" />
        }
        ListEmptyComponent={
          !loading &&
          !searchLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No posts found. Be the first to create a post!
              </Text>
            </View>
          )
        }
      />

      {/* Floating Chat Button with Vector Icon */}
      <TouchableOpacity style={styles.chatButton} onPress={navigateToChat}>
        <MaterialCommunityIcons name="chat" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.sideNavWrapper}>
        <SideNav />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  listContainer: {
    paddingBottom: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#1f2937",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#374151",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    color: "#f9fafb",
  },
  searchButton: {
    backgroundColor: "#6366f1",
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#f9fafb",
  },
  sideNavWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  // Updated floating chat button styles - square with rounded corners
  chatButton: {
    position: "absolute",
    right: 20,
    bottom: 120, // Positioned higher from the bottom
    backgroundColor: "#9333EA", // Black background
    width: 56,
    height: 56,
    borderRadius: 16, // Rounded corners but not circular
    justifyContent: "center",
    alignItems: "center",
    elevation: 8, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderWidth: 0, // Remove border
  },
});

export default Home;

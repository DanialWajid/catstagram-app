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
import { useNavigation } from "@react-navigation/native";
import { MessageCircle } from "lucide-react-native";
import { useAuthStore } from "../../store/authStore";
import SideNav from "../../components/SideNav";
import Navbar from "../../components/Navbar";
import PostCard from "../../components/PostCard";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../../store/themeContext";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const API_URL = "http://192.168.0.109:8000/api";
  const LIMIT = 5;

  // Initial load
  useEffect(() => {
    fetchInitialPosts();
    // eslint-disable-next-line
  }, []);

  // Refresh posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchInitialPosts();
      return () => {};
      // eslint-disable-next-line
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

      setPosts(newPosts);
      setPage(2); // Reset to page 2 for next load

      setHasMore(newPosts.length >= LIMIT);
    } catch (error) {
      console.error("Error fetching initial posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSearchLoading(false);
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
    setRefreshing(true);
    await fetchInitialPosts();
  };

  const handleChatPress = () => {
    navigation.navigate("ChatPage");
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Navbar />

      {/* 🔍 Search Bar */}
      <View
        style={[styles.searchBarContainer, { backgroundColor: theme.card }]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.input,
              color: theme.inputText,
              borderColor: theme.border,
            },
          ]}
          placeholder="Search posts..."
          placeholderTextColor={theme.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.accent }]}
          onPress={handleSearch}
        >
          {searchLoading ? (
            <ActivityIndicator size="small" color={theme.buttonText} />
          ) : (
            <Text
              style={[styles.searchButtonText, { color: theme.buttonText }]}
            >
              Search
            </Text>
          )}
        </TouchableOpacity>
      </View>

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
            colors={[theme.accent]}
            tintColor={theme.accent}
          />
        }
        ListFooterComponent={
          loading &&
          !refreshing && <ActivityIndicator size="small" color={theme.accent} />
        }
        ListEmptyComponent={
          !loading &&
          !searchLoading && (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No posts found. Be the first to create a post!
              </Text>
            </View>
          )
        }
      />

      {/* Floating Chat Button */}
      <TouchableOpacity
        style={[
          styles.chatButton,
          {
            backgroundColor: theme.accent,
            shadowColor: theme.accent,
          },
        ]}
        onPress={handleChatPress}
        activeOpacity={0.8}
      >
        <MessageCircle width={24} height={24} color={theme.buttonText} />
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
  },
  listContainer: {
    paddingBottom: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#374151",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchButton: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  sideNavWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  chatButton: {
    position: "absolute",
    bottom: 100, // Clear of the bottom navigation
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8, // Android shadow
    shadowOffset: { width: 0, height: 4 }, // iOS shadow
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
});

export default Home;

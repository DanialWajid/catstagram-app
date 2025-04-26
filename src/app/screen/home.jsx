import React, { useEffect, useState } from "react";
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

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false); // Separate loading state for search
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const API_URL = "http://192.168.100.165:8000/api";
  const LIMIT = 5;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (query = "") => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/posts/${user._id}?page=${page}&limit=${LIMIT}&search=${query}`
      );

      const newPosts = response.data.data;

      if (newPosts.length < LIMIT) {
        setHasMore(false);
      }

      setPosts((prevPosts) => (page === 1 ? newPosts : [...prevPosts, ...newPosts]));
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setHasMore(true);
    setSearchLoading(true); // Only set search loading to true
    fetchPosts(searchQuery);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setPage(1);
      setHasMore(true);
      await fetchPosts(searchQuery);
    } finally {
      setRefreshing(false);
    }
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
        keyExtractor={(item, index) => item._id?.toString() || index.toString()}
        contentContainerStyle={styles.listContainer}
        onEndReached={() => fetchPosts(searchQuery)}
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
          loading && <ActivityIndicator size="small" color="#a78bfa" />
        }
        ListEmptyComponent={
          !loading && !searchLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No posts found. Be the first to create a post!
              </Text>
            </View>
          )
        }
      />

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
});

export default Home;
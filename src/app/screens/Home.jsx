import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import PostCard from '../../components/PostCard';
import CreatePostForm from '../../components/CreatePostForm';
import { useAuthStore } from '../../store/authStore';
import { Plus, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { user } = useAuthStore();

  const API_URL = "http://192.168.100.165:8000/api";

  useEffect(() => {
      fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log("Fetching posts for user:", user._id);
      const response = await axios.get(`${API_URL}/posts/${user._id}`);
      console.log("API Response:", response);
      console.log("Response data:", response.data);
      console.log("Is array?", Array.isArray(response.data));
      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
  };

  const renderPostItem = ({ item }) => (
    <PostCard post={item} user={user} />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#4c1d95', '#7c3aed', '#4c1d95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerText}>
          Welcome to Catstagram
        </Text>
        <Text style={styles.headerSubtext}>
          Share your favorite cat moments
        </Text>
      </LinearGradient>

      {showCreatePost && (
        <View style={styles.createPostContainer}>
          <CreatePostForm onPostCreated={handlePostCreated} />
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowCreatePost(!showCreatePost)}
        >
          <Plus size={20} color="#f9fafb" />
          <Text style={styles.actionButtonText}>
            {showCreatePost ? 'Hide Form' : 'Create Post'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onRefresh}
        >
          <RefreshCw size={20} color="#f9fafb" />
          <Text style={styles.actionButtonText}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed']}
            tintColor="#a78bfa"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No posts found. Be the first to create a post!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  headerContainer: {
    padding: 16,
  },
  headerGradient: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#f9fafb',
  },
  headerSubtext: {
    fontSize: 16,
    color: '#e5e7eb',
  },
  createPostContainer: {
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#f9fafb',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#f9fafb',
  },
});

export default Home;
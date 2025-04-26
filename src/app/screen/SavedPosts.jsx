import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Navbar from '../../components/Navbar';
import SideNav from '../../components/SideNav';
import { getSavedPosts } from '../../services/savedPosts.services';
import PostCard from '../../components/PostCard';
import { Grid, List, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const {user} = useAuthStore();

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const posts = await getSavedPosts(user._id);
      setSavedPosts(posts);
    } catch (error) {
      console.error("Error fetching saved posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, [user._id]);

  const handleUnsavePost = (postId) => {
    setSavedPosts((prevPosts) =>
      prevPosts.filter((post) => post._id !== postId)
    );
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text.toLowerCase());
  };

  const filteredPosts = savedPosts.filter(
    (post) =>
      post.user.name?.toLowerCase().includes(searchTerm) ||
      post.caption?.toLowerCase().includes(searchTerm)
  );

  const renderItem = ({ item }) => (
    <PostCard
      post={item}
      user={user}
      onUnsave={handleUnsavePost}
      viewMode={viewMode}
    />
  );

  return (
    <View style={[styles.container, styles.containerDark]}>
      <Navbar/>
      <View style={[styles.searchContainer, styles.searchContainerDark]}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, styles.inputDark]}
          placeholder="Search saved posts by title or caption..."
          placeholderTextColor="#9ca3af"
          value={searchTerm}
          onChangeText={handleSearchChange}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a78bfa" />
        </View>
      ) : filteredPosts.length > 0 ? (
        <FlatList
          data={filteredPosts}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContainer,
            viewMode === 'grid' ? styles.gridContainer : styles.listViewContainer
          ]}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No Saved Posts Found.
          </Text>
        </View>
      )}
      <View style={styles.sideNavWrapper}>
      <SideNav />
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 70,
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  headerGradient: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchContainerDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  inputDark: {
    color: '#f9fafb',
  },
  sideNavWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectedButtonDark: {
    backgroundColor: '#7c3aed',
  },
  unselectedButtonDark: {
    backgroundColor: '#374151',
  },
  viewModeText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  selectedText: {
    color: '#ffffff',
  },
  unselectedTextDark: {
    color: '#a78bfa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listViewContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default SavedPosts;
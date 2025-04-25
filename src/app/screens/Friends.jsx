import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import UserCard from '../../components/UserCard';
import { useAuthStore } from '../../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const API_URL = "http://192.168.100.165:8000";

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    }
  }, [activeTab]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/friends/list`);
      setFriends(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setLoading(false);
    }
  };

  const renderFriendItem = ({ item }) => (
    <UserCard 
      key={item._id} 
      isPrivate={false} 
      user={item} 
      isFriend={true}
      onFriendUpdate={fetchFriends}
    />
  );

  return (
    <View style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'friends' ? styles.activeTab : styles.inactiveTab
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'friends' ? styles.activeTabText : styles.inactiveTabText
          ]}>
            My Friends
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'requests' ? styles.activeTab : styles.inactiveTab
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'requests' ? styles.activeTabText : styles.inactiveTabText
          ]}>
            Friend Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a78bfa" />
          </View>
        ) : activeTab === 'friends' ? (
          friends.length > 0 ? (
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No friends found</Text>
            </View>
          )
        ) : (
          <View style={styles.requestsContainer}>
            <LinearGradient
              colors={['#4c1d95', '#7c3aed', '#4c1d95']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.requestsGradient}
            >
              <Text style={styles.requestsText}>
                Click on the "Friend Requests" tab to manage requests
              </Text>
            </LinearGradient>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#7c3aed',
  },
  inactiveTab: {
    backgroundColor: '#4b5563',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 16,
  },
  activeTabText: {
    color: '#ffffff',
  },
  inactiveTabText: {
    color: '#e5e7eb',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  requestsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  requestsGradient: {
    padding: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  requestsText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: '#f9fafb',
  },
});

export default Friends;
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Pressable,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { User, X } from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FriendsListModal = ({ isOpen, onClose, userId }) => {
  const [mutualFriends, setMutualFriends] = useState([]);
  const [otherFriends, setOtherFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigation = useNavigation();
  
  const API_URL = "http://192.168.100.165:8000/";

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
    }
  }, [isOpen, userId]);

  const fetchFriends = async () => {
    try {
      setLoading(true);

      // Fetch profile's friends
      const profileFriendsResponse = await axios.get(
        `${API_URL}api/friends/list/${userId}`
      );

      const profileFriends = Array.isArray(profileFriendsResponse.data)
        ? profileFriendsResponse.data
        : profileFriendsResponse.data.friends || [];

      // Only fetch mutual friends if viewing someone else's profile
      if (userId !== user._id) {
        const myFriendsResponse = await axios.get(
          `${API_URL}api/friends/list/${user._id}`
        );

        const myFriends = Array.isArray(myFriendsResponse.data)
          ? myFriendsResponse.data
          : myFriendsResponse.data?.friends || [];

        // Calculate mutual friends
        const mutual = profileFriends.filter((profileFriend) =>
          myFriends.some((myFriend) => myFriend._id === profileFriend._id)
        );

        // Calculate other friends
        const others = profileFriends.filter(
          (profileFriend) =>
            !myFriends.some((myFriend) => myFriend._id === profileFriend._id)
        );

        setMutualFriends(mutual);
        setOtherFriends(others);
      } else {
        // If viewing own profile, all friends go to otherFriends
        setMutualFriends([]);
        setOtherFriends(profileFriends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      setMutualFriends([]);
      setOtherFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const renderFriendCard = ({ item }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => {
        onClose();
        navigation.navigate('Profile', { userId: item._id });
      }}
    >
      {item.profileImage ? (
        <FastImage
          source={{ uri: item.profileImage }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarFallback}>
          <User size={32} color="#9ca3af" />
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>
          {item.name}
        </Text>
        <Text style={styles.friendEmail}>
          {item.email}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Friends List
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#60a5fa" />
            </View>
          ) : (
            <View style={styles.friendsContainer}>
              {/* Mutual Friends Section - Only show if not viewing own profile */}
              {userId !== user._id && mutualFriends.length > 0 && (
                <View style={styles.friendsSection}>
                  <Text style={styles.sectionTitle}>
                    Mutual Friends ({mutualFriends.length})
                  </Text>
                  <FlatList
                    data={mutualFriends}
                    renderItem={renderFriendCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.friendsList}
                  />
                </View>
              )}

              {/* Other Friends Section */}
              {otherFriends.length > 0 && (
                <View style={styles.friendsSection}>
                  <Text style={styles.sectionTitle}>
                    {userId === user._id ? "All Friends" : "Other Friends"} ({otherFriends.length})
                  </Text>
                  <FlatList
                    data={otherFriends}
                    renderItem={renderFriendCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.friendsList}
                  />
                </View>
              )}

              {mutualFriends.length === 0 && otherFriends.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No friends to display
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#1f2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsContainer: {
    flex: 1,
  },
  friendsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
    color: '#f9fafb',
  },
  friendsList: {
    paddingHorizontal: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#374151',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b5563',
  },
  friendInfo: {
    marginLeft: 12,
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  friendEmail: {
    fontSize: 14,
    color: '#9ca3af',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default FriendsListModal;
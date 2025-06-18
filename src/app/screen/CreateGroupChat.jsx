import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { User, Users, Check, X, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const CreateGroupChat = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuthStore();
  const navigation = useNavigation();

  const API_URL = "http://192.168.0.111:8000/api";

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      setLoading(true);

      const response = await axios.get(`${API_URL}/friends/list/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let friendsList = [];
      if (Array.isArray(response.data)) {
        friendsList = response.data;
      } else if (response.data?.friends) {
        friendsList = response.data.friends;
      } else if (response.data?.data) {
        friendsList = response.data.data;
      }

      setFriends(friendsList.filter((friend) => friend._id !== user._id));
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert("Error", "Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friend) => {
    setSelectedFriends((prev) => {
      const isSelected = prev.find((f) => f._id === friend._id);
      if (isSelected) {
        return prev.filter((f) => f._id !== friend._id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedFriends.length < 2) {
      Alert.alert(
        "Error",
        "Please select at least 2 friends to create a group"
      );
      return;
    }

    try {
      setCreating(true);
      const token = await SecureStore.getItemAsync("token");

      const userIds = selectedFriends.map((friend) => friend._id);

      const response = await axios.post(
        `${API_URL}/chat/group`,
        {
          name: groupName.trim(),
          users: JSON.stringify(userIds),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const createdGroup = response.data;

      Alert.alert("Success", "Group created successfully!", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("ChatMessage", {
              chatId: createdGroup._id,
              chatData: createdGroup,
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const renderFriendItem = ({ item }) => {
    const isSelected = selectedFriends.find((f) => f._id === item._id);

    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.selectedFriendItem]}
        onPress={() => toggleFriendSelection(item)}
      >
        <View style={styles.friendContent}>
          {item.profileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <User size={24} color="#9ca3af" />
            </View>
          )}

          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.name}</Text>
            <Text style={styles.friendEmail}>{item.email}</Text>
          </View>

          <View style={styles.selectionIndicator}>
            {isSelected ? (
              <View style={styles.selectedIcon}>
                <Check size={16} color="#ffffff" />
              </View>
            ) : (
              <View style={styles.unselectedIcon} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedFriend = ({ item }) => (
    <View style={styles.selectedFriendChip}>
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.chipAvatar} />
      ) : (
        <View style={styles.chipAvatarFallback}>
          <User size={12} color="#9ca3af" />
        </View>
      )}
      <Text style={styles.chipName}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => toggleFriendSelection(item)}
        style={styles.removeChip}
      >
        <X size={14} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <TouchableOpacity
          style={[
            styles.createButton,
            groupName.trim() && selectedFriends.length >= 2
              ? styles.createButtonActive
              : styles.createButtonInactive,
          ]}
          onPress={createGroup}
          disabled={!groupName.trim() || selectedFriends.length < 2 || creating}
        >
          {creating ? (
            <ActivityIndicator size={16} color="#ffffff" />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Group Name Input */}
      <View style={styles.groupNameSection}>
        <View style={styles.groupIconContainer}>
          <Users size={24} color="#9333EA" />
        </View>
        <TextInput
          style={styles.groupNameInput}
          placeholder="Group name"
          placeholderTextColor="#9ca3af"
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
        />
      </View>

      {/* Selected Friends */}
      {selectedFriends.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>
            Selected ({selectedFriends.length})
          </Text>
          <FlatList
            data={selectedFriends}
            renderItem={renderSelectedFriend}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedList}
          />
        </View>
      )}

      {/* Friends List */}
      <View style={styles.friendsSection}>
        <Text style={styles.sectionTitle}>
          Choose friends ({friends.length})
        </Text>
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.friendsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Users size={64} color="#6b7280" />
              <Text style={styles.emptyTitle}>No friends found</Text>
              <Text style={styles.emptySubtitle}>
                Add some friends to create a group chat
              </Text>
            </View>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9ca3af",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    backgroundColor: "#1f2937",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#f9fafb",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f9fafb",
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonActive: {
    backgroundColor: "#9333EA",
  },
  createButtonInactive: {
    backgroundColor: "#374151",
  },
  createButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  groupNameSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    backgroundColor: "#1f2937",
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e1b4b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#9333EA",
  },
  groupNameInput: {
    flex: 1,
    fontSize: 18,
    color: "#f9fafb",
    fontWeight: "600",
  },
  selectedSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    backgroundColor: "#1f2937",
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f9fafb",
    marginBottom: 12,
  },
  selectedList: {
    paddingRight: 16,
  },
  selectedFriendChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  chipAvatarFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4b5563",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  chipName: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  removeChip: {
    padding: 2,
  },
  friendsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f9fafb",
    marginBottom: 16,
  },
  friendsList: {
    flexGrow: 1,
  },
  friendItem: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  selectedFriendItem: {
    borderColor: "#9333EA",
    backgroundColor: "#1e1b4b",
  },
  friendContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f9fafb",
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 14,
    color: "#9ca3af",
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  selectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#9333EA",
    alignItems: "center",
    justifyContent: "center",
  },
  unselectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f9fafb",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export default CreateGroupChat;

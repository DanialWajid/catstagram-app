import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { User, MessageCircle } from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const { user } = useAuthStore();
  const navigation = useNavigation();

  const API_URL = "http://192.168.0.107:8000/api";

  // Refresh chats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
    }, [])
  );

  const fetchChats = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      setLoading(true);

      const response = await axios.get(`${API_URL}/chat/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats(response.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
  };

  const accessOrCreateChat = async (friendId) => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const response = await axios.post(
        `${API_URL}/chat/`,
        { userId: friendId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const chat = response.data;

      // Navigate to chat with the chat data
      navigation.navigate("ChatMessage", {
        chatId: chat._id,
        chatData: chat,
      });
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  const navigateToExistingChat = (chat) => {
    navigation.navigate("ChatMessage", {
      chatId: chat._id,
      chatData: chat,
    });
  };

  const getChatDisplayInfo = (chat) => {
    if (chat.isGroupChat) {
      return {
        name: chat.chatName,
        image: null, // You can add group image logic here
      };
    } else {
      // For one-on-one chats, find the other user
      const otherUser = chat.users.find((u) => u._id !== user._id);
      return {
        name: otherUser?.name || "Unknown User",
        image: otherUser?.profileImage || otherUser?.pic,
      };
    }
  };

  const getLastMessageText = (chat) => {
    if (chat.latestMessage) {
      return chat.latestMessage.content;
    }
    return "Start a conversation";
  };

  const getLastMessageTime = (chat) => {
    if (chat.latestMessage) {
      const date = new Date(chat.latestMessage.createdAt || chat.updatedAt);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "";
  };

  const renderChatCard = ({ item }) => {
    const displayInfo = getChatDisplayInfo(item);

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => navigateToExistingChat(item)}
      >
        <View style={styles.chatCardContent}>
          {displayInfo.image ? (
            <Image source={{ uri: displayInfo.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <User size={32} color="#9ca3af" />
            </View>
          )}

          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName} numberOfLines={1}>
                {displayInfo.name}
              </Text>
              <Text style={styles.timestamp}>{getLastMessageTime(item)}</Text>
            </View>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {getLastMessageText(item)}
            </Text>
          </View>

          <View style={styles.chatIconContainer}>
            <MessageCircle size={20} color="#9333EA" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const fetchFriends = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      setFriendsLoading(true);

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
    } finally {
      setFriendsLoading(false);
    }
  };

  useEffect(() => {
    if (chats.length === 0) {
      fetchFriends();
    }
  }, [chats.length]);

  // Show friends section if no chats exist
  const renderFriendsSection = () => {
    if (chats.length > 0) return null;

    return (
      <View style={styles.friendsSection}>
        <Text style={styles.sectionTitle}>Start a conversation</Text>
        {friendsLoading ? (
          <ActivityIndicator size="small" color="#9333EA" />
        ) : (
          <FlatList
            data={friends}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.friendCard}
                onPress={() => accessOrCreateChat(item._id)}
              >
                <View style={styles.chatCardContent}>
                  {item.profileImage ? (
                    <Image
                      source={{ uri: item.profileImage }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <User size={32} color="#9ca3af" />
                    </View>
                  )}

                  <View style={styles.chatInfo}>
                    <Text style={styles.chatName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      Tap to start chatting
                    </Text>
                  </View>

                  <View style={styles.chatIconContainer}>
                    <MessageCircle size={20} color="#9333EA" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Chats List */}
      <FlatList
        data={chats}
        renderItem={renderChatCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#9333EA"]}
            tintColor="#9333EA"
          />
        }
        ListEmptyComponent={renderFriendsSection}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
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
  headerSpacer: {
    width: 40,
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
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  chatCard: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  friendCard: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  chatCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f9fafb",
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: "#9ca3af",
  },
  chatIconContainer: {
    padding: 8,
  },
  friendsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f9fafb",
    marginBottom: 16,
  },
});

export default ChatPage;

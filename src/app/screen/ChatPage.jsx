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
  Alert,
  SectionList,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { User, MessageCircle, Users, Plus, Search } from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [showAllFriends, setShowAllFriends] = useState(false);
  const { user } = useAuthStore();
  const navigation = useNavigation();

  const API_URL = "http://192.168.0.107:8000/api";

  useFocusEffect(
    React.useCallback(() => {
      fetchChats();
      fetchFriends(); // Always fetch friends
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

      // Filter out current user and friends who already have chats
      const filteredFriends = friendsList.filter((friend) => {
        if (friend._id === user._id) return false;

        // Check if there's already a chat with this friend
        const hasExistingChat = chats.some((chat) => {
          if (chat.isGroupChat) return false;
          return chat.users.some((chatUser) => chatUser._id === friend._id);
        });

        return !hasExistingChat;
      });

      setFriends(filteredFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchChats(), fetchFriends()]);
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

      navigation.navigate("ChatMessage", {
        chatId: chat._id,
        chatData: chat,
      });
    } catch (error) {
      console.error("Error accessing chat:", error);
      Alert.alert("Error", "Failed to create chat");
    }
  };

  const navigateToExistingChat = (chat) => {
    navigation.navigate("ChatMessage", {
      chatId: chat._id,
      chatData: chat,
    });
  };

  const navigateToCreateGroup = () => {
    navigation.navigate("CreateGroupChat");
  };

  const getChatDisplayInfo = (chat) => {
    if (chat.isGroupChat) {
      return {
        name: chat.chatName,
        image: null,
        isGroup: true,
        memberCount: chat.users.length,
      };
    } else {
      const otherUser = chat.users.find((u) => u._id !== user._id);
      return {
        name: otherUser?.name || "Unknown User",
        image: otherUser?.profileImage || otherUser?.pic,
        isGroup: false,
      };
    }
  };

  const getLastMessageText = (chat) => {
    if (chat.latestMessage) {
      const senderName = chat.latestMessage.sender.name;
      const isMyMessage = chat.latestMessage.sender._id === user._id;
      const prefix = chat.isGroupChat
        ? isMyMessage
          ? "You: "
          : `${senderName}: `
        : "";
      return `${prefix}${chat.latestMessage.content}`;
    }
    return chat.isGroupChat ? "Group created" : "Start a conversation";
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
          {displayInfo.isGroup ? (
            <View style={styles.groupAvatarContainer}>
              <View style={styles.groupAvatar}>
                <Users size={24} color="#9333EA" />
              </View>
            </View>
          ) : displayInfo.image ? (
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
                {displayInfo.isGroup && (
                  <Text style={styles.memberCount}>
                    {" "}
                    ({displayInfo.memberCount})
                  </Text>
                )}
              </Text>
              <Text style={styles.timestamp}>{getLastMessageTime(item)}</Text>
            </View>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {getLastMessageText(item)}
            </Text>
          </View>

          <View style={styles.chatIconContainer}>
            {displayInfo.isGroup ? (
              <Users size={20} color="#9333EA" />
            ) : (
              <MessageCircle size={20} color="#9333EA" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFriendCard = ({ item }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => accessOrCreateChat(item._id)}
    >
      <View style={styles.chatCardContent}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatar} />
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
  );

  const renderSectionHeader = ({ section: { title, data, showToggle } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showToggle && data.length > 3 && (
        <TouchableOpacity
          onPress={() => setShowAllFriends(!showAllFriends)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleButtonText}>
            {showAllFriends ? "Show Less" : `Show All (${data.length})`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const prepareSectionData = () => {
    const sections = [];

    // Recent Chats Section
    if (chats.length > 0) {
      sections.push({
        title: "Recent Chats",
        data: chats,
        renderItem: renderChatCard,
        showToggle: false,
      });
    }

    // Start New Chat Section
    if (friends.length > 0) {
      const friendsToShow = showAllFriends ? friends : friends.slice(0, 3);
      sections.push({
        title: "Start New Chat",
        data: friendsToShow,
        renderItem: renderFriendCard,
        showToggle: true,
      });
    }

    return sections;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  const sections = prepareSectionData();

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
        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={navigateToCreateGroup}
        >
          <Plus size={24} color="#9333EA" />
        </TouchableOpacity>
      </View>

      {/* Chats and Friends List */}
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item._id + index}
          renderItem={({ item, section }) => section.renderItem({ item })}
          renderSectionHeader={renderSectionHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#9333EA"]}
              tintColor="#9333EA"
            />
          }
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MessageCircle size={64} color="#6b7280" />
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.emptySubtitle}>
            {friendsLoading
              ? "Loading friends..."
              : friends.length === 0
              ? "Add some friends to start chatting!"
              : "Start a conversation with your friends!"}
          </Text>
          {friendsLoading && (
            <ActivityIndicator
              size="small"
              color="#9333EA"
              style={styles.emptyLoader}
            />
          )}
        </View>
      )}
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
  createGroupButton: {
    padding: 8,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f9fafb",
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#374151",
    borderRadius: 16,
  },
  toggleButtonText: {
    color: "#9333EA",
    fontSize: 14,
    fontWeight: "500",
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
  groupAvatarContainer: {
    width: 50,
    height: 50,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1e1b4b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#9333EA",
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
  memberCount: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "normal",
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
  emptyLoader: {
    marginTop: 16,
  },
});

export default ChatPage;

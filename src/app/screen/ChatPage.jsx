"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
  SectionList,
  Animated,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { User, MessageCircle, Users, Plus } from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SocketService from "../../services/socket";
import SideNav from "../../components/SideNav";

const { width } = Dimensions.get("window");

// Unread Badge Component
const UnreadBadge = ({ count }) => {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <View style={styles.unreadBadge}>
      <Text style={styles.unreadBadgeText}>{displayCount}</Text>
    </View>
  );
};

// Typing Indicator Component
const TypingIndicator = ({ typingUsers, isGroupChat }) => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    if (typingUsers.length > 0) {
      const animateDots = () => {
        const createAnimation = (dot, delay) => {
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(dot, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          );
        };

        Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, 200),
          createAnimation(dot3, 400),
        ]).start();
      };

      animateDots();
    }
  }, [typingUsers, dot1, dot2, dot3]);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return isGroupChat ? `${typingUsers[0].name} is typing` : "typing";
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing`;
    } else {
      return `${typingUsers[0].name} and ${
        typingUsers.length - 1
      } others are typing`;
    }
  };

  return (
    <View style={styles.typingContainer}>
      <Text style={styles.typingText}>{getTypingText()}</Text>
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot1,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot2,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dot3,
            },
          ]}
        />
      </View>
    </View>
  );
};

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allFriends, setAllFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [typingStatus, setTypingStatus] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({}); // { chatId: count }
  const { user } = useAuthStore();
  const navigation = useNavigation();

  const API_URL = "http://192.168.100.87:8000/api";

  // Enhanced Socket Connection with better error handling and reconnection
  useEffect(() => {
    if (user?._id && user?.name) {
      console.log("Connecting to socket for user:", user.name);

      // Connect to socket
      SocketService.connect(user._id, user.name);

      // Monitor connection status with more frequent checks
      const connectionInterval = setInterval(() => {
        const connected = SocketService.getConnectionStatus();
        console.log("Socket connection status:", connected);

        if (!connected) {
          console.log("Socket disconnected, attempting to reconnect...");
          SocketService.connect(user._id, user.name);
        }
      }, 3000); // Check every 3 seconds

      // Set up all socket listeners
      setupSocketListeners();

      return () => {
        console.log("Cleaning up socket listeners");
        clearInterval(connectionInterval);

        // Safe cleanup - only use methods that exist in SocketService
        try {
          // Only call offTyping which handles both typing events
          if (SocketService && typeof SocketService.offTyping === "function") {
            SocketService.offTyping();
          }

          // Only call offMessageReceived if it exists
          if (
            SocketService &&
            typeof SocketService.offMessageReceived === "function"
          ) {
            SocketService.offMessageReceived();
          }

          // Optionally disconnect entirely
          if (SocketService && typeof SocketService.disconnect === "function") {
            SocketService.disconnect();
          }
        } catch (error) {
          console.log("Error during socket cleanup:", error);
        }

        setTypingStatus({});
      };
    }
  }, [user]);

  const setupSocketListeners = () => {
    try {
      // Listen for typing events
      if (SocketService && typeof SocketService.onTyping === "function") {
        SocketService.onTyping((data) => {
          console.log("Typing event received:", data);
          const { chatId, user: typingUser } = data;

          if (typingUser._id !== user._id) {
            setTypingStatus((prev) => {
              const currentTypers = prev[chatId] || [];
              const isAlreadyTyping = currentTypers.some(
                (u) => u._id === typingUser._id
              );

              if (!isAlreadyTyping) {
                return {
                  ...prev,
                  [chatId]: [...currentTypers, typingUser],
                };
              }
              return prev;
            });
          }
        });
      }

      // Only set up stop typing listener if the method exists
      if (SocketService && typeof SocketService.onStopTyping === "function") {
        SocketService.onStopTyping((data) => {
          console.log("Stop typing event received:", data);
          const { chatId, user: typingUser } = data;

          setTypingStatus((prev) => {
            const currentTypers = prev[chatId] || [];
            const filteredTypers = currentTypers.filter(
              (u) => u._id !== typingUser._id
            );

            if (filteredTypers.length === 0) {
              const newStatus = { ...prev };
              delete newStatus[chatId];
              return newStatus;
            } else {
              return {
                ...prev,
                [chatId]: filteredTypers,
              };
            }
          });
        });
      } else {
        console.log("onStopTyping method not available in SocketService");
      }

      // Enhanced message received handler
      if (
        SocketService &&
        typeof SocketService.onMessageReceived === "function"
      ) {
        SocketService.onMessageReceived((newMessage) => {
          console.log("New message received in ChatPage:", newMessage);

          // Only increment unread count if message is not from current user
          if (newMessage.sender._id !== user._id) {
            setUnreadCounts((prev) => ({
              ...prev,
              [newMessage.chat._id]: (prev[newMessage.chat._id] || 0) + 1,
            }));
          }

          // Update the chat list with the new message
          setChats((prevChats) => {
            const updatedChats = prevChats.map((chat) => {
              if (chat._id === newMessage.chat._id) {
                return {
                  ...chat,
                  latestMessage: newMessage,
                  updatedAt: newMessage.createdAt,
                };
              }
              return chat;
            });

            // If the chat doesn't exist in the list, fetch it
            const chatExists = prevChats.some(
              (chat) => chat._id === newMessage.chat._id
            );
            if (!chatExists) {
              console.log("New chat detected, refreshing chat list");
              // Trigger a refresh to get the new chat
              setTimeout(() => {
                fetchChats();
              }, 500);
            }

            // Sort chats by latest message time
            return updatedChats.sort((a, b) => {
              const aTime = new Date(
                a.latestMessage?.createdAt || a.updatedAt || 0
              );
              const bTime = new Date(
                b.latestMessage?.createdAt || b.updatedAt || 0
              );
              return bTime - aTime;
            });
          });
        });
      }
    } catch (error) {
      console.error("Error setting up socket listeners:", error);
    }
  };

  // Join chats when they are loaded
  useEffect(() => {
    if (chats.length > 0 && SocketService.getConnectionStatus()) {
      chats.forEach((chat) => {
        console.log("Joining chat:", chat._id);
        SocketService.joinChat(chat._id);
      });
    }
  }, [chats]);

  // Enhanced focus effect with force refresh option
  useFocusEffect(
    React.useCallback(() => {
      console.log("ChatPage focused, checking for updates");

      // Always refresh data when component gains focus
      fetchData();

      // Also ensure socket is connected
      if (user?._id && user?.name && !SocketService.getConnectionStatus()) {
        console.log("Reconnecting socket on focus");
        SocketService.connect(user._id, user.name);
      }
    }, [user])
  );

  // Fetch both chats and friends sequentially to ensure proper filtering
  const fetchData = async () => {
    try {
      setLoading(true);

      // First fetch chats
      await fetchChats();

      // Then fetch friends (this will use the updated chats for filtering)
      await fetchFriends();

      // Fetch unread counts
      await fetchUnreadCounts();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchChats = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const response = await axios.get(`${API_URL}/chat/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched chats:", response.data.length);
      setChats(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
      return [];
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

      console.log("All friends fetched:", friendsList.length);
      setAllFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setAllFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  // Fetch unread message counts for all chats
  const fetchUnreadCounts = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");

      const response = await axios.get(`${API_URL}/chat/unread-counts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched unread counts:", response.data);
      setUnreadCounts(response.data || {});
    } catch (error) {
      console.error("Error fetching unread counts:", error);
      // If endpoint doesn't exist, you can calculate from chat data
      // or set default empty object
      setUnreadCounts({});
    }
  };

  // Mark chat as read when opening
  const markChatAsRead = async (chatId) => {
    try {
      const token = await SecureStore.getItemAsync("token");

      await axios.put(
        `${API_URL}/chat/${chatId}/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear unread count locally
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[chatId];
        return newCounts;
      });

      console.log("Marked chat as read:", chatId);
    } catch (error) {
      console.error("Error marking chat as read:", error);
      // Still clear locally even if API call fails
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[chatId];
        return newCounts;
      });
    }
  };

  // Filter friends who don't have existing chats (computed property)
  const availableFriends = React.useMemo(() => {
    console.log(
      "Filtering friends. Total friends:",
      allFriends.length,
      "Total chats:",
      chats.length
    );

    const filtered = allFriends.filter((friend) => {
      // Don't show current user
      if (friend._id === user._id) {
        console.log("Filtering out current user:", friend.name);
        return false;
      }

      // Check if there's already a chat with this friend
      const hasExistingChat = chats.some((chat) => {
        // Skip group chats
        if (chat.isGroupChat) return false;

        // Check if this friend is in any existing chat
        const isInChat = chat.users.some(
          (chatUser) => chatUser._id === friend._id
        );
        if (isInChat) {
          console.log("Friend already has chat:", friend.name);
        }
        return isInChat;
      });

      return !hasExistingChat;
    });

    console.log("Available friends after filtering:", filtered.length);
    return filtered;
  }, [allFriends, chats, user._id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
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

      // Join the new chat
      if (SocketService.getConnectionStatus()) {
        SocketService.joinChat(chat._id);
      }

      // Refresh data to update the lists
      await fetchData();

      navigation.navigate("ChatMessage", {
        chatId: chat._id,
        chatData: chat,
      });
    } catch (error) {
      console.error("Error accessing chat:", error);
      Alert.alert("Error", "Failed to create chat");
    }
  };

  const navigateToExistingChat = async (chat) => {
    // Mark chat as read before navigating
    await markChatAsRead(chat._id);

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
    const typingUsers = typingStatus[item._id] || [];
    const isTyping = typingUsers.length > 0;
    const unreadCount = unreadCounts[item._id] || 0;
    const hasUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        style={[styles.chatCard, hasUnread && styles.chatCardUnread]}
        onPress={() => navigateToExistingChat(item)}
      >
        <View style={styles.chatCardContent}>
          <View style={styles.avatarContainer}>
            {displayInfo.isGroup ? (
              <View style={styles.groupAvatarContainer}>
                <View style={styles.groupAvatar}>
                  <Users size={24} color="#9333EA" />
                </View>
              </View>
            ) : displayInfo.image ? (
              <Image
                source={{ uri: displayInfo.image }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <User size={32} color="#9ca3af" />
              </View>
            )}

            {/* Unread badge on avatar */}
            {hasUnread && (
              <View style={styles.avatarBadgeContainer}>
                <UnreadBadge count={unreadCount} />
              </View>
            )}
          </View>

          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text
                style={[styles.chatName, hasUnread && styles.chatNameUnread]}
                numberOfLines={1}
              >
                {displayInfo.name}
                {displayInfo.isGroup && (
                  <Text style={styles.memberCount}>
                    {" "}
                    ({displayInfo.memberCount})
                  </Text>
                )}
              </Text>
              <View style={styles.timestampContainer}>
                <Text
                  style={[
                    styles.timestamp,
                    hasUnread && styles.timestampUnread,
                  ]}
                >
                  {getLastMessageTime(item)}
                </Text>
              </View>
            </View>

            {isTyping ? (
              <TypingIndicator
                typingUsers={typingUsers}
                isGroupChat={displayInfo.isGroup}
              />
            ) : (
              <Text
                style={[
                  styles.lastMessage,
                  hasUnread && styles.lastMessageUnread,
                ]}
                numberOfLines={1}
              >
                {getLastMessageText(item)}
              </Text>
            )}
          </View>

          <View style={styles.chatIconContainer}>
            {displayInfo.isGroup ? (
              <Users size={20} color="#9333EA" />
            ) : (
              <MessageCircle size={20} color="#9333EA" />
            )}

            {/* Additional unread indicator */}
            {hasUnread && <View style={styles.unreadDot} />}
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

  const renderSectionHeader = ({ section: { title, data, showToggle } }) => {
    // Calculate total unread messages for the section title
    const totalUnread =
      title === "Recent Chats"
        ? Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
        : 0;

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {title}
          {totalUnread > 0 && (
            <Text style={styles.sectionUnreadCount}> ({totalUnread})</Text>
          )}
        </Text>
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
  };

  const prepareSectionData = () => {
    const sections = [];

    // Recent Chats Section - sort by unread first, then by latest message
    if (chats.length > 0) {
      const sortedChats = [...chats].sort((a, b) => {
        const aUnread = unreadCounts[a._id] || 0;
        const bUnread = unreadCounts[b._id] || 0;

        // First sort by unread (unread chats first)
        if (aUnread > 0 && bUnread === 0) return -1;
        if (bUnread > 0 && aUnread === 0) return 1;

        // Then sort by latest message time
        const aTime = new Date(a.latestMessage?.createdAt || a.updatedAt || 0);
        const bTime = new Date(b.latestMessage?.createdAt || b.updatedAt || 0);
        return bTime - aTime;
      });

      sections.push({
        title: "Recent Chats",
        data: sortedChats,
        renderItem: renderChatCard,
        showToggle: false,
      });
    }

    // Start New Chat Section - only show friends without existing chats
    if (availableFriends.length > 0) {
      const friendsToShow = showAllFriends
        ? availableFriends
        : availableFriends.slice(0, 3);
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              console.log("Manual refresh triggered");
              handleRefresh();
            }}
          >
            <Text style={styles.refreshButtonText}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createGroupButton}
            onPress={navigateToCreateGroup}
          >
            <Plus size={24} color="#9333EA" />
          </TouchableOpacity>
        </View>
      </View>

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
              : availableFriends.length === 0
              ? "All your friends already have chats with you!"
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
      <SideNav/>
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
  sectionUnreadCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9333EA",
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
  chatCardUnread: {
    borderColor: "#9333EA",
    backgroundColor: "#1e1b4b",
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
  avatarContainer: {
    position: "relative",
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
  avatarBadgeContainer: {
    position: "absolute",
    top: -5,
    right: -5,
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
  chatNameUnread: {
    fontWeight: "700",
    color: "#ffffff",
  },
  memberCount: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "normal",
  },
  timestampContainer: {
    alignItems: "flex-end",
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 8,
  },
  timestampUnread: {
    color: "#9333EA",
    fontWeight: "600",
  },
  lastMessage: {
    fontSize: 14,
    color: "#9ca3af",
  },
  lastMessageUnread: {
    color: "#d1d5db",
    fontWeight: "500",
  },
  chatIconContainer: {
    padding: 8,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9333EA",
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
  // Unread Badge Styles
  unreadBadge: {
    backgroundColor: "#9333EA",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Typing Indicator Styles
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    fontSize: 14,
    color: "#9333EA",
    fontStyle: "italic",
    marginRight: 6,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9333EA",
    marginHorizontal: 1,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  refreshButtonText: {
    fontSize: 20,
    color: "#9333EA",
    fontWeight: "bold",
  },
});

export default ChatPage;

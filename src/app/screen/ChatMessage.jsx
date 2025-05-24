import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { User, Send } from "lucide-react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import SocketService from "../../services/socket";

const ChatMessage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef(null);

  const { chatId, chatData } = route.params;
  const API_URL = "http://192.168.0.107:8000/api";

  useEffect(() => {
    console.log("ChatMessage component mounted for chat:", chatId);
    fetchMessages();
    setupSocket();

    return () => {
      console.log("ChatMessage component unmounting");
      cleanupSocket();
    };
  }, [chatId, user._id]);

  const setupSocket = () => {
    console.log("Setting up socket connection...");

    // Connect to socket
    SocketService.connect(user._id);

    // Check connection status periodically
    const checkConnection = setInterval(() => {
      const connected = SocketService.getConnectionStatus();
      setSocketConnected(connected);

      if (connected && !SocketService.hasJoinedChat) {
        console.log("Socket connected, joining chat...");
        SocketService.joinChat(chatId);
        SocketService.hasJoinedChat = true;
      }
    }, 1000);

    // Listen for new messages
    SocketService.onMessageReceived((newMessage) => {
      console.log("New message received in component:", newMessage);
      setMessages((prevMessages) => {
        // Check if message already exists to avoid duplicates
        const messageExists = prevMessages.some(
          (msg) => msg._id === newMessage._id
        );
        if (!messageExists) {
          console.log("Adding new message to state");
          return [...prevMessages, newMessage];
        }
        console.log("Message already exists, skipping");
        return prevMessages;
      });

      // Auto scroll to bottom when new message arrives
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    // Listen for typing indicators
    SocketService.onTyping(() => {
      console.log("Someone is typing...");
      setIsTyping(true);
    });

    SocketService.onStopTyping(() => {
      console.log("Stopped typing");
      setIsTyping(false);
    });

    // Cleanup interval on unmount
    return () => {
      clearInterval(checkConnection);
    };
  };

  const cleanupSocket = () => {
    console.log("Cleaning up socket listeners...");
    SocketService.offMessageReceived();
    SocketService.offTyping();
    SocketService.hasJoinedChat = false;
  };

  const fetchMessages = async () => {
    try {
      console.log("Fetching messages for chat:", chatId);
      const token = await SecureStore.getItemAsync("token");
      setLoading(true);

      const response = await axios.get(`${API_URL}/message/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched", response.data.length, "messages");
      setMessages(response.data);

      // Scroll to bottom after loading messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 500);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    console.log("Sending message:", messageContent);
    setNewMessage(""); // Clear input immediately for better UX

    try {
      setSending(true);
      const token = await SecureStore.getItemAsync("token");

      const response = await axios.post(
        `${API_URL}/message/`,
        {
          content: messageContent,
          chatId: chatId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const sentMessage = response.data;
      console.log("Message sent successfully:", sentMessage);

      // Add the new message to the list immediately
      setMessages((prevMessages) => [...prevMessages, sentMessage]);

      // Emit the message through socket to other users
      if (socketConnected) {
        console.log("Emitting message via socket...");
        SocketService.sendMessage(sentMessage);
      } else {
        console.log("Socket not connected, message not emitted");
      }

      // Stop typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      SocketService.stopTyping(chatId);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      // Restore the message if sending failed
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);

    if (!socketConnected) return;

    // Start typing indicator
    SocketService.startTyping(chatId);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      SocketService.stopTyping(chatId);
    }, 3000);

    setTypingTimeout(timeout);
  };

  const getChatDisplayInfo = () => {
    if (!chatData) return { name: "Chat", image: null };

    if (chatData.isGroupChat) {
      return {
        name: chatData.chatName,
        image: null,
      };
    } else {
      const otherUser = chatData.users.find((u) => u._id !== user._id);
      return {
        name: otherUser?.name || "Unknown User",
        image: otherUser?.profileImage || otherUser?.pic,
      };
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender._id === user._id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {!isMyMessage && chatData?.isGroupChat && (
          <Text style={styles.senderName}>{item.sender.name}</Text>
        )}
        <Text
          style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.content}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  const displayInfo = getChatDisplayInfo();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text style={styles.loadingText}>Loading messages...</Text>
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

        <View style={styles.headerUserInfo}>
          {displayInfo.image ? (
            <Image
              source={{ uri: displayInfo.image }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <User size={20} color="#9ca3af" />
            </View>
          )}
          <View>
            <Text style={styles.headerUserName}>{displayInfo.name}</Text>
            {isTyping && <Text style={styles.typingIndicator}>typing...</Text>}
          </View>
        </View>

        {/* Connection status indicator */}
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.connectionDot,
              { backgroundColor: socketConnected ? "#10b981" : "#ef4444" },
            ]}
          />
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
          editable={!sending}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            newMessage.trim() && !sending
              ? styles.sendButtonActive
              : styles.sendButtonInactive,
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size={16} color="#ffffff" />
          ) : (
            <Send
              size={20}
              color={newMessage.trim() && !sending ? "#ffffff" : "#6b7280"}
            />
          )}
        </TouchableOpacity>
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
  headerUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerUserName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f9fafb",
  },
  typingIndicator: {
    fontSize: 12,
    color: "#9333EA",
    fontStyle: "italic",
  },
  connectionStatus: {
    padding: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#9333EA",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#374151",
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
    fontWeight: "500",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#ffffff",
  },
  theirMessageText: {
    color: "#f9fafb",
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
    backgroundColor: "#1f2937",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#374151",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    color: "#f9fafb",
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#9333EA",
  },
  sendButtonInactive: {
    backgroundColor: "#374151",
  },
});

export default ChatMessage;

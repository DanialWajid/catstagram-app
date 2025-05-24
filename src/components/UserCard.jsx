import React, { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
``;
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { User, Ban } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../store/authStore";

const API_URL = "http://192.168.0.107:8000/api";

const UserCard = ({ cardUser, isPrivate, isFriend, onFriendUpdate }) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const { user } = useAuthStore();
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const response = await axios.get(
          `${API_URL}/friends/status/${cardUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { friendRequestStatus, requestId, isBlocked } = response.data;
        setRequestSent(friendRequestStatus === "pending");
        setRequestId(requestId);
        setIsBlocked(isBlocked);
      } catch (error) {
        console.error("Error fetching user status:", error);
      }
    };

    fetchUserStatus();
  }, [cardUser._id]);

  const handleBlockUser = async () => {
    Alert.alert(
      "Block User",
      `Are you sure you want to block ${cardUser.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          onPress: async () => {
            setIsLoading(true);
            try {
              const token = await SecureStore.getItemAsync("token");
              const response = await axios.post(
                `${API_URL}/user/block-user/${user._id}`,
                {
                  userIdToBlock: cardUser._id,
                }
              );
              if (response.data.success) {
                setIsBlocked(true);
                Alert.alert(
                  "Success",
                  `User ${cardUser.name} has been blocked.`
                );
                onFriendUpdate();
              }
            } catch (error) {
              console.error("Error blocking user:", error);
              Alert.alert(
                "Error",
                "Failed to block the user. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleUnblockUser = async () => {
    Alert.alert(
      "Unblock User",
      `Are you sure you want to unblock ${cardUser.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          onPress: async () => {
            setIsLoading(true);
            try {
              const token = await SecureStore.getItemAsync("token");
              const response = await axios.post(
                `${API_URL}/user/unblock-user/${user._id}`,
                {
                  userIdToUnblock: cardUser._id,
                }
              );
              if (response.data.success) {
                setIsBlocked(false);
                Alert.alert(
                  "Success",
                  `User ${cardUser.name} has been unblocked.`
                );
                onFriendUpdate();
              }
            } catch (error) {
              console.error("Error unblocking user:", error);
              Alert.alert(
                "Error",
                "Failed to unblock the user. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleFriendRequest = async () => {
    if (isLoading || requestSent || isBlocked) return;

    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");

      const response = await axios.post(
        `${API_URL}/friends/request/${cardUser._id}`,
        {}, // Empty body since this route doesn't need one
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { request } = response.data;
      setRequestSent(true);
      setRequestId(request.id); // Adjusted to match your backend's response shape
      onFriendUpdate();
      Alert.alert("Success", `Friend request sent to ${cardUser.name}.`);
    } catch (error) {
      console.error(
        "Error sending friend request:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to send friend request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsendRequest = async () => {
    if (isLoading || !requestSent || !requestId) return;

    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this friend request?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            setIsLoading(true);
            try {
              const token = await SecureStore.getItemAsync("token");

              await axios.delete(`${API_URL}/friends/request/${requestId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              setRequestSent(false);
              setRequestId(null);
              onFriendUpdate();
            } catch (error) {
              console.error(
                "Error unsending friend request:",
                error.response?.data || error.message
              );
              Alert.alert(
                "Error",
                "Failed to unsend friend request. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveFriend = async () => {
    if (isBlocked) return;

    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${cardUser.name} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            setIsLoading(true);
            try {
              const token = await SecureStore.getItemAsync("token");

              await axios.delete(`${API_URL}/friends/remove/${cardUser._id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              onFriendUpdate();
              Alert.alert(
                "Success",
                `${cardUser.name} has been removed from your friends.`
              );
            } catch (error) {
              console.error("Error removing friend:", error);
              Alert.alert(
                "Error",
                "Failed to remove friend. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const getButtonConfig = () => {
    if (isBlocked) {
      return {
        text: "Blocked",
        onPress: handleUnblockUser,
        style: styles.blockedButton,
      };
    } else if (isFriend) {
      return {
        text: "Remove Friend",
        onPress: handleRemoveFriend,
        style: styles.darkRemoveFriendButton,
      };
    } else if (requestSent) {
      return {
        text: "Cancel Request",
        onPress: handleUnsendRequest,
        style: styles.darkCancelRequestButton,
      };
    } else {
      return {
        text: "Send Friend Request",
        onPress: handleFriendRequest,
        style: styles.darkSendRequestButton,
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <LinearGradient
      colors={["#111827", "#4c1d95", "#000000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.cardContainer, { borderColor: "#7c3aed" }]}
    >
      <TouchableOpacity
        style={styles.blockButton}
        onPress={isBlocked ? handleUnblockUser : handleBlockUser}
      >
        <Ban size={20} color={isBlocked ? "#ffffff" : "#ef4444"} />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        {cardUser.profileImage ? (
          <Image
            source={{ uri: cardUser.profileImage }}
            style={[styles.avatar, { borderColor: "#7c3aed" }]}
          />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              styles.darkAvatarFallback,
              { borderColor: "#7c3aed" },
            ]}
          >
            <User size={40} color={"#e5e7eb"} />
          </View>
        )}

        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile", { id: cardUser._id })}
          >
            <Text style={[styles.userName, styles.darkText]}>
              {cardUser.name}
            </Text>
          </TouchableOpacity>

          <Text style={styles.userEmail}>
            {isPrivate ? "Email is private" : cardUser.email}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.viewProfileButton,
                styles.darkViewProfileButton,
              ]}
              onPress={() =>
                navigation.navigate("Profile", { id: cardUser._id })
              }
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                buttonConfig.style,
                (isBlocked || isLoading) && styles.disabledButton,
              ]}
              onPress={buttonConfig.onPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>{buttonConfig.text}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  blockButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 8,
  },
  cardContent: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    marginRight: 16,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  darkAvatarFallback: {
    backgroundColor: "#4c1d95",
  },
  lightAvatarFallback: {
    backgroundColor: "#e5e7eb",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  darkText: {
    color: "#ffffff",
  },
  lightText: {
    color: "#111827",
  },
  userEmail: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  viewProfileButton: {
    backgroundColor: "#3b82f6",
  },
  darkViewProfileButton: {
    backgroundColor: "#2563eb",
  },
  lightViewProfileButton: {
    backgroundColor: "#3b82f6",
  },
  darkSendRequestButton: {
    backgroundColor: "#059669",
  },
  lightSendRequestButton: {
    backgroundColor: "#10b981",
  },
  darkCancelRequestButton: {
    backgroundColor: "#6b7280",
  },
  lightCancelRequestButton: {
    backgroundColor: "#9ca3af",
  },
  darkRemoveFriendButton: {
    backgroundColor: "#dc2626",
  },
  lightRemoveFriendButton: {
    backgroundColor: "#ef4444",
  },
  blockedButton: {
    backgroundColor: "#dc2626",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default UserCard;

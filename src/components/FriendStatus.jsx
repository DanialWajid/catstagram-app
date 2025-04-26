import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import * as SecureStore from "expo-secure-store";


const FriendProtectedContent = ({ userId, children, fallbackMessage }) => {
  const [canView, setCanView] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const API_URL = "http://192.168.100.165:8000/";

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (userId === user._id) {
          setCanView(true);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}api/friends/check/${userId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,

          },
        });

        if (!response.ok) {
          throw new Error("Failed to check friend status");
        }

        const data = await response.json();
        setCanView(data.isFriend || data.isOwnProfile || data.isPublic);
      } catch (error) {
        console.error("Error checking friend status:", error);
        setCanView(false);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      checkAccess();
    }
  }, [userId, user._id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="small" 
          color="#60a5fa" 
        />
      </View>
    );
  }

  if (!canView) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          {fallbackMessage}
        </Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#f9fafb',
  },
});

export default FriendProtectedContent;
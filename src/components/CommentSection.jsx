import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { User, Edit, Trash2, Send } from "lucide-react-native";
import { format } from "date-fns";

const CommentSection = ({ postId, userId, onCommentCountChange }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    fetchComments();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardOffset(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://192.168.0.107:8000/api/comment/${postId}`
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data.comments);
      onCommentCountChange(data.comments.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to load comments");
    }
  };

  const handleSubmit = async () => {
    if (commentText.trim() === "") return;

    if (editingCommentId) {
      await handleEditComment();
    } else {
      await handleAddComment();
    }
  };

  const handleAddComment = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.107:8000/api/comment/add-comment/${postId}/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: commentText }),
        }
      );

      if (!response.ok) throw new Error("Failed to add comment");

      setCommentText("");
      await fetchComments();
      onCommentCountChange(comments.length + 1);
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const handleEditComment = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.107:8000/api/comment/edit-comment/${editingCommentId}/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: commentText }),
        }
      );

      if (!response.ok) throw new Error("Failed to edit comment");

      setCommentText("");
      setEditingCommentId(null);
      await fetchComments();
    } catch (error) {
      console.error("Error editing comment:", error);
      Alert.alert("Error", "Failed to edit comment");
    }
  };

  const handleRemoveComment = async (commentId) => {
    try {
      Alert.alert(
        "Remove Comment",
        "Are you sure you want to remove this comment?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            onPress: async () => {
              const response = await fetch(
                `http://192.168.0.107:8000/api/comment/remove-comment/${commentId}/${userId}`,
                {
                  method: "GET",
                }
              );

              if (!response.ok) throw new Error("Failed to remove comment");

              await fetchComments();
              onCommentCountChange(comments.length - 1);
            },
            style: "destructive",
          },
        ]
      );
    } catch (error) {
      console.error("Error removing comment:", error);
      Alert.alert("Error", "Failed to remove comment");
    }
  };

  const startEditing = async (commentId) => {
    try {
      const response = await fetch(
        `http://192.168.0.107:8000/api/comment/get-one/${commentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch comment");

      const data = await response.json();
      setCommentText(data.comment.text);
      setEditingCommentId(commentId);
    } catch (error) {
      console.error("Error fetching comment for edit:", error);
      Alert.alert("Error", "Failed to edit comment");
    }
  };

  const cancelEditing = () => {
    setCommentText("");
    setEditingCommentId(null);
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        {item.user.profileImage ? (
          <Image
            source={{ uri: item.user.profileImage }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <User size={20} color="#fff" />
          </View>
        )}

        <View style={styles.commentContent}>
          <View style={styles.commentMeta}>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.timestamp}>
              {format(new Date(item.createdAt), "MMM d, yyyy HH:mm")}
            </Text>
          </View>

          <Text style={styles.commentText}>{item.text}</Text>

          {item.user._id === userId && (
            <View style={styles.commentActions}>
              <TouchableOpacity
                onPress={() => startEditing(item._id)}
                style={styles.actionButton}
              >
                <Edit size={16} color="#60a5fa" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRemoveComment(item._id)}
                style={styles.actionButton}
              >
                <Trash2 size={16} color="#f87171" />
                <Text style={styles.actionText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60a5fa" />
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item._id}
          style={styles.commentsList}
          contentContainerStyle={[
            styles.commentsListContent,
            { paddingBottom: keyboardOffset > 0 ? keyboardOffset + 100 : 16 },
          ]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No comments yet. Be the first to comment!
            </Text>
          }
        />
      )}

      <View
        style={[
          styles.inputContainer,
          { bottom: keyboardOffset > 0 ? keyboardOffset : 0 },
        ]}
      >
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder={
            editingCommentId ? "Edit your comment..." : "Add a comment..."
          }
          placeholderTextColor="#9ca3af"
          style={styles.input}
          multiline
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.sendButton}
            disabled={commentText.trim() === ""}
          >
            <Send
              size={20}
              color={commentText.trim() === "" ? "#6b7280" : "#3b82f6"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 350,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111827",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#f3f4f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    padding: 16,
  },
  commentItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#1f2937",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4b5563",
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  userName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#f3f4f6",
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
  },
  commentText: {
    fontSize: 14,
    marginTop: 4,
    color: "#f3f4f6",
  },
  commentActions: {
    flexDirection: "row",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#f3f4f6",
  },
  inputContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
    backgroundColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlignVertical: "center",
    backgroundColor: "#374151",
    color: "#f3f4f6",
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  // ... (keep other styles the same)
});

export default CommentSection;

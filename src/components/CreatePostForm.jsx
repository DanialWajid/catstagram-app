import axios from "axios";
import React, { useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Check } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../store/themeContext";

const CreatePostForm = ({ navigation }) => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera roll permissions to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      Alert.alert("Missing Information", "Please provide a caption.");
      return;
    }

    if (!image) {
      Alert.alert("Missing Image", "Please select an image for your post.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("caption", caption);

      const filename = image.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `profileImage/${match[1]}` : "profileImage";

      formData.append("profileImage", {
        uri: Platform.OS === "ios" ? image.replace("file://", "") : image,
        name: filename,
        type,
      });

      const token = await SecureStore.getItemAsync("token");
      const response = await axios.post(
        "http://192.168.0.111:8000/api/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Post created successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", response.data.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "An error occurred while creating the post."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.formContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Create New Post
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Caption</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
                color: theme.inputText,
              },
            ]}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.secondaryText}
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Image</Text>

          <TouchableOpacity
            style={[
              styles.imagePickerButton,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
            onPress={pickImage}
          >
            <Camera size={24} color={theme.text} />
            <Text style={[styles.imagePickerText, { color: theme.text }]}>
              {image ? "Change Image" : "Select Image"}
            </Text>
          </TouchableOpacity>

          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: image }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.imageSelectedIndicator,
                  { backgroundColor: theme.success },
                ]}
              >
                <Check size={16} color="#ffffff" />
              </View>
            </View>
          )}
        </View>

        <Animated.View style={[animatedStyle, styles.buttonContainer]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.button },
              (!caption.trim() || !image || loading) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!caption.trim() || !image || loading}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.buttonText} />
            ) : (
              <Text
                style={[styles.submitButtonText, { color: theme.buttonText }]}
              >
                Create Post
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  imagePickerText: {
    marginLeft: 8,
    fontSize: 16,
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: "center",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  imageSelectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 12,
    padding: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreatePostForm;

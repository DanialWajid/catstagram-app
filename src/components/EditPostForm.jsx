
import * as SecureStore from "expo-secure-store";
import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { MessageCircle, Heart, Bookmark, Camera, Check } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';

const EditPostForm = ({ post }) => {
  const [caption, setCaption] = useState(post.caption || '');
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // This enables the default cropping UI
      aspect: [1, 1], // Square aspect ratio
      quality: 0.8, // Good quality without being too large
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      Alert.alert('Missing Information', 'Please provide a caption.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('caption', caption);
      
      if (newImage) {
        const filename = newImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `profileImage/${match[1]}` : 'profileImage';
        
        formData.append('profileImage', {
          uri: Platform.OS === 'ios' ? newImage.replace('file://', '') : newImage,
          name: filename,
          type
        });
      }
            const token = await SecureStore.getItemAsync("token");
      const response = await axios.post(
        `http://192.168.0.110:8000/api/posts/edit/${post._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Post updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'An error occurred while updating the post.');
    } finally {
      setLoading(false);
    }
  };

  const previewImage = newImage || post.image;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Edit Post</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Update Caption</Text>
          <TextInput
            style={styles.input}
            placeholder="Update your caption..."
            placeholderTextColor="#9ca3af"
            value={caption}
            onChangeText={setCaption}
            multiline
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Update Image</Text>
          
          <TouchableOpacity 
            style={styles.imagePickerButton}
            onPress={pickImage}
          >
            <Camera size={24} color="#f9fafb" />
            <Text style={styles.imagePickerText}>
              {newImage ? 'Change Image' : 'Select New Image'}
            </Text>
          </TouchableOpacity>

          {previewImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: previewImage }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              {newImage && (
                <View style={styles.imageSelectedIndicator}>
                  <Check size={16} color="#ffffff" />
                </View>
              )}
            </View>
          )}
        </View>

        <Animated.View style={[animatedStyle, styles.buttonContainer]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!caption.trim() || loading) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!caption.trim() || loading}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Post</Text>
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
    backgroundColor: '#111827',
  },
  contentContainer: {
    padding: 16,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#f9fafb',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#f9fafb',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    color: '#f9fafb',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  imagePickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#f9fafb',
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: 'center',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  imageSelectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditPostForm;
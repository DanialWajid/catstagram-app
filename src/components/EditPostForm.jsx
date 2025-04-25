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
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { MessageCircle, Heart, Bookmark, Camera, Check } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';

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
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const manipResult = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800, height: 800 } }],
        { format: SaveFormat.JPEG, compress: 0.8 }
      );
      
      setNewImage(manipResult.uri);
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
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('profileImage', {
          uri: Platform.OS === 'ios' ? newImage.replace('file://', '') : newImage,
          name: filename,
          type
        });
      }

      const response = await axios.post(
        `http://192.168.100.165:8000/api/posts/edit/${post._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Post updated successfully!');
        navigation.navigate('Home');
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
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          Edit Post
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Update Caption
          </Text>
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
          <Text style={styles.label}>
            Update Image
          </Text>
          
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
              />
              {newImage && (
                <View style={styles.imageSelectedIndicator}>
                  <Check size={16} color="#ffffff" />
                </View>
              )}
            </View>
          )}
        </View>

        {caption && previewImage && (
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <FastImage
                source={{ 
                  uri: post.user?.profileImage || 'https://via.placeholder.com/50'
                }}
                style={styles.previewAvatar}
              />
              <View>
                <Text style={styles.previewName}>
                  {post.user?.name || 'User Name'}
                </Text>
                <Text style={styles.previewTime}>Just Now</Text>
              </View>
            </View>

            <Image
              source={{ uri: previewImage }}
              style={styles.previewImage}
            />

            <Text style={styles.previewCaption}>
              {caption}
            </Text>

            <View style={styles.previewActions}>
              <View style={styles.previewAction}>
                <Heart size={16} color="#ef4444" />
                <Text style={styles.previewActionText}>
                  {post.likes?.length === 1
                    ? "1 Like"
                    : `${post.likes?.length || 0} Likes`}
                </Text>
              </View>
              <View style={styles.previewAction}>
                <MessageCircle size={16} color="#60a5fa" />
                <Text style={styles.previewActionText}>
                  {post.comments?.length === 1
                    ? "1 Comment"
                    : `${post.comments?.length || 0} Comments`}
                </Text>
              </View>
              <View style={styles.previewAction}>
                <Bookmark size={16} color="#10b981" />
                <Text style={styles.previewActionText}>Saved</Text>
              </View>
            </View>
          </View>
        )}

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
  previewContainer: {
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: '#1f2937',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  previewTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
  },
  previewCaption: {
    fontSize: 14,
    marginBottom: 12,
    color: '#f9fafb',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 12,
  },
  previewAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewActionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#9ca3af',
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
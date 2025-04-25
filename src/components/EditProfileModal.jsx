import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { updateProfile } from '../services/profile.services';
import { useAuthStore } from '../store/authStore';
import { Upload, User, Lock, Unlock } from 'lucide-react-native';
import FastImage from 'react-native-fast-image';

const EditProfileModal = ({ profile, onClose, onUpdate }) => {
  const [name, setName] = useState(profile.name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate || false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(profile.profileImage || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

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
      try {
        // Check file size
        const fileInfo = await fetch(result.assets[0].uri).then(res => {
          return {
            size: res.headers.get('Content-Length'),
            type: res.headers.get('Content-Type')
          };
        });
        
        if (fileInfo.size && parseInt(fileInfo.size) > 5 * 1024 * 1024) {
          setErrorMessage('File size should be less than 5MB');
          return;
        }
        
        // Process the image
        const manipResult = await manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 500, height: 500 } }],
          { format: SaveFormat.JPEG, compress: 0.8 }
        );
        
        setProfileImage(manipResult.uri);
        setImagePreview(manipResult.uri);
        setErrorMessage('');
      } catch (error) {
        console.error('Error processing image:', error);
        setErrorMessage('Error processing image. Please try again.');
      }
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setLoading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      formData.append('isPrivate', isPrivate.toString());
      
      if (profileImage) {
        const filename = profileImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('profileImage', {
          uri: Platform.OS === 'ios' ? profileImage.replace('file://', '') : profileImage,
          name: filename,
          type
        });
      }

      const updatedProfile = await updateProfile(formData, user._id);
      onUpdate(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>
              Edit Profile
            </Text>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Profile Image */}
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.imagePickerContainer}>
                {imagePreview ? (
                  <FastImage
                    source={{ uri: imagePreview }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImageFallback}>
                    <User size={40} color="#e5e7eb" />
                  </View>
                )}
                <View style={styles.uploadIconContainer}>
                  <Upload size={20} color="#ffffff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Name
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Bio Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Bio
              </Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Profile Privacy */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Profile Privacy
              </Text>
              <View style={styles.privacyOptions}>
                <TouchableOpacity
                  style={[
                    styles.privacyOption,
                    !isPrivate && styles.selectedOption
                  ]}
                  onPress={() => setIsPrivate(false)}
                >
                  <Unlock size={20} color="#e5e7eb" />
                  <Text style={styles.privacyOptionText}>
                    Public Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.privacyOption,
                    isPrivate && styles.selectedOption
                  ]}
                  onPress={() => setIsPrivate(true)}
                >
                  <Lock size={20} color="#e5e7eb" />
                  <Text style={styles.privacyOptionText}>
                    Private Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  loading && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton
                ]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: '#1f2937',
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#f9fafb',
  },
  errorContainer: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePickerContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#3b82f6',
  },
  profileImageFallback: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
  },
  uploadIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1f2937',
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
    backgroundColor: '#374151',
    borderColor: '#4b5563',
    color: '#f9fafb',
  },
  bioInput: {
    minHeight: 100,
  },
  privacyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: '#374151',
  },
  privacyOptionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#f9fafb',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  cancelButton: {
    backgroundColor: '#4b5563',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileModal;
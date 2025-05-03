import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { User as UserIcon } from "lucide-react-native";
import {
  getProfileById,
  getUserStats,
  deleteAccount,
  checkIfBlocked,
} from "../../services/profile.services";
import { useAuthStore } from "../../store/authStore";
import FriendsListModal from "../../components/FriendListModal";
import FriendProtectedContent from "../../components/FriendStatus";
import EditProfileModal from "../../components/EditProfileModal";
import SideNav from "../../components/SideNav";
import Navbar from "../../components/Navbar";
import UserPosts from "../../components/UserPosts";

const Profile = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const id = route?.params?.id;
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuthStore();
  const userId = user ? user._id : null;

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData, blockedStatus] = await Promise.all([
        getProfileById(id),
        getUserStats(id),
        checkIfBlocked(user._id, id),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setIsBlocked(blockedStatus);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [id, user]);

  const handleDeleteAccount = async () => {
    try {
      
    await deleteAccount(id);
    navigation.navigate("Signup")

    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", "Failed to delete account. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.containerDark, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.containerDark]}>
      <Navbar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#a78bfa']}
            tintColor="#a78bfa"
          />
        }
      >
        <View style={[styles.profileHeader, styles.profileHeaderDark]}>
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              {profile.profileImage && !isBlocked ? (
                <Image
                  source={{ uri: profile.profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatarFallback, styles.avatarFallbackDark]}>
                  <UserIcon size={40} color="#e5e7eb" />
                </View>
              )}
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.textDark]}>
                    {stats.postCount || 0}
                  </Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>

                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() => setShowFriendsModal(true)}
                >
                  <Text style={[styles.statValue, styles.textDark]}>
                    {stats.friendsCount || 0}
                  </Text>
                  <Text style={styles.statLabel}>Friends</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.profileName, styles.textDark]}>
                {isBlocked ? "Catstagram User" : profile.name}
              </Text>

              {profile.bio && !isBlocked && (
                <Text style={[styles.profileBio, styles.textDark]}>
                  {profile.bio}
                </Text>
              )}
            </View>
          </View>

          {id === userId && !isBlocked && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton, styles.editButtonDark]}
                onPress={() => setShowEditModal(true)}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton, styles.deleteButtonDark]}
                onPress={() => setShowDeleteConfirm(true)}
              >
                <Text style={styles.buttonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <FriendProtectedContent
          userId={id}
          fallbackMessage="Only friends can view this user's posts and friends list"
        >
          {!isBlocked && (
            <View style={styles.postsContainer}>
              <Text style={[styles.sectionTitle, styles.textDark]}>
                User Posts
              </Text>
              <UserPosts userId={id} scrollEnabled={false} />
            </View>
          )}
        </FriendProtectedContent>
      </ScrollView>

      <FriendsListModal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        userId={id}
      />

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedProfile) => {
            setProfile(updatedProfile);
            setShowEditModal(false);
          }}
        />
      )}

      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.modalDark]}>
            <Text style={[styles.modalTitle, styles.textDark]}>
              Confirm Account Deletion
            </Text>
            <Text style={[styles.modalText, styles.textDark]}>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton, styles.deleteButtonDark]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.buttonText}>Delete Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, styles.cancelButtonDark]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SideNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: "#111827",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 70,
  },
  profileHeader: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeaderDark: {
    backgroundColor: "#1f2937",
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#3b82f6",
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackDark: {
    backgroundColor: "#374151",
  },
  profileDetails: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statItem: {
    marginRight: 24,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#9ca3af",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: "#3b82f6",
  },
  editButtonDark: {
    backgroundColor: "#2563eb",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  deleteButtonDark: {
    backgroundColor: "#dc2626",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  textDark: {
    color: "#f9fafb",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalDark: {
    backgroundColor: "#1f2937",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
  cancelButtonDark: {
    backgroundColor: "#4b5563",
  },
  postsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign:'center',
  },
});

export default Profile;
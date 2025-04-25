import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Ban } from 'lucide-react-native';
import FastImage from 'react-native-fast-image';
import { LinearGradient } from 'expo-linear-gradient';

const RequestCard = ({
  request,
  isSentRequest,
  onUnsend,
  onApprove,
  onDecline,
  loading,
}) => {
  const navigation = useNavigation();
  const userInfo = isSentRequest ? request.sentTo : request.sentBy;

  const getButtonConfig = () => {
    if (isSentRequest) {
      return [
        {
          text: loading ? "..." : "Unsend Request",
          onPress: () => onUnsend(request._id),
          style: styles.darkUnsendButton,
          textStyle: styles.buttonText,
        },
        {
          text: "View Profile",
          onPress: () => navigation.navigate('Profile', { userId: userInfo?._id }),
          style: styles.darkViewButton,
          textStyle: styles.buttonText,
        },
      ];
    } else {
      return [
        {
          text: loading ? "..." : "Approve",
          onPress: () => onApprove(request._id),
          style: styles.darkApproveButton,
          textStyle: styles.buttonText,
        },
        {
          text: loading ? "..." : "Decline",
          onPress: () => onDecline(request._id),
          style: styles.darkDeclineButton,
          textStyle: styles.buttonText,
        },
      ];
    }
  };

  const buttons = getButtonConfig();

  return (
    <LinearGradient
      colors={['#111827', '#4c1d95', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.cardContainer, { borderColor: '#7c3aed' }]}
    >
      <View style={styles.cardContent}>
        {userInfo.profileImage ? (
          <FastImage
            source={{ uri: userInfo.profileImage }}
            style={[styles.avatar, { borderColor: '#7c3aed' }]}
          />
        ) : (
          <View style={[styles.avatarFallback, styles.darkAvatarFallback, { borderColor: '#7c3aed' }]}>
            <User size={40} color="#e5e7eb" />
          </View>
        )}

        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile', { userId: userInfo?._id })}
          >
            <Text style={[styles.userName, styles.darkText]}>
              {userInfo?.name}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.userEmail}>
            {userInfo?.email}
          </Text>

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, button.style]}
                onPress={button.onPress}
                disabled={loading}
              >
                {loading && index === 0 ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={button.textStyle}>{button.text}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  darkAvatarFallback: {
    backgroundColor: '#4c1d95',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  darkText: {
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  darkApproveButton: {
    backgroundColor: '#059669',
  },
  darkDeclineButton: {
    backgroundColor: '#dc2626',
  },
  darkUnsendButton: {
    backgroundColor: '#d97706',
  },
  darkViewButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default RequestCard;
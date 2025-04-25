import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Home, Bookmark, Compass, User, PlusCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const SideNav = ({ user }) => {
  const navigation = useNavigation();
  
  const navItems = [
    { icon: Home, label: 'Home', link: 'Home' },
    { icon: Compass, label: 'Explore', link: 'ExploreFriends' },
    { icon: PlusCircle, label: 'Create Post', link: 'CreatePost', params: { id: user._id } },
    { icon: Bookmark, label: 'Saved', link: 'SavedPosts' },
  ];

  const renderProfileIcon = () => {
    if (user.profileImage) {
      return (
        <Image
          source={{ uri: user.profileImage }}
          style={styles.profileImage}
        />
      );
    } else {
      return (
        <View style={[
          styles.profileFallback,
          styles.lightProfileFallback
        ]}>
          <User size={24} color={'#d8b4fe'} />
        </View>
      );
    }
  };

  return (
    <View style={[
      styles.container,
      styles.darkContainer,
      isTablet ? styles.tabletContainer : styles.mobileContainer
    ]}>
      {isTablet && (
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => navigation.navigate('Profile', { id: user._id })}
        >
          <View style={styles.profileImageContainer}>
            {renderProfileIcon()}
          </View>
          <Text style={[styles.userName, styles.darkText ]}>
            {user.name}
          </Text>
        </TouchableOpacity>
      )}

      <View style={isTablet ? styles.tabletNavItems : styles.mobileNavItems}>
        {navItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.navItem,
              item.icon === PlusCircle ? styles.createPostButton : null,
              isTablet ? styles.tabletNavItem : styles.mobileNavItem
            ]}
            onPress={() => navigation.navigate(item.link, item.params)}
          >
            <item.icon 
              size={24} 
              color={
                item.icon === '#fff' 
              } 
            />
            {isTablet && (
              <Text 
                style={[
                  styles.navLabel,
                  item.icon === PlusCircle 
                    ? styles.createPostText 
                    : styles.darkText 
                                      ]}
              >
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {!isTablet && (
          <TouchableOpacity
            style={[styles.navItem, styles.mobileNavItem]}
            onPress={() => navigation.navigate('Profile', { id: user._id })}
          >
            <View style={styles.mobileProfileIcon}>
              {renderProfileIcon()}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: '#6b7280',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  tabletContainer: {
    height: '100%',
    paddingTop: 32,
    width: '100%',
  },
  mobileContainer: {
    height: 64,
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  profileFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  darkProfileFallback: {
    backgroundColor: '#4b5563',
    borderColor: '#6b7280',
  },
  lightProfileFallback: {
    backgroundColor: '#f3e8ff',
    borderColor: '#e9d5ff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },
  tabletNavItems: {
    width: '75%',
    alignSelf: 'center',
  },
  mobileNavItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'center',
  },
  navItem: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabletNavItem: {
    flexDirection: 'row',
    width: 176,
    height: 56,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  mobileNavItem: {
    width: 48,
    height: 48,
  },
  createPostButton: {
    backgroundColor: '#9333ea',
  },
  navLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  createPostText: {
    color: '#fff',
  },
  mobileProfileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SideNav;
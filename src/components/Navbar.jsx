import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LogOut, Users, Lock, Menu, X, UserPlus } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore.js';
import ChangePasswordModal from './ChangePasswordModal.jsx';

const Navbar = () => {
  const { logout } = useAuthStore();
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const handleChangePassword = () => {
    setChangePasswordOpen(true);
  };

  const handleCloseChangePassword = () => {
    setChangePasswordOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <View style={[styles.container, styles.darkContainer]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => navigation.navigate('Home')}
        >
          <Image 
            source={require('../../../assets/images/logo.jpg')} 
            style={styles.logo} 
          />
          <Text style={[styles.logoText, styles.darkText]}>
            Catstagram
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMobileMenu} style={styles.menuButton}>
          {isMobileMenuOpen ? 
            <X color="white" size={24} /> : 
            <Menu color="white" size={24} />}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isMobileMenuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMobileMenuOpen(false)}
      >
        <View style={[styles.modalContainer, styles.darkModal]}>
          <View style={styles.menuItems}>
            <TouchableOpacity 
              style={[styles.menuItem, styles.darkMenuItem]} 
              onPress={() => {
                navigation.navigate('Friends');
                setMobileMenuOpen(false);
              }}
            >
              <Users color="white" size={20} />
              <Text style={[styles.menuText, styles.darkText]}>My Friends</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.darkMenuItem]} 
              onPress={() => {
                navigation.navigate('FriendRequests');
                setMobileMenuOpen(false);
              }}
            >
              <UserPlus color="white" size={20} />
              <Text style={[styles.menuText, styles.darkText]}>Friend Requests</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.darkMenuItem]} 
              onPress={() => {
                handleChangePassword();
                setMobileMenuOpen(false);
              }}
            >
              <Lock color="white" size={20} />
              <Text style={[styles.menuText, styles.darkText]}>Change Password</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.darkMenuItem]} 
              onPress={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
            >
              <LogOut color="white" size={20} />
              <Text style={[styles.menuText, styles.darkText]}>Logout</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setMobileMenuOpen(false)}
          >
            <X color="white" size={24} />
          </TouchableOpacity>
        </View>
      </Modal>

      {isChangePasswordOpen && <ChangePasswordModal onClose={handleCloseChangePassword} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#6b7280',
    paddingHorizontal: 16,
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 24,
    marginLeft: 8,
    fontWeight: '500',
  },
  darkText: {
    color: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    marginTop: 80,
  },
  darkModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  menuItems: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 25,
    marginBottom: 12,
  },
  darkMenuItem: {
    backgroundColor: '#000',
  },
  menuText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
});

export default Navbar;
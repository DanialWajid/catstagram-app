import React from 'react';
import { View, StyleSheet } from 'react-native';
import CreatePostForm from '../../components/CreatePostForm';
import SideNav from "../../components/SideNav"; // adjust path
import Navbar from "../../components/Navbar";

const CreatePost = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Navbar/>
      <CreatePostForm navigation={navigation} />
      <SideNav/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingBottom:70,

  },
});

export default CreatePost;
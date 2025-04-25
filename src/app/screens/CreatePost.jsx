import React from 'react';
import { View, StyleSheet } from 'react-native';
import CreatePostForm from '../../components/CreatePostForm';

const CreatePost = () => {
  return (
    <View style={styles.container}>
      <CreatePostForm />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111827',
  },
});

export default CreatePost;
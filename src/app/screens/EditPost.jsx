import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import EditPostForm from '../../components/EditPostForm';

const EditPost = () => {
  const route = useRoute();
  const { id } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://192.168.100.165:8000/api/posts/edit/${id}`);
        if (response.data.success) {
          setPost(response.data.post);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Failed to load post data.");
        console.error("Error fetching post data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {post && <EditPostForm post={post} />}
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
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EditPost;
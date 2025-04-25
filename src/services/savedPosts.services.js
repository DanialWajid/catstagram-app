import axios from "axios";

const API_URL ="http://192.168.100.165:8000/api/saved-posts"

export const savePost = async (userId, postId) => {
  try {
    const response = await axios.post(`${API_URL}/save`, {
      userId,
      postId,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving post:", error);
    throw error;
  }
};

export const unsavePost = async (userId, postId) => {
  try {
    const response = await axios.post(`${API_URL}/unsave`, {
      userId,
      postId,
    });
    return response.data;
  } catch (error) {
    console.error("Error unsaving post:", error);
    throw error;
  }
};

export const getSavedPosts = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    throw error;
  }
};

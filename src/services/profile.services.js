import axios from "axios";

const API_URL ="http://192.168.100.165:8000/api/profile"

export const updateProfile = async (formData, id) => {
  try {
    console.log("Update "+id);
    const response = await axios.put(
      `${API_URL}/update-profile/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const getProfileById = async (id) => {
  
  try {
    console.log("GetByID "+id);
    const response = await axios.get(`${API_URL}/getProfile/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting profile by ID:", error);
    throw error;
  }
};

export const getUserStats = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/stats/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting user stats:", error);
    throw error;
  }
};

export const deleteAccount = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/delete-account/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

export const checkIfBlocked = async (userId, profileId) => {
  try {
    const response = await axios.get(`${API_URL}/check-blocked/${userId}/${profileId}`);
    return response.data.isBlocked; // Assuming the backend returns an object with `isBlocked` boolean
  } catch (error) {
    console.error("Error checking if blocked:", error);
    throw error;
  }
};

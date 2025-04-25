import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import RequestCard from '../../components/RequestCard';
import { useAuthStore } from '../../store/authStore';
import { Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Requests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const API_URL = "http://192.168.100.165:8000/api/friends";

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const receivedResponse = await axios.get(`${API_URL}/requests/pending`);
      setReceivedRequests(receivedResponse.data);
      setFilteredRequests(receivedResponse.data);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    const term = text.toLowerCase();
    setSearchTerm(term);
    const filtered = receivedRequests.filter((request) =>
      request.sentBy.name.toLowerCase().includes(term)
    );
    setFilteredRequests(filtered);
  };

  const handleApproveRequest = async (requestId) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/request/approve/${requestId}`);
      fetchRequests();
    } catch (error) {
      console.error("Error approving friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/request/decline/${requestId}`);
      fetchRequests();
    } catch (error) {
      console.error("Error declining friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderRequestItem = ({ item }) => (
    <RequestCard
      key={item._id}
      request={item}
      isSentRequest={false}
      onApprove={() => handleApproveRequest(item._id)}
      onDecline={() => handleDeclineRequest(item._id)}
      loading={loading}
    />
  );

  return (
    <View style={[styles.container, styles.containerDark]}>
      <LinearGradient
        colors={['#10b981', '#0ea5e9', '#6366f1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerText}>Pending Friend Requests</Text>
      </LinearGradient>

      <View style={[styles.searchContainer, styles.searchContainerDark]}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, styles.inputDark]}
          placeholder="Search requests by name..."
          placeholderTextColor="#9ca3af"
          value={searchTerm}
          onChangeText={handleSearchChange}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a78bfa" />
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Requests Found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  headerGradient: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchContainerDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  inputDark: {
    color: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default Requests;
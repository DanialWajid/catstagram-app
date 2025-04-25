import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import Home from './screens/Home';
import Profile from './screens/Profile';
import Friends from './screens/Friends';
import FriendsExplore from './screens/FriendsExplore';
import FriendsList from './screens/FriendsList';
import Requests from './screens/Requests';
import CreatePost from './screens/CreatePost';
import EditPost from './screens/EditPost';
import SavedPosts from './screens/SavedPosts';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Login" // Set your default screen here
      >
        {/* Authentication Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        
        {/* Main App Screens */}
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen 
    name="Profile" 
    component={Profile} 
    options={({ route }) => ({ title: route.params?.name || 'Profile' })}
  />
        <Stack.Screen name="Friends" component={Friends} />
        <Stack.Screen name="FriendsExplore" component={FriendsExplore} />
        <Stack.Screen name="FriendsList" component={FriendsList} />
        <Stack.Screen name="Requests" component={Requests} />
        <Stack.Screen name="CreatePost" component={CreatePost} />
        <Stack.Screen name="EditPost" component={EditPost} />
        <Stack.Screen name="SavedPosts" component={SavedPosts} />
      </Stack.Navigator>
  );
};

export default App;
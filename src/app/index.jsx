import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./screen/login";
import Home from "./screen/home";
import Signup from "./screen/signup";
import ForgetPassword from "./screen/forgetPassword";
import Verification from "./screen/verification";
import SavedPosts from "./screen/SavedPosts";
import FriendsExplore from "./screen/FriendsExplore";
import Profile from "./screen/profile";
import EditPost from "./screen/EditPost";
import CreatePost from "./screen/CreatePost";
import Friends from "./screen/Friends";
import Requests from "./screen/Requests";
import { useAuthStore } from "../store/authStore";

const Stack = createNativeStackNavigator();

const App = () => {
  const {isAuthenticated} = useAuthStore();
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated?'Home':'Login'}
    >
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="Friends" component={Friends} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
      <Stack.Screen name="Verification" component={Verification} />
      <Stack.Screen name="SavedPosts" component= {SavedPosts} />
      <Stack.Screen name="ExploreFriends" component= {FriendsExplore} />
      <Stack.Screen name="FriendRequests" component= {Requests} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen 
      name="Profile" 
      component={Profile} 
      options={({ route }) => ({ title: route.params?.name || 'Profile' })}
    />
    <Stack.Screen 
      name="EditPost" 
      component={EditPost} 
      options={({ route }) => ({ title: route.params?.name || 'EditPost' })}
    />
    </Stack.Navigator>
  );
};

export default App;

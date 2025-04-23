"use client";

import { useState } from "react";
import { registerRootComponent } from "expo";
import Login from "./screen/login";
import Home from "./screen/home";
import Signup from "./screen/signup";
import ForgetPassword from "./screen/forgetPassword";
import Verification from "./screen/verification";

const App = () => {
  // State to track whether user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to handle login
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Function to handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Render Login or Home based on login state
  return isLoggedIn ? (
    <Home onLogout={handleLogout} />
  ) : (
    <Signup />
    // <ForgetPassword />
    // <Verification />
    // <Login onLogin={handleLogin} />
  );
};

// Register and also export App as default
registerRootComponent(App);
export default App;

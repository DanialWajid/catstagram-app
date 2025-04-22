// index.jsx
import React from "react";
import { registerRootComponent } from "expo";
import Login from "./login";
import Home from "./home";

const App = () => {
  return <Login />;
};

// Register and also export App as default
registerRootComponent(App);
export default App;

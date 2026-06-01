import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import UsersScreen from "./UsersScreen";

export default function HomeScreen() {
  const handleLogout = async () => {
    await signOut(auth);
  };

 return <UsersScreen />;
}
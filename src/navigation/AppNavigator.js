import React, { useEffect, useState } from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../firebase";

import AuthNavigator from "./AuthNavigator";

import UsersScreen from "../screens/UsersScreen";
import ChatScreen from "../screens/ChatScreen";
import { TouchableOpacity, Text, Alert } from "react-native";
import { signOut } from "firebase/auth";
import {
    updateDoc,
    doc,
} from "firebase/firestore";

import { db } from "../../firebase";
import CreateGroupScreen from "@/screens/CreateGroupScreen";
import GroupChatScreen from "@/screens/GroupChatScreen";
import HomeTabs from "./HomeTabs";
import { SimpleLineIcons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return unsubscribe;
    }, []);

    return (
        <NavigationContainer>
            {user ? (
                <Stack.Navigator>

                    <Stack.Screen
                        name="Chats"
                        component={HomeTabs}
                        options={{
                            headerRight: () => (
                                <TouchableOpacity
                                    onPress={() => {

                                        Alert.alert(
                                            "Logout",
                                            "Are you sure you want to logout?",
                                            [
                                                {
                                                    text: "Cancel",
                                                    style: "cancel",
                                                },
                                                {
                                                    text: "Logout",
                                                    style: "destructive",

                                                    onPress: async () => {

                                                        console.log("Logging out...");

                                                        await updateDoc(
                                                            doc(
                                                                db,
                                                                "users",
                                                                auth.currentUser.uid
                                                            ),
                                                            {
                                                                isOnline: false,
                                                                lastSeen: Date.now(),
                                                            }
                                                        );

                                                        await signOut(auth);

                                                    },
                                                },
                                            ]
                                        );

                                    }}
                                >
                                    <SimpleLineIcons name="logout" size={21} color="red" />
                                </TouchableOpacity>
                            ),
                        }}
                    />

                    <Stack.Screen
                        name="Chat"
                        component={ChatScreen}
                    />

                    <Stack.Screen
                        name="CreateGroup"
                        component={CreateGroupScreen}
                    />

                    <Stack.Screen
                        name="GroupChat"
                        component={GroupChatScreen}
                    />

                </Stack.Navigator>
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
}
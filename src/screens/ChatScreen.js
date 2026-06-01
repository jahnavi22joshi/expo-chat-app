import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ImageBackground } from "react-native";
import { db, auth } from "../../firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { getDocs } from "firebase/firestore";

import {
    updateDoc,
    doc,
    deleteDoc,
    setDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import {
    sendLocalNotification,
} from "../utils/notifications";

export default function ChatScreen({ route, navigation }) {
    const { user } = route.params;

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const currentUserId = auth.currentUser.uid;

    const usersIds = [currentUserId, user.uid];

    const [userStatus, setUserStatus] = useState(null);
    const [typingStatus, setTypingStatus] = useState({});

    usersIds.sort();

    const chatId = usersIds.join("_");

    // 🔥 Listen messages in real-time
    useEffect(() => {

        const q = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("createdAt", "asc")
        );

        const unsubscribeTyping = onSnapshot(
            doc(db, "chats", chatId),
            (snapshot) => {

                if (snapshot.exists()) {
                    setTypingStatus(snapshot.data().typing || {});
                }

            }
        );

        // 🔥 messages listener
        const unsubscribe = onSnapshot(q, (snapshot) => {

            const msgs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setMessages(msgs);

            snapshot.docs.forEach(async (messageDoc) => {

                const messageData = messageDoc.data();

                // only received messages
                if (
                    messageData.receiverId === auth.currentUser.uid &&
                    messageData.seen === false
                ) {

                    await updateDoc(
                        doc(
                            db,
                            "chats",
                            chatId,
                            "messages",
                            messageDoc.id
                        ),
                        {
                            seen: true,
                        }
                    );

                }

            });

        });

        // 🔥 USER ONLINE STATUS LISTENER
        const unsubscribeUser = onSnapshot(
            doc(db, "users", user.uid),
            (snapshot) => {

                setUserStatus(snapshot.data());

            }
        );

        // 🔥 cleanup
        return () => {
            unsubscribe();
            unsubscribeUser();
            unsubscribeTyping();
        };

    }, []);

    useEffect(() => {

        navigation.setOptions({
            title: user.email,

            headerTitle: () => (
                <View>
                    <Text
                        style={{
                            fontWeight: "bold",
                            fontSize: 16,
                        }}
                    >
                        {user.email}
                    </Text>

                    <Text
                        style={{
                            color: "gray",
                            fontSize: 12,
                        }}
                    >
                        {typingStatus[user.uid]
                            ? "Typing..."
                            : userStatus?.isOnline
                                ? "Online"
                                : "Offline"}
                    </Text>
                </View>
            ),
        });

    }, [userStatus]);

    // 📩 Send message
    const sendMessage = async () => {
        if (!message.trim()) return;

        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: message,
            senderId: auth.currentUser.uid,
            receiverId: user.uid,
            createdAt: Date.now(),
            seen: false,
        });

        setMessage("");
    };

    const clearChat = async () => {
        try {

            const snapshot = await getDocs(
                collection(db, "chats", chatId, "messages")
            );

            const promises = snapshot.docs.map((messageDoc) =>
                deleteDoc(
                    doc(
                        db,
                        "chats",
                        chatId,
                        "messages",
                        messageDoc.id
                    )
                )
            );

            await Promise.all(promises);

        } catch (error) {
            console.log(error);
        }
    };

    const formatTime = (timestamp) => {

        const date = new Date(timestamp);

        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    };

    return (
        // <ImageBackground
        //     source={require("../../assets/chatBg.jpg")}
        //     style={{ flex: 1 }}
        //     resizeMode="cover"
        // >
        <KeyboardAvoidingView
            style={{ flex: 1, }}
            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : "height"
            }
            keyboardVerticalOffset={90}
        >
            <View style={{ flex: 1, padding: 10 }}>

                <TouchableOpacity
                    onPress={clearChat}
                    style={{
                        backgroundColor: "red",
                        padding: 10,
                        margin: 10,
                        borderRadius: 10,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: "#fff" }}>
                        Clear Chat
                    </Text>
                </TouchableOpacity>

                {/* Messages */}
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {

                        const isMyMessage =
                            item.senderId === auth.currentUser.uid;

                        return (
                            <View
                                style={{
                                    alignSelf: isMyMessage
                                        ? "flex-end"
                                        : "flex-start",

                                    backgroundColor: isMyMessage
                                        ? "#8ED8F8"
                                        : "#E5E5EA",

                                    padding: 10,
                                    marginVertical: 5,
                                    borderRadius: 10,
                                    maxWidth: "75%",
                                }}
                            >

                                <Text
                                    style={{
                                        color: isMyMessage ? "#fff" : "#000",
                                        fontSize: 16,
                                    }}
                                >
                                    {item.text}
                                </Text>

                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        alignSelf: "flex-end",
                                        marginTop: 5,
                                    }}
                                >

                                    <Text
                                        style={{
                                            color: isMyMessage ? "#ddd" : "gray",
                                            fontSize: 11,
                                            marginRight: 4,
                                        }}
                                    >
                                        {formatTime(item.createdAt)}
                                    </Text>

                                    {isMyMessage && (
                                        <Ionicons
                                            name="checkmark-done"
                                            size={16}
                                            color={item.seen ? "#34B7F1" : "#ddd"}
                                        />
                                    )}

                                </View>

                            </View>
                        );
                    }}
                />

                {/* Input */}
                <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <TextInput
                        value={message}
                        onChangeText={async (text) => {

                            setMessage(text);

                            await setDoc(
                                doc(db, "chats", chatId),
                                {
                                    typing: {
                                        [auth.currentUser.uid]: text.length > 0,
                                    },
                                },
                                { merge: true }
                            );

                            await sendLocalNotification(
                                user.email,
                                message
                            );

                        }}
                        placeholder="Type message..."
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            padding: 10,
                            borderRadius: 8,
                        }}
                    />

                    <TouchableOpacity
                        onPress={sendMessage}
                        style={{
                            backgroundColor: "#8ED8F8",
                            padding: 10,
                            marginLeft: 5,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ color: "white" }}>Send</Text>
                    </TouchableOpacity>
                </View>

            </View></KeyboardAvoidingView>
        // </ImageBackground>


    );
}
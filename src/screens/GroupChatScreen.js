import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

export default function GroupChatScreen({
  route,
}) {

  const { group } = route.params;

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  useEffect(() => {

    const q = query(
      collection(
        db,
        "groups",
        group.id,
        "messages"
      ),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {

        const msgs = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setMessages(msgs);

      }
    );

    return unsubscribe;

  }, []);

  const sendMessage = async () => {

    if (!message.trim()) return;

    await addDoc(
      collection(
        db,
        "groups",
        group.id,
        "messages"
      ),
      {
        text: message,

        senderId:
          auth.currentUser.uid,

        senderEmail:
          auth.currentUser.email,

        createdAt: serverTimestamp(),
        status: "sent",
      }
    );

    setMessage("");

  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, }}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={90}
    >
      <View style={{ flex: 1 }}>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 10,
          }}
          renderItem={({ item }) => {

            const isMyMessage =
              item.senderId ===
              auth.currentUser.uid;

            return (

              <View
                style={{
                  alignSelf: isMyMessage
                    ? "flex-end"
                    : "flex-start",

                  backgroundColor:
                    isMyMessage
                      ? "#8ED8F8"
                      : "#E5E5EA",

                  padding: 10,
                  borderRadius: 10,
                  marginBottom: 10,
                  maxWidth: "80%",
                }}
              >

                {!isMyMessage && (
                  <Text
                    style={{
                      fontWeight: "bold",
                      marginBottom: 5,
                      color: "#333",
                    }}
                  >
                    {item.senderEmail}
                  </Text>
                )}

                <Text
                  style={{
                    color: isMyMessage
                      ? "#fff"
                      : "#000",
                  }}
                >
                  {item.text}
                </Text>

              </View>

            );

          }}
        />

        <View
          style={{
            flexDirection: "row",
            padding: 10,
          }}
        >

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type message"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              paddingHorizontal: 10,
              marginRight: 10,
            }}
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={{
              backgroundColor: "#8ED8F8",
              padding: 15,
              borderRadius: 10,
            }}
          >

            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              Send
            </Text>

          </TouchableOpacity>

        </View>

      </View>
    </KeyboardAvoidingView>

  );
}
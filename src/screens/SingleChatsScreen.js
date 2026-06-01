import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../../firebase";

export default function SingleChatsScreen({
  navigation,
}) {

  const [users, setUsers] = useState([]);

  const [unreadCounts, setUnreadCounts] =
    useState({});

  const [lastMessages, setLastMessages] =
    useState({});

  useEffect(() => {

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {

        const usersList = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        const filteredUsers =
          usersList.filter(
            (user) =>
              user.uid !==
              auth.currentUser.uid
          );

        setUsers(filteredUsers);

        filteredUsers.forEach((user) => {

          const currentUserId =
            auth.currentUser.uid;

          const chatId = [
            currentUserId,
            user.uid,
          ]
            .sort()
            .join("_");

          onSnapshot(
            collection(
              db,
              "chats",
              chatId,
              "messages"
            ),
            (snapshot) => {

              const unreadMessages =
                snapshot.docs.filter(
                  (doc) => {

                    const msg =
                      doc.data();

                    return (
                      msg.receiverId ===
                        currentUserId &&
                      msg.seen === false
                    );

                  }
                );

              setUnreadCounts((prev) => ({
                ...prev,
                [user.uid]:
                  unreadMessages.length,
              }));

            }
          );

          onSnapshot(
            query(
              collection(
                db,
                "chats",
                chatId,
                "messages"
              ),
              orderBy(
                "createdAt",
                "desc"
              ),
              limit(1)
            ),
            (snapshot) => {

              if (!snapshot.empty) {

                const lastMsg =
                  snapshot.docs[0].data();

                setLastMessages((prev) => ({
                  ...prev,
                  [user.uid]:
                    lastMsg.text,
                }));

              }

            }
          );

        });

      }
    );

    return unsubscribe;

  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "Chat",
                {
                  user: item,
                }
              )
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              backgroundColor: "#fff",
              marginBottom: 10,
              borderRadius: 15,
              elevation: 2,
            }}
          >

            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor:
                  "#8ED8F8",

                justifyContent:
                  "center",

                alignItems:
                  "center",
              }}
            >

              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {item.email
                  .charAt(0)
                  .toUpperCase()}
              </Text>

            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 15,
              }}
            >

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {item.email}
              </Text>

              <Text
                style={{
                  color: "gray",
                  marginTop: 3,
                }}
              >
                {lastMessages[
                  item.uid
                ] ||
                  "No messages yet"}
              </Text>

            </View>

            {unreadCounts[
              item.uid
            ] > 0 && (
              <View
                style={{
                  backgroundColor:
                    "green",

                  minWidth: 25,
                  height: 25,

                  borderRadius: 20,

                  justifyContent:
                    "center",

                  alignItems:
                    "center",

                  paddingHorizontal: 6,
                }}
              >

                <Text
                  style={{
                    color: "#fff",
                    fontWeight:
                      "bold",
                  }}
                >
                  {
                    unreadCounts[
                      item.uid
                    ]
                  }
                </Text>

              </View>
            )}

          </TouchableOpacity>

        )}
      />

    </View>
  );
}
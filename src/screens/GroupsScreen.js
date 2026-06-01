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
} from "firebase/firestore";

import {
  db,
  auth,
} from "../../firebase";

export default function GroupsScreen({
  navigation,
}) {

  const [groups, setGroups] =
    useState([]);

  useEffect(() => {

    const unsubscribeGroups =
      onSnapshot(
        collection(db, "groups"),
        (snapshot) => {

          const groupsList =
            snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter((group) =>
                group.members.includes(
                  auth.currentUser.uid
                )
              );

          setGroups(groupsList);

        }
      );

    return unsubscribeGroups;

  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "CreateGroup"
          )
        }
        style={{
          backgroundColor:
            "#8ED8F8",

          padding: 15,

          borderRadius: 10,

          alignItems: "center",

          marginBottom: 15,
        }}
      >

        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          Create Group
        </Text>

      </TouchableOpacity>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                "GroupChat",
                {
                  group: item,
                }
              )
            }
            style={{
              padding: 15,
              backgroundColor:
                "#DCF8C5",

              borderRadius: 10,

              marginBottom: 10,
            }}
          >

            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              👥 {item.name}
            </Text>

          </TouchableOpacity>

        )}
      />

    </View>
  );
}
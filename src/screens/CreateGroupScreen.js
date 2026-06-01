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

import { auth, db } from "../../firebase";

import {
    TextInput,
    Alert,
} from "react-native";

import {
    addDoc,
} from "firebase/firestore";

export default function CreateGroupScreen() {

    const [users, setUsers] = useState([]);

    const [selectedUsers, setSelectedUsers] =
        useState([]);

    const [groupName, setGroupName] =
        useState("");

    const [groups, setGroups] = useState([]);


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
                            user.uid !== auth.currentUser.uid
                    );

                setUsers(filteredUsers);

            }
        );

        const unsubscribeGroups = onSnapshot(
            collection(db, "groups"),
            (snapshot) => {

                const groupsList = snapshot.docs
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

        return () => {
            unsubscribe();
            unsubscribeGroups();
        };

    }, []);

    const toggleSelectUser = (userId) => {

        if (selectedUsers.includes(userId)) {

            setSelectedUsers(
                selectedUsers.filter(
                    (id) => id !== userId
                )
            );

        } else {

            setSelectedUsers([
                ...selectedUsers,
                userId,
            ]);

        }

    };

    const createGroup = async () => {

        if (!groupName.trim()) {
            Alert.alert(
                "Enter group name"
            );
            return;
        }

        if (selectedUsers.length === 0) {
            Alert.alert(
                "Select at least one member"
            );
            return;
        }

        try {

            await addDoc(
                collection(db, "groups"),
                {
                    name: groupName,

                    members: [
                        auth.currentUser.uid,
                        ...selectedUsers,
                    ],

                    createdBy:
                        auth.currentUser.uid,

                    createdAt: Date.now(),
                }
            );

            Alert.alert(
                "Success",
                "Group created"
            );

            setGroupName("");
            setSelectedUsers([]);

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={{ flex: 1, padding: 15 }}>

            <TextInput
                placeholder="Enter Group Name"
                value={groupName}
                onChangeText={setGroupName}
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 15,
                }}
            />

            <TouchableOpacity
                onPress={createGroup}
                style={{
                    backgroundColor: "#8ED8F8",
                    padding: 15,
                    borderRadius: 10,
                    alignItems: "center",
                    marginBottom: 20,
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

            {/* <Text
                style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 10,
                    marginTop: 10,
                }}
            >
                Groups
            </Text>

            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (

                    <TouchableOpacity
                        style={{
                            padding: 15,
                            backgroundColor: "#DCF8C5",
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
            /> */}

            <FlatList
                data={users}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => {

                    const isSelected =
                        selectedUsers.includes(item.uid);

                    return (

                        <TouchableOpacity
                            onPress={() =>
                                toggleSelectUser(item.uid)
                            }
                            style={{
                                padding: 15,
                                backgroundColor: isSelected
                                    ? "#DCF8C5"
                                    : "#fff",

                                marginBottom: 10,
                                borderRadius: 10,
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

                        </TouchableOpacity>

                    );

                }}
            />

        </View>
    );
}
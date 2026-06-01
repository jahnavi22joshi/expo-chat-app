import React, { useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Alert,
} from "react-native";

import {
    createUserWithEmailAndPassword,
} from "firebase/auth";

import {
    doc,
    setDoc,
} from "firebase/firestore";

import {
    Feather,
} from "@expo/vector-icons";

import {
    auth,
    db,
} from "../../firebase";

export default function SignupScreen({
    navigation,
}) {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const handleSignup = async () => {

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user =
                userCredential.user;

            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {
                    uid: user.uid,
                    email: email,

                    isOnline: true,
                    lastSeen: Date.now(),
                }
            );

            console.log("User saved!");

        } catch (error) {

            let errorMessage =
                "Something went wrong";

            if (
                error.code ===
                "auth/invalid-email"
            ) {

                errorMessage =
                    "Please enter a valid email address";

            }

            else if (
                error.code ===
                "auth/user-not-found"
            ) {

                errorMessage =
                    "Account not found";

            }

            else if (
                error.code ===
                "auth/wrong-password"
            ) {

                errorMessage =
                    "Incorrect password";

            }

            else if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                errorMessage =
                    "This email is already registered";

            }

            else if (
                error.code ===
                "auth/weak-password"
            ) {

                errorMessage =
                    "Password must be at least 6 characters";

            }

            else if (
                error.code ===
                "auth/missing-password"
            ) {

                errorMessage =
                    "Please enter password";

            }

            else if (
                error.code ===
                "auth/invalid-credential"
            ) {

                errorMessage =
                    "Invalid email or password";

            }

            Alert.alert(
                "Error",
                errorMessage
            );

        }

    };

    return (

        <SafeAreaView style={styles.container}>

            <StatusBar
                barStyle="dark-content"
            />

            <View style={styles.innerContainer}>

                <Text style={styles.heading}>
                    Sign Up
                </Text>

                <Text style={styles.subHeading}>
                    Create an account for learning the firebase in react native expo
                </Text>

                {/* Email */}

                <View style={styles.inputBox}>

                    <Feather
                        name="mail"
                        size={24}
                        color="#555"
                    />

                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                    />

                </View>

                {/* Password */}

                <View style={styles.inputBox}>

                    <Feather
                        name="lock"
                        size={24}
                        color="#555"
                    />

                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        style={styles.input}
                    />

                    <TouchableOpacity
                        onPress={() =>
                            setShowPassword(
                                !showPassword
                            )
                        }
                    >

                        <Feather
                            name={
                                showPassword
                                    ? "eye-off"
                                    : "eye"
                            }
                            size={22}
                            color="#555"
                        />

                    </TouchableOpacity>

                </View>

                {/* Button */}

                <TouchableOpacity
                    onPress={handleSignup}
                    style={styles.button}
                >

                    <Text style={styles.buttonText}>
                        CREATE
                    </Text>

                </TouchableOpacity>

                {/* Footer */}

                <View style={styles.footer}>

                    <Text style={styles.footerText}>
                        Already have an account?
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate(
                                "Login"
                            )
                        }
                    >

                        <Text style={styles.loginText}>
                            Login here
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },

    innerContainer: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 30,
    },

    heading: {
        fontSize: 40,
        fontWeight: "bold",
        textAlign: "center",
        color: "#000",
    },

    subHeading: {
        textAlign: "center",
        color: "#666",
        fontSize: 18,
        marginTop: 10,
        marginBottom: 35,
        lineHeight: 26,
    },

    inputBox: {
        height: 50,
        backgroundColor: "#EFEFEF",
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 25,
    },

    input: {
        flex: 1,
        marginLeft: 15,
        fontSize: 18,
        color: "#000",
    },

    button: {
        height: 50,
        backgroundColor: "#8ED8F8",
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",

        shadowOffset: {
            width: 0,
            height: 5,
        },

        shadowOpacity: 0.2,
        shadowRadius: 6,

        elevation: 5,

        marginTop: 10,
    },

    buttonText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },

    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 40,
    },

    footerText: {
        color: "#666",
        fontSize: 18,
    },

    loginText: {
        color: "#8ED8F8",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 6,
    },

});
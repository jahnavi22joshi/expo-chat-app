import React from "react";

import {
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";

import SingleChatsScreen
  from "../screens/SingleChatsScreen";

import GroupsScreen
  from "../screens/GroupsScreen";

const Tab =
  createMaterialTopTabNavigator();

export default function HomeTabs() {

  return (

    <Tab.Navigator
      screenOptions={{

        tabBarActiveTintColor:
          "#fff",

        tabBarInactiveTintColor:
          "#555",

        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "bold",
          textTransform: "none",
        },

        tabBarStyle: {
          backgroundColor: "#F4F4F4",

          elevation: 0,

          shadowOpacity: 0,

          borderBottomWidth: 1,
          borderBottomColor: "#ddd",
        },

        tabBarIndicatorStyle: {
          backgroundColor: "#8ED8F8",

          height: "90%",

          borderRadius: 12,

          marginBottom: 2,
          width: "90%",
        },

        tabBarIndicatorContainerStyle: {
          marginHorizontal: 10,
        },

        tabBarItemStyle: {
          borderRadius: 12,
          overflow: "hidden",
        },

      }}
    >

      <Tab.Screen
        name="Single Chats"
        component={SingleChatsScreen}
      />

      <Tab.Screen
        name="Group Chats"
        component={GroupsScreen}
      />

    </Tab.Navigator>

  );

}
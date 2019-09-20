import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "native-base";
import firebase from "react-native-firebase";
import Icon from "react-native-vector-icons/FontAwesome5";

export default class ProfileScreen extends Component {
  state = {};

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
      <Icon size={20} color={tintColor} name="user-circle" />
    )
  };

  render() {
    return (
      <View style={styles.container}>
        <Button onPress={() => firebase.auth().signOut()}>
          <Text>Sign Out</Text>
        </Button>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

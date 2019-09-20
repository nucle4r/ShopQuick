import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';

export default class AuthLoadingScreen extends Component {
  componentDidMount = async () => {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const userdata = await AsyncStorage.getItem('USERDATA');
        if (userdata !== null) {
          let data = JSON.parse(userdata);
          if (data.gender == null) {
            this.props.navigation.navigate('Middle');
          } else {
            this.props.navigation.navigate('App');
          }
        }
      } else {
        this.props.navigation.navigate('Auth');
      }
    });
  };

  render() {
    return <ActivityIndicator style={styles.container} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

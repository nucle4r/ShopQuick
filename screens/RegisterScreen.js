import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'react-native-firebase';
import {} from 'react-native-gesture-handler';

export default class RegisterScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    errorMessage: null,
  };
  avatarThumbnail =
    'https://firebasestorage.googleapis.com/v0/b/shopquick-20.appspot.com/o/assets%2Favatar.png?alt=media&token=20a9835f-07c2-41dd-af66-ecf821ecc70a';

  storeUser = async uid => {
    const userdata = await AsyncStorage.getItem('USERDATA');
    if (userdata !== null) {
      this.props.navigation.navigate('AuthStack');
    } else {
      firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .get()
        .then(async doc => {
          await AsyncStorage.setItem(
            'USERDATA',
            JSON.stringify({
              id: doc.id,
              email: doc.data().email,
              first_name: doc.data().first_name,
              last_name: doc.data().last_name,
              profile_picture: doc.data().profile_picture,
              gender: doc.data().gender,
              favCats: doc.data().favCats,
            }),
          );
        })
        .then(this.props.navigation.navigate('AuthStack'));
    }
  };

  handleSignUp = async () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(async userCredentials => {
        await userCredentials.user.updateProfile({
          displayName: `${this.state.firstName + ' ' + this.state.lastName}`,
        }),
          await firebase
            .firestore()
            .collection('users')
            .doc(userCredentials.user.uid)
            .set({
              email: userCredentials.user.email,
              profile_picture: this.avatarThumbnail,
              first_name: this.state.firstName,
              last_name: this.state.lastName,
              gender: null,
              favCats: null,
              created_at: firebase.firestore.FieldValue.serverTimestamp(),
            }),
          await this.storeUser(userCredentials.user.uid);
      })
      .catch(error => this.setState({errorMessage: error.message}));
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <TouchableOpacity
            style={styles.back}
            onPress={() => this.props.navigation.goBack()}>
            <Icon name="ios-arrow-round-back" size={32} color="#000"></Icon>
          </TouchableOpacity>
          <View
            style={{
              position: 'absolute',
              top: 25,
              alignItems: 'center',
              width: '100%',
            }}>
            <Text
              style={styles.greeting}>{`Hello!\nSign up to get started.`}</Text>
          </View>

          <View style={styles.errorMessage}>
            {this.state.errorMessage && (
              <Text style={styles.error}>{this.state.errorMessage}</Text>
            )}
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.inputTitle}>First Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={firstName => this.setState({firstName})}
                value={this.state.firstName}></TextInput>
            </View>
            <View style={{marginTop: 32}}>
              <Text style={styles.inputTitle}>Last Name</Text>
              <TextInput
                style={styles.input}
                onChangeText={lastName => this.setState({lastName})}
                value={this.state.lastName}></TextInput>
            </View>

            <View style={{marginTop: 32}}>
              <Text style={styles.inputTitle}>Email Address</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                onChangeText={email => this.setState({email})}
                value={this.state.email}></TextInput>
            </View>

            <View style={{marginTop: 32}}>
              <Text style={styles.inputTitle}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                onChangeText={password => this.setState({password})}
                value={this.state.password}></TextInput>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
            <Text style={{color: '#FFF', fontWeight: '500'}}>Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{alignSelf: 'center', marginTop: 32}}
            onPress={() => this.props.navigation.navigate('SignIn')}>
            <Text style={{color: '#414959', fontSize: 13}}>
              Already have an account?{' '}
              <Text style={{fontWeight: '500', color: '#E9446A'}}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000',
  },
  form: {
    marginVertical: 35,
    marginHorizontal: 30,
  },
  inputTitle: {
    color: '#8A8F9E',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 40,
    fontSize: 15,
    color: '#161F3D',
  },
  button: {
    marginHorizontal: 30,
    backgroundColor: '#E9446A',
    borderRadius: 4,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  error: {
    color: '#E9446A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  back: {
    position: 'absolute',
    top: 32,
    left: 32,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(21, 22, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: '#E1E2E6',
    borderRadius: 50,
    marginTop: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

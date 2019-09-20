import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
// import { AccessToken, LoginManager } from "react-native-fbsdk";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from 'react-native-google-signin';
import firebase from 'react-native-firebase';

export default class SignInScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    email: '',
    password: '',
    errorMessage: null,
    loggedUID: null,
  };
  componentDidMount = async () => {
    GoogleSignin.configure({
      webClientId:
        '558161133303-26e41jdi4jppbed55cniav0b5ca3jan8.apps.googleusercontent.com',
    });
  };

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

  handleLogin = () => {
    const {email, password} = this.state;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(async result => {
        await firebase
          .firestore()
          .collection('users')
          .doc(result.user.uid)
          .update({
            last_logged_in: Date.now(),
          }),
          await this.storeUser(result.user.uid);
      })
      .catch(error => this.setState({errorMessage: error.message}));
  };
  //   facebookLogin = async () => {
  //     try {
  //       const result = await LoginManager.logInWithReadPermissions([
  //         "public_profile",
  //         "email"
  //       ]);

  //       if (result.isCancelled) {
  //         // handle this however suites the flow of your app
  //         throw new Error("User cancelled request");
  //       }

  //       console.log(
  //         `Login success with permissions: ${result.grantedPermissions.toString()}`
  //       );

  //       // get the access token
  //       const data = await AccessToken.getCurrentAccessToken();

  //       if (!data) {
  //         // handle this however suites the flow of your app
  //         throw new Error(
  //           "Something went wrong obtaining the users access token"
  //         );
  //       }

  //       // create a new firebase credential with the token
  //       const credential = firebase.auth.FacebookAuthProvider.credential(
  //         data.accessToken
  //       );

  //       // login with credential
  //       const firebaseUserCredential = await firebase
  //         .auth()
  //         .signInWithCredential(credential);

  //       console.warn(JSON.stringify(firebaseUserCredential.user.toJSON()));
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   };

  //https://shopquick-20.firebaseapp.com/__/auth/handler

  _googleLogin = async () => {
    try {
      // add any configuration settings here:

      await GoogleSignin.hasPlayServices();
      console.log('hello');

      const data = await GoogleSignin.signIn();

      console.log('hello' + data.accessToken);

      // create a new firebase credential with the token
      const credential = firebase.auth.GoogleAuthProvider.credential(
        data.idToken,
        data.accessToken,
      );
      // login with credential
      await firebase
        .auth()
        .signInWithCredential(credential)
        .then(async result => {
          if (result.additionalUserInfo.isNewUser) {
            await firebase
              .firestore()
              .collection('users')
              .doc(result.user.uid)
              .set({
                email: result.user.email,
                profile_picture: result.additionalUserInfo.profile.picture,
                first_name: result.additionalUserInfo.profile.given_name,
                last_name: result.additionalUserInfo.profile.family_name,
                gender: null,
                favCats: null,
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
              }),
              await this.storeUser(result.user.uid);
          } else {
            await firebase
              .firestore()
              .collection('users')
              .doc(result.user.uid)
              .update({
                last_logged_in: firebase.firestore.FieldValue.serverTimestamp(),
              }),
              await this.storeUser(result.user.uid);
          }
        })
        .catch(error => this.setState({errorMessage: error.message}));
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  render() {
    LayoutAnimation.easeInEaseOut();
    return (
      <View style={styles.container}>
        <ScrollView>
          <Text style={styles.greeting}>{`Hello again.\nWelcome back.`}</Text>

          <View style={styles.errorMessage}>
            {this.state.errorMessage && (
              <Text style={styles.error}>{this.state.errorMessage}</Text>
            )}
          </View>

          <View style={styles.form}>
            <View>
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

          <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
            <Text style={{color: '#FFF', fontWeight: '500'}}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{alignSelf: 'center', marginTop: 32}}
            onPress={() => this.props.navigation.navigate('Register')}>
            <Text style={{color: '#414959', fontSize: 13}}>
              New to ShopQuick?{' '}
              <Text style={{fontWeight: '500', color: '#E9446A'}}>Sign up</Text>
            </Text>
          </TouchableOpacity>
          <View style={{alignSelf: 'center', marginTop: 16}}>
            <Text style={{color: '#414959', fontSize: 13}}>OR</Text>
          </View>
          <View style={{alignSelf: 'center', marginTop: 16}}>
            <GoogleSigninButton
              style={{width: 192, height: 48}}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={() => this._googleLogin()}
              disabled={this.state.isSigninInProgress}
            />
          </View>
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
    marginTop: 20,
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
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
  form: {
    marginBottom: 28,
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
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

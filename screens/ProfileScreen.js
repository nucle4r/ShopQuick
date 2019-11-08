import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loader from 'react-native-modal-loader';
import {Container, Content} from 'native-base';

export default class ProfileScreen extends Component {
  state = {
    user: {},
    recentUpvotes: [],
    userID: null,
    isLoading: true,
    recentUpvotesLoading: true,
    noRecentUpvotes: false,
  };

  static navigationOptions = {
    tabBarIcon: ({tintColor}) => (
      <FontAwesome5 size={20} color={tintColor} name="user-circle" />
    ),
  };

  componentDidMount = async () => {
    try {
      const value = await AsyncStorage.getItem('USERDATA');
      if (value !== null) {
        let parsedVal = JSON.parse(value);
        let userid = parsedVal.id;
        await firebase
          .firestore()
          .collection('users')
          .doc(userid)
          .get()
          .then(doc => {
            this.setState({user: doc.data(), userID: doc.id, isLoading: false});
          });
      }
    } catch (error) {
      Alert.alert('Unable to Load Profile!');
    }
  };

  handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('USERDATA').then(firebase.auth().signOut());
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };
  render() {
    return (
      <View style={styles.container}>
        {this.state.isLoading ? (
          <Loader loading={this.state.isLoading} color="#ff66be" />
        ) : (
          <Container>
            <View style={styles.titleBar}>
              <Ionicons
                name="ios-arrow-back"
                size={24}
                color="#52575D"></Ionicons>
              <Ionicons name="md-more" size={24} color="#52575D"></Ionicons>
            </View>
            <Content>
              <View style={{alignSelf: 'center'}}>
                <View style={styles.profileImage}>
                  <Image
                    source={{uri: this.state.user.profile_picture}}
                    style={styles.image}
                    resizeMode="contain"></Image>
                </View>

                <View style={styles.active}></View>
                <View style={styles.add}>
                  <Ionicons name="ios-add" size={48} color="#DFD8C8"></Ionicons>
                </View>
              </View>

              <View style={styles.infoContainer}>
                <Text style={[styles.text, {fontWeight: '200', fontSize: 30}]}>
                  {`${this.state.user.first_name +
                    ' ' +
                    this.state.user.last_name}`}
                </Text>
                <Text style={[styles.text, {color: '#AEB5BC', fontSize: 14}]}>
                  Newbie
                </Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statsBox}>
                  <Text style={[styles.text, {fontSize: 24}]}>
                    {this.state.user.posts}
                  </Text>
                  <Text style={[styles.text, styles.subText]}>Posts</Text>
                </View>
                <View
                  style={[
                    styles.statsBox,
                    {
                      borderColor: '#DFD8C8',
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                    },
                  ]}>
                  <Text style={[styles.text, {fontSize: 24}]}>
                    {this.state.user.followers}
                  </Text>
                  <Text style={[styles.text, styles.subText]}>Followers</Text>
                </View>
                <View style={styles.statsBox}>
                  <Text style={[styles.text, {fontSize: 24}]}>
                    {this.state.user.following}
                  </Text>
                  <Text style={[styles.text, styles.subText]}>Following</Text>
                </View>
              </View>

              <Text style={[styles.subText, styles.recent]}>
                Recent Activity
              </Text>
              <View style={{alignItems: 'center'}}>
                <View style={styles.recentItem}>
                  <View style={styles.activityIndicator}></View>
                  <View style={{width: 250}}>
                    <Text
                      style={[
                        styles.text,
                        {color: '#41444B', fontWeight: '300'},
                      ]}>
                      Started following{' '}
                      <Text style={{fontWeight: '400'}}>Jake Challeahe</Text>{' '}
                      and <Text style={{fontWeight: '400'}}>Luis Poteer</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.recentItem}>
                  <View style={styles.activityIndicator}></View>
                  <View style={{width: 250}}>
                    <Text
                      style={[
                        styles.text,
                        {color: '#41444B', fontWeight: '300'},
                      ]}>
                      Started following{' '}
                      <Text style={{fontWeight: '400'}}>Luke Harper</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </Content>
          </Container>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'HelveticaNeue',
    color: '#52575D',
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 16,
  },
  subText: {
    fontSize: 12,
    color: '#AEB5BC',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  profileImage: {
    width: 125,
    height: 125,
    borderRadius: 100,
    overflow: 'hidden',
  },
  dm: {
    backgroundColor: '#41444B',
    position: 'absolute',
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: '#34FFB9',
    position: 'absolute',
    bottom: 8,
    left: 6,
    padding: 4,
    height: 20,
    width: 20,
    borderRadius: 10,
  },
  add: {
    backgroundColor: '#41444B',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 32,
  },
  statsBox: {
    alignItems: 'center',
    flex: 1,
  },
  mediaImageContainer: {
    width: 180,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  mediaCount: {
    backgroundColor: '#41444B',
    position: 'absolute',
    top: '50%',
    marginTop: -50,
    marginLeft: 30,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: 'rgba(0, 0, 0, 0.38)',
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 20,
    shadowOpacity: 1,
  },
  recent: {
    marginLeft: 78,
    marginTop: 32,
    marginBottom: 6,
    fontSize: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityIndicator: {
    backgroundColor: '#CABFAB',
    padding: 4,
    height: 12,
    width: 12,
    borderRadius: 6,
    marginTop: 3,
    marginRight: 20,
  },
});

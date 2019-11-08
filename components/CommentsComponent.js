import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Keyboard,
} from 'react-native';
import {
  Item,
  Input,
  Thumbnail,
  ListItem,
  Left,
  Right,
  Body,
  Button,
} from 'native-base';
import ValidationComponent from 'react-native-form-validator';
import {CommentLoader} from './LoaderComponent';
import firebase from 'react-native-firebase';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-community/async-storage';

export default class CommentsComponent extends ValidationComponent {
  state = {
    userData: {},
    comment: '',
    comments: [],
    showingComments: false,
  };
  prodID = this.props.prodID;
  USER_ID = '';
  COMMENTS_REF = firebase.firestore().collection('comments');
  USERS_REF = firebase.firestore().collection('users');

  componentDidMount = async () => {
    try {
      const value = await AsyncStorage.getItem('USERDATA');
      if (value !== null) {
        let user = JSON.parse(value);
        this.setState({userData: user});
        this.USER_ID = user.id;
      }
    } catch (error) {
      Alert.alert('Something Went Wrong!');
    }
  };

  promisedSetState = async newState => {
    return new Promise(resolve => {
      this.setState(newState, () => {
        resolve();
      });
    });
  };

  userInfo = async id => {
    return this.USERS_REF.doc(`${id}`)
      .get()
      .then(doc => {
        return {
          userName: `${doc.data().first_name + ' ' + doc.data().last_name}`,
          userAvatar: doc.data().profile_picture,
        };
      });
  };

  fetchComments = async () => {
    await this.COMMENTS_REF.orderBy('timeStamp', 'desc')
      .where('prodID', '==', `${this.prodID}`)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          this.setState({noMatch: true});
          this.setState({loading: false});
          return;
        }
        snapshot.forEach(async doc => {
          const userInfo = await this.userInfo(doc.data().userID);

          this.state.comments.push({
            id: doc.id,
            prodID: doc.data().prodID,
            userID: doc.data().userID,
            userName: userInfo.userName,
            userAvatar: userInfo.userAvatar,
            comment: doc.data().comment,
            timeStamp: `${doc.data().timeStamp}`,
            likesCount: doc.data().likesCount,
          });
          if (snapshot.size == this.state.comments.length) {
            this.setState({loading: false});
          }
        });
      })
      .catch(err => {
        console.log('Error getting documents', err);
        this.setState({docError: true});
        this.setState({loading: false});
        Alert.alert('Something Went Wrong! Try again Later!');
      });
  };
  incrementCount = async id => {
    (productRef = firebase
      .firestore()
      .collection('products')
      .doc(`${id}`)),
      firebase.firestore().runTransaction(async transaction => {
        const doc = await transaction.get(productRef);

        const newCommentsCount = doc.data().commentsCount + 1;

        transaction.update(productRef, {
          commentsCount: newCommentsCount,
        });
      });
  };
  onAddComment = async () => {
    this.validate({
      comment: {minlength: 5, maxlength: 100, required: true},
    });
    if (this.isFormValid()) {
      this.COMMENTS_REF.add({
        prodID: this.prodID,
        userID: this.USER_ID,
        comment: this.state.comment,
        timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        likesCount: 0,
      }).then(
        await this.incrementCount(this.prodID),
        this.setState({
          comment: '',
          loading: true,
          showingComments: true,
          comments: [],
        }),
        await this.fetchComments(),
      );
    } else {
      Alert.alert('Min Character 5, Max Character 100!');
    }
  };

  render() {
    const Loader = <CommentLoader />;
    const CommentsList = (
      <FlatList
        data={this.state.comments}
        renderItem={({item, index}) => (
          <ListItem
            avatar
            style={{borderBottomColor: '#63707e', borderBottomWidth: 0.25}}>
            <Left>
              <Thumbnail
                small
                source={{
                  uri: `${item.userAvatar}`,
                }}
              />
            </Left>
            <Body>
              <Text style={{color: '#000'}}>{item.userName}</Text>
              <Text note>{item.comment}</Text>
            </Body>
            <Right>
              <Text note>3:43 pm</Text>
            </Right>
          </ListItem>
        )}
        keyExtractor={item => item.id}
        extraData={this.state.comments}
      />
    );
    return (
      <View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 10,
            marginHorizontal: 10,
          }}>
          <Thumbnail
            small
            source={{
              uri: `${this.state.userData.profile_picture}`,
            }}
          />
          <Item rounded style={styles.formItem}>
            <Input
              placeholder=" Comment..."
              value={this.state.comment}
              onChangeText={value => this.setState({comment: value})}
            />
          </Item>
          <Icon
            onPress={() => {
              this.onAddComment(), Keyboard.dismiss();
            }}
            solid
            size={20}
            color="#064acb"
            name="paper-plane"
            style={{paddingLeft: 10}}
          />
        </View>
        {this.state.showingComments == false ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              marginVertical: 10,
              marginHorizontal: 10,
            }}>
            <Button
              onPress={() => {
                this.setState({loading: true, showingComments: true}),
                  this.fetchComments();
              }}
              block
              style={{
                backgroundColor: '#eeeeee',
                alignItems: 'center',
                alignSelf: 'center',
                width: '100%',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#23374d',
                }}>
                View Comments...
              </Text>
            </Button>
          </View>
        ) : null}
        {this.state.loading == true ? (
          <View style={styles.loader}>{Loader}</View>
        ) : this.state.noMatch == true ? (
          <View style={styles.meassage}>
            <Text style={{alignSelf: 'center'}}>
              0 Comments on this Product!
            </Text>
          </View>
        ) : this.state.docError == true ? (
          <View style={styles.meassage}>
            <Text style={{alignSelf: 'center'}}>
              Unable to Fetch Comments! Try agin Later
            </Text>
          </View>
        ) : (
          <View style={{backgroundColor: '#f7f7f7', marginVertical: 10}}>
            {CommentsList}
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  loader: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  meassage: {
    backgroundColor: '#f7f7f7',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginVertical: 10,
    height: 40,
  },
  formItem: {
    backgroundColor: 'white',
    alignSelf: 'center',
    width: '75%',
    height: 40,
  },
});

import React, {Component} from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  Modal,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Vibration,
  Linking,
  Alert,
} from 'react-native';
import {
  Container,
  Content,
  Card,
  CardItem,
  Right,
  Header,
  Left,
  Body,
  Title,
  Button,
  Thumbnail,
} from 'native-base';
import {ProdcutListLoader} from '../components/LoaderComponent';
import Icon from 'react-native-vector-icons/FontAwesome5';
import firebase from 'react-native-firebase';
import {StackActions} from 'react-navigation';
import Swiper from 'react-native-swiper';
import CommentsComponent from '../components/CommentsComponent';
import AsyncStorage from '@react-native-community/async-storage';

export default class ProductListScreen extends Component {
  state = {
    loading: true,
    refreshing: null,
    previousLength: 0,
    noMatch: false,
    docError: false,
    modalVisible: false,
    limit: 9,
    userData: {},
    products: [],
    selectedProduct: {},
    selectedProductIndex: 0,
  };

  USER_ID = '';
  USER_REF = '';
  subcategoryID = '';
  FOLLOWS_REF = firebase.firestore().collection('follows');
  UPVOTES_REF = firebase.firestore().collection('upvotes');
  PROD_REF = firebase.firestore().collection('products');

  componentDidMount = async () => {
    try {
      const value = await AsyncStorage.getItem('USERDATA');
      if (value !== null) {
        let user = JSON.parse(value);
        this.setState({userData: user});
        this.USER_REF = firebase
          .firestore()
          .collection('users')
          .doc(user.id);
        this.USER_ID = user.id;
      }
    } catch (error) {
      Alert.alert('Something Went Wrong!');
    }
    this.subcategoryID = this.props.navigation.state.params.subcategoryID;
    this.subcategoryName = this.props.navigation.state.params.subcategoryname;
    await this._fetchProducts();
  };
  isUpvoted = async id => {
    return this.UPVOTES_REF.where('userID', '=', `${this.USER_ID}`)
      .where('prodID', '=', `${id}`)
      .get()
      .then(doc2 => {
        if (doc2.empty) {
          return false;
        } else {
          return true;
        }
      });
  };
  isFollowing = async id => {
    return this.FOLLOWS_REF.where('followingUID', '=', `${this.USER_ID}`)
      .where('followedUID', '=', `${id}`)
      .get()
      .then(doc3 => {
        if (doc3.empty) {
          return false;
        } else {
          return true;
        }
      });
  };
  _fetchProducts = async () => {
    await this.PROD_REF.where('subCategoryID', '=', `${this.subcategoryID}`)
    .orderBy('upvotes', 'desc')
    .orderBy('timeStamp', 'desc')
      .limit(this.state.limit)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          this.setState({noMatch: true});
          this.setState({loading: false});
          return;
        }
        snapshot.forEach(async doc => {
          const isUpvoted = await this.isUpvoted(doc.id);
          const isFollowing = await this.isFollowing(doc.data().userID);

          this.state.products.push({
            id: doc.id,
            userID: doc.data().userID,
            brand: doc.data().brand,
            name: doc.data().name,
            desc: doc.data().desc,
            price: doc.data().price,
            prodImage: doc.data().prodImage,
            subcategoryID: doc.data().subcategoryID,
            timeStamp: doc.data().timeStamp,
            upvotes: doc.data().upvotes,
            commentsCount: doc.data().commentsCount,
            userReview: doc.data().userReview,
            isUpvoted: isUpvoted,
            isFollowing: isFollowing,
          });
          if (snapshot.size == this.state.products.length) {
            let lastVisible = this.state.products[
              this.state.products.length - 1
            ].id;
            this.setState({loading: false, lastVisible: lastVisible});
          }
        });
      })
      .catch(error => {
        console.log('Error getting documents', error);
        this.setState({docError: true});
        Alert.alert('Something Went Wrong! Try again Later!');
      });
  };
  _fetchMore = async () => {
    this.setState({previousLength: this.state.products.length});
    await this.PROD_REF.where('subCategoryID', '=', `${this.subcategoryID}`)
      .orderBy('upvotes', 'desc')
      .orderBy('timeStamp', 'desc')
      .startAfter(this.state.lastVisible)
      .limit(this.state.limit)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          this.setState({refreshing: false});
          return;
        }
        snapshot.forEach(async doc => {
          const isUpvoted = await this.isUpvoted(doc.id);
          const isFollowing = await this.isFollowing(doc.data().userID);

          this.state.products.push({
            id: doc.id,
            userID: doc.data().userID,
            brand: doc.data().brand,
            name: doc.data().name,
            desc: doc.data().desc,
            price: doc.data().price,
            prodImage: doc.data().prodImage,
            subcategoryID: doc.data().subcategoryID,
            timeStamp: doc.data().timeStamp,
            upvotes: doc.data().upvotes,
            commentsCount: doc.data().commentsCount,
            userReview: doc.data().userReview,
            isUpvoted: isUpvoted,
            isFollowing: isFollowing,
          });
          if (
            snapshot.size ==
            this.state.products.length - this.state.previousLength
          ) {
            let lastVisible = this.state.products[
              this.state.products.length - 1
            ].id;
            this.setState({refreshing: false, lastVisible: lastVisible});
          }
        });
      })
      .catch(error => {
        console.log('Error getting documents', error);
        this.setState({docError: true});
        Alert.alert('Something Went Wrong! Try again Later!');
      });
  };
  // onAddFavourite = () => {
  //   USER_REF = firebase
  //     .firestore()
  //     .collection("users")
  //     .doc("blaMGd6MYqD88OlAjcV6")
  //     .collection("favourites")
  //     .add({
  //       prodId: `${this.prodID}`,
  //       timeStamp: firebase.firestore.FieldValue.serverTimestamp()
  //     })
  //     .then(Alert.alert("Added to Favourites!"))
  //     .catch(error => console.log(error));
  // };

  onUpvote = async (id, index) => {
    this.UPVOTES_REF.add({
      prodID: `${id}`,
      userID: this.USER_ID,
      timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    let PROD_REF = firebase
      .firestore()
      .collection('products')
      .doc(`${id}`);
    firebase
      .firestore()
      .runTransaction(async transaction => {
        const doc = await transaction.get(PROD_REF);
        const newUpvotes = doc.data().upvotes + 1;
        transaction.update(PROD_REF, {
          upvotes: newUpvotes,
        });
      })
      .catch(error => {
        console.log('Upvote Transaction failed: ', error);
      });
    let new_state = Object.assign({}, this.state);
    let copy = new_state.products;
    copy[index].isUpvoted = true;
    copy[index].upvotes++;
    this.setState({products: copy});
  };

  onDownvote = async (id, index) => {
    this.UPVOTES_REF.where('prodID', '=', `${id}`)
      .where('userID', '=', `${this.USER_ID}`)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.delete();
        });
      })
      .catch(error => {
        console.log('Deleting Upvote failed: ', error);
      });
    let PROD_REF = firebase
      .firestore()
      .collection('products')
      .doc(`${id}`);
    firebase
      .firestore()
      .runTransaction(async transaction => {
        const doc = await transaction.get(PROD_REF);
        const newUpvotes = doc.data().upvotes - 1;
        transaction.update(PROD_REF, {
          upvotes: newUpvotes,
        });
      })
      .then(() => {
        let new_state = Object.assign({}, this.state);
        let copy = new_state.products;
        copy[index].isUpvoted = false;
        copy[index].upvotes--;
        this.setState({products: copy});
      })
      .catch(error => {
        console.log('Downvote Transaction failed: ', error);
      });
  };

  onFollow = async (profileID, index) => {
    this.FOLLOWS_REF.add({
      followingUID: `${this.USER_ID}`,
      followedUID: `${profileID}`,
      timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    let FOLLOWED_REF = firebase
      .firestore()
      .collection('users')
      .doc(`${profileID}`);
    let FOLLOWER_REF = firebase
      .firestore()
      .collection('users')
      .doc(`${this.USER_ID}`);
    firebase
      .firestore()
      .runTransaction(async transaction => {
        const FOLLOWED_DOC = await transaction.get(FOLLOWED_REF);
        const newFollowers = FOLLOWED_DOC.data().followers + 1;
        transaction.update(FOLLOWED_REF, {
          followers: newFollowers,
        });
        const FOLLOWER_DOC = await transaction.get(FOLLOWED_REF);
        const newFollowing = FOLLOWER_DOC.data().following + 1;
        transaction.update(FOLLOWER_REF, {
          following: newFollowing,
        });
      })
      .catch(error => {
        console.log('Follow Transaction failed: ', error);
      });
    let new_state = Object.assign({}, this.state);
    let copy = new_state.products;
    copy[index].isFollowing = true;
    this.setState({products: copy});
  };

  onUnfollow = async (profileID, index) => {
    this.FOLLOWS_REF.where('followingUID', '=', `${this.USER_ID}`)
      .where('followedUID', '=', `${profileID}`)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.delete();
        });
      })
      .catch(error => {
        console.log('Deleting Follows failed: ', error);
      });
    let FOLLOWED_REF = firebase
      .firestore()
      .collection('users')
      .doc(`${profileID}`);
    let FOLLOWER_REF = firebase
      .firestore()
      .collection('users')
      .doc(`${this.USER_ID}`);
    firebase
      .firestore()
      .runTransaction(async transaction => {
        const FOLLOWED_DOC = await transaction.get(FOLLOWED_REF);
        const newFollowers = FOLLOWED_DOC.data().followers - 1;
        transaction.update(FOLLOWED_REF, {
          followers: newFollowers,
        });
        const FOLLOWER_DOC = await transaction.get(FOLLOWED_REF);
        const newFollowing = FOLLOWER_DOC.data().following - 1;
        transaction.update(FOLLOWER_REF, {
          following: newFollowing,
        });
      })
      .then(() => {
        let new_state = Object.assign({}, this.state);
        let copy = new_state.products;
        copy[index].isFollowing = false;
        this.setState({products: copy});
      })
      .catch(error => {
        console.log('Unfollow Transaction failed: ', error);
      });
  };

  gotoComments = async (item, index) => {
    this.setState({
      selectedProduct: item,
      selectedProductIndex: index,
      modalVisible: true,
    });
    setTimeout(() => this.productModal.scrollToEnd({animated: true}), 20);
  };

  popAction = () => {
    this.props.navigation.dispatch(StackActions.pop());
  };

  searchAmazon = (brand, name) => {
    let url = `https://www.amazon.in/s?k=${brand} ${name}`;
    Linking.openURL(url);
  };

  searchFlipkart = (brand, name) => {
    let url = `https://www.flipkart.com/search?q=${brand} ${name}`;
    Linking.openURL(url);
  };

  searchGoogle = (brand, name) => {
    let url = `https://www.google.com/search?q=${brand} ${name} store near me`;
    Linking.openURL(url);
  };

  render() {
    renderFooter = () => {
      try {
        // Check If Loading
        if (this.state.refreshing) {
          return <ActivityIndicator />;
        } else {
          return null;
        }
      } catch (error) {
        console.log(error);
      }
    };
    const Loader = (
      <View>
        <ProdcutListLoader />
        <ProdcutListLoader />
        <ProdcutListLoader />
      </View>
    );

    const UpvoteButtonOut = (item, index) => {
      return (
        <View>
          {this.state.products[index].isUpvoted == true ? (
            <TouchableOpacity
              onPress={() => {
                this.onDownvote(item.id, index);
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  marginLeft: 10,
                  marginRight: 40,
                }}>
                <Icon color="#ed1250" size={18} active name="chevron-up" />
                <Text style={{color: '#ed1250'}}>
                  {'  '}
                  {item.upvotes}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                this.onUpvote(item.id, index), Vibration.vibrate(50);
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  marginLeft: 10,
                  marginRight: 40,
                }}>
                <Icon color="#5d5d5d" size={18} active name="chevron-up" />
                <Text style={{color: '#5d5d5d'}}>
                  {'  '}
                  {item.upvotes}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    };
    const UpvoteButton = (item, index) => {
      return (
        <View>
          {this.state.products[index].isUpvoted == true ? (
            <TouchableOpacity>
              <Button
                rounded
                onPress={() => {
                  this.onDownvote(item.id, index);
                }}
                style={{height: 30, backgroundColor: '#ed1250', padding: 10}}>
                <Icon color="#ffffff" active name="chevron-up" />
                <Text style={{color: '#ffffff'}}>
                  {' '}
                  Upvoted · {item.upvotes}
                </Text>
              </Button>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity>
              <Button
                rounded
                onPress={() => {
                  this.onUpvote(item.id, index), Vibration.vibrate(50);
                }}
                style={{height: 30, backgroundColor: '#f7f7f7', padding: 10}}>
                <Icon active name="chevron-up" />
                <Text> Upvote · {item.upvotes}</Text>
              </Button>
            </TouchableOpacity>
          )}
        </View>
      );
    };
    const FollowButton = (item, index) => {
      return (
        <View>
          {this.state.products[index].isFollowing == true ? (
            <TouchableOpacity
              onPress={() => this.onUnfollow(item.userID, index)}>
              <Icon color="#ed1250" size={20} solid name="user-check" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                this.onFollow(item.userID, index), Vibration.vibrate(50);
              }}>
              <Icon color="#042f4b" size={20} solid name="user-plus" />
            </TouchableOpacity>
          )}
        </View>
      );
    };
    const ProductCardList = (
      <FlatList
        data={this.state.products}
        renderItem={({item, index}) => (
          <Card style={{marginHorizontal: 0}}>
            <TouchableWithoutFeedback
              onPress={() =>
                this.setState({
                  selectedProduct: item,
                  selectedProductIndex: index,
                  modalVisible: true,
                })
              }>
              <View>
                <CardItem>
                  <Left>
                    <Thumbnail small source={{uri: this.AvatarUri}} />
                    <Body>
                      <Text style={{color: '#000'}}>
                        Supriya Singh, profile credentials
                      </Text>
                      <Text note>08 Sep 2019</Text>
                    </Body>
                  </Left>
                  <Right>{FollowButton(item, index)}</Right>
                </CardItem>
                <CardItem style={{marginTop: -10}}>
                  <Body>
                    <Text style={{color: '#042f4b', fontSize: 16}}>
                      {item.brand} {item.name}
                    </Text>
                    <Text>
                      Avg Market Price:{' '}
                      <Text style={{fontSize: 18, color: '#009975'}}>
                        ₹{item.price}
                      </Text>
                    </Text>
                  </Body>
                </CardItem>
                <CardItem style={{marginVertical: -10}}>
                  <View
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#ccc1ff',
                      borderRadius: 15,
                      height: 167,
                    }}>
                    <Image
                      style={{
                        flex: 1,
                        alignSelf: 'stretch',
                        borderRadius: 15,
                        height: undefined,
                        width: undefined,
                      }}
                      source={{uri: item.prodImage[0]}}
                      resizeMode="cover"
                    />
                  </View>
                </CardItem>
              </View>
            </TouchableWithoutFeedback>
            <CardItem>
              <Body>
                <Text>
                  Review: "
                  <Text style={{color: '#042f4b', fontStyle: 'italic'}}>
                    {item.userReview}
                  </Text>
                  "
                </Text>
              </Body>
            </CardItem>

            <CardItem>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                }}>
                {UpvoteButtonOut(item, index)}

                <TouchableOpacity
                  onPress={() => this.gotoComments(item, index)}>
                  <Icon size={18} name="comment" />
                </TouchableOpacity>
              </View>
            </CardItem>
          </Card>
        )}
        keyExtractor={item => item.id}
        extraData={index => this.state.products[index].upvotes}
        ListFooterComponent={this.renderFooter}
        // On End Reached (Takes a function)
        onEndReached={this.retrieveMore}
        // How Close To The End Of List Until Next Data Request Is Made
        onEndReachedThreshold={0}
        // Refreshing (Set To True When End Reached)
        refreshing={this.state.refreshing}
      />
    );
    return (
      <Container>
        {this.state.modalVisible && (
          <Modal
            animationType="slide"
            transparent={false}
            visible={true}
            onRequestClose={() => {
              this.setState({modalVisible: false});
            }}>
            <ScrollView
              ref={productModal => {
                this.productModal = productModal;
              }}
              keyboardShouldPersistTaps="handled">
              <Header
                noShadow
                style={{
                  backgroundColor: '#fff',
                  borderBottomColor: '#e6e6e6',
                  borderBottomWidth: 1,
                }}>
                <StatusBar
                  backgroundColor={'transparent'}
                  barStyle={'dark-content'}
                  translucent
                />
                <Left style={{flex: 1, flexDirection: 'row'}}>
                  <Icon
                    onPress={() => this.setState({modalVisible: false})}
                    size={20}
                    color="#000"
                    name="arrow-left"
                    style={{paddingLeft: 10}}
                  />
                </Left>
                <Body>
                  <Title style={{color: '#000'}}>ShopQuick</Title>
                </Body>
                <Right>
                  <Icon
                    onPress={() => this.popAction()}
                    size={20}
                    color="#000"
                    name="bell"
                    style={{paddingRight: 10}}
                  />
                </Right>
              </Header>
              <Content>
                <CardItem>
                  <Left>
                    <Thumbnail small source={{uri: this.AvatarUri}} />
                    <Body>
                      <Text style={{color: '#000'}}>
                        Supriya Singh, profile credentials
                      </Text>
                      <Text note>08 Sep 2019</Text>
                    </Body>
                  </Left>
                  <Right>
                    {FollowButton(
                      this.state.selectedProduct,
                      this.state.selectedProductIndex,
                    )}
                  </Right>
                </CardItem>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    marginBottom: 10,
                    alignSelf: 'center',
                    height: 200,
                  }}>
                  <Swiper style={styles.wrapper} showsButtons={true}>
                    {this.state.selectedProduct.prodImage.map((item, index) => (
                      <View style={styles.slide1} key={index}>
                        <Image
                          source={{uri: item}}
                          style={{
                            width: '100%',
                            height: undefined,
                            aspectRatio: 1,
                          }}
                        />
                      </View>
                    ))}
                  </Swiper>
                </View>
                <View style={{marginHorizontal: 20}}>
                  <Text style={{color: '#000', fontSize: 18}}>
                    {this.state.selectedProduct.brand}{' '}
                    {this.state.selectedProduct.name}
                  </Text>
                  <View style={{paddingVertical: 5}}>
                    <Text style={{color: '#000', fontSize: 16}}>
                      • Description:
                    </Text>
                    <Text note>{this.state.selectedProduct.desc}</Text>
                  </View>
                  <Text style={{color: '#000', fontSize: 16}}>
                    • Average Price in Market:{' '}
                    <Text style={{fontSize: 18, color: '#009975'}}>
                      ₹{this.state.selectedProduct.price}
                    </Text>
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                  }}>
                  <Text>
                    Supriya Singh Says: "
                    <Text style={{fontStyle: 'italic'}}>
                      {this.state.selectedProduct.userReview}
                    </Text>
                    "
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    width: '90%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                  }}>
                  <TouchableOpacity>
                    <Button
                      rounded
                      onPress={() =>
                        this.searchAmazon(
                          this.state.selectedProduct.brand,
                          this.state.selectedProduct.name,
                        )
                      }
                      style={{backgroundColor: '#FF9900', padding: 10}}>
                      <Icon color="#000" active name="search" />
                      <Text style={{color: '#000'}}> Amazon </Text>
                    </Button>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Button
                      rounded
                      onPress={() =>
                        this.searchFlipkart(
                          this.state.selectedProduct.brand,
                          this.state.selectedProduct.name,
                        )
                      }
                      style={{backgroundColor: '#2874f0', padding: 10}}>
                      <Icon color="#fff" active name="search" />
                      <Text style={{color: '#fff'}}> Flipkart </Text>
                    </Button>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Button
                      rounded
                      onPress={() =>
                        this.searchGoogle(
                          this.state.selectedProduct.brand,
                          this.state.selectedProduct.name,
                        )
                      }
                      style={{backgroundColor: '#0F9D58', padding: 10}}>
                      <Icon color="#fff" active name="google" />
                      <Text style={{color: '#fff'}}> Near You </Text>
                    </Button>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    width: '90%',
                    alignSelf: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                  {UpvoteButton(
                    this.state.selectedProduct,
                    this.state.selectedProductIndex,
                  )}

                  <Text>{this.state.selectedProduct.timeStamp}</Text>
                </View>
                <CommentsComponent prodID={this.state.selectedProduct.id} />
              </Content>
            </ScrollView>
          </Modal>
        )}
        <Header
          noShadow
          style={{
            backgroundColor: '#fff',
            borderBottomColor: '#e6e6e6',
            borderBottomWidth: 1,
            marginTop: StatusBar.currentHeight,
          }}>
          <StatusBar
            backgroundColor={'transparent'}
            barStyle={'dark-content'}
            translucent
          />
          <Left style={{flex: 1, flexDirection: 'row'}}>
            <Icon
              onPress={() => this.popAction()}
              size={20}
              color="#000"
              name="arrow-left"
              style={{paddingLeft: 10}}
            />
          </Left>
          <Body>
            <Title style={{color: '#000'}}>{this.subcategoryName}</Title>
          </Body>
          <Right>
            <Icon
              onPress={() => this.popAction()}
              size={20}
              color="#000"
              name="bell"
              style={{paddingRight: 10}}
            />
          </Right>
        </Header>

        {this.state.loading == true ? (
          <View style={styles.container}>{Loader}</View>
        ) : this.state.noMatch == true ? (
          <View style={styles.container}>
            <Text>No Products Listed in this Category!</Text>
          </View>
        ) : (
          <Content style={{backgroundColor: '#f7f7f7'}}>
            {ProductCardList}
          </Content>
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
});

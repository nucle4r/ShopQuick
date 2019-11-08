import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Container, Content} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-community/async-storage';
import {SelectMultipleGroupButton} from 'react-native-selectmultiple-button';
import Category from '../Util/Category.json';
import firebase from 'react-native-firebase';
import Loader from 'react-native-modal-loader';

export default class CompleteProfileScreen extends Component {
  state = {
    isReady: false,
    isLoading: false,
    selected: 'm',
    selectedCategories: [],
    buttonLock: true,
    cats: '',
  };

  multipleGroupData = [];

  userId = null;

  componentDidMount = async () => {
    try {
      const value = await AsyncStorage.getItem('USERDATA');
      if (value !== null) {
        let user = JSON.parse(value);
        this.userId = user.id;
      }
    } catch (error) {
      Alert.alert('Something Went Wrong!');
    }
    Category.forEach(element => {
      this.multipleGroupData.push({
        value: element.categoryID,
        displayValue: element.name,
      });
    });
    this.setState({isReady: true});
  };

  handleSave = async () => {
    this.setState({isLoading: true});
    await firebase
      .firestore()
      .collection('users')
      .doc(this.userId)
      .update({
        gender: this.state.selected,
        favCats: this.state.selectedCategories,
      }),
      await AsyncStorage.mergeItem(
        'USERDATA',
        JSON.stringify({
          gender: this.state.selected,
          favCats: this.state.selectedCategories,
        }),
      );
    this.props.navigation.navigate('App');
  };

  _groupButtonOnSelectedValuesChange = selectedValues => {
    let cats = [];
    selectedValues.forEach(element => {
      cats.push(String(element));
    });
    this.setState({selectedCategories: cats});
    this.setState({cats: JSON.stringify(cats)});
    if (cats.length >= 3) {
      this.setState({buttonLock: false});
    } else if (cats.length < 3) {
      this.setState({buttonLock: true});
    }
  };

  render() {
    const genderSelector = (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        {this.state.selected == 'm' ? (
          <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity
              style={{
                width: 80,
                marginHorizontal: 30,
                borderColor: '#4dabf7',
                borderWidth: 2,
                borderRadius: 5,
                padding: 10,
              }}
              onPress={() => this.setState({selected: 'm'})}>
              <Icon
                name="mars"
                color="#4dabf7"
                size={40}
                style={{alignSelf: 'center'}}
              />
              <Text
                style={{
                  alignSelf: 'center',
                  color: '#4dabf7',
                  fontWeight: '200',
                }}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 80,
                marginHorizontal: 30,
                borderWidth: 2,
                borderRadius: 5,
                padding: 10,
              }}
              onPress={() => this.setState({selected: 'f'})}>
              <Icon
                name="venus"
                color="#000"
                size={40}
                style={{alignSelf: 'center'}}
              />
              <Text style={{alignSelf: 'center', fontWeight: '200'}}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity
              style={{
                width: 80,
                marginHorizontal: 30,
                borderWidth: 2,
                borderRadius: 5,
                padding: 10,
              }}
              onPress={() => this.setState({selected: 'm'})}>
              <Icon
                name="mars"
                color="#000"
                size={40}
                style={{alignSelf: 'center'}}
              />
              <Text style={{alignSelf: 'center', fontWeight: '200'}}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 80,
                marginHorizontal: 30,
                borderColor: '#fb0091',
                borderWidth: 2,
                borderRadius: 5,
                padding: 10,
              }}
              onPress={() => this.setState({selected: 'f'})}>
              <Icon
                name="venus"
                color="#fb0091"
                size={40}
                style={{alignSelf: 'center'}}
              />
              <Text
                style={{
                  alignSelf: 'center',
                  color: '#fb0091',
                  fontWeight: '200',
                }}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );

    const categorySelector = (
      <SelectMultipleGroupButton
        containerViewStyle={{
          justifyContent: 'center',
        }}
        highLightStyle={{
          borderColor: '#042f4b',

          backgroundColor: 'transparent',

          textColor: '#042f4b',

          borderTintColor: '#ed1250',

          backgroundTintColor: 'transparent',

          textTintColor: '#ed1250',
        }}
        onSelectedValuesChange={selectedValues =>
          this._groupButtonOnSelectedValuesChange(selectedValues)
        }
        group={this.multipleGroupData}
      />
    );
    const saveButton = (
      <View>
        {this.state.buttonLock == false ? (
          <View>
            <TouchableOpacity style={styles.button} onPress={this.handleSave}>
              <Text style={{color: '#FFF', fontWeight: '500'}}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.disabledButton}>
              <Text style={{color: '#FFF', fontWeight: '500'}}>Save</Text>
            </View>
          </View>
        )}
      </View>
    );

    return (
      <View style={styles.container}>
        <Loader loading={this.state.isLoading} color="#ff66be" />

        <Container>
          {this.state.isReady == true ? (
            <Content>
              <View style={{marginLeft: 15, marginTop: 30, marginBottom: 15}}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Select Your Gender:
                </Text>
              </View>
              <View>{genderSelector}</View>
              <View style={{marginLeft: 15, marginTop: 30, marginBottom: 15}}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                  Choose min 3 Favourites:
                </Text>
              </View>
              <View>{categorySelector}</View>
              <View>{saveButton}</View>
            </Content>
          ) : (
            <ActivityIndicator size="large" style={styles.container} />
          )}
        </Container>
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
  button: {
    marginTop: 30,
    marginHorizontal: 30,
    backgroundColor: '#E9446A',
    borderRadius: 4,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    marginTop: 30,
    marginHorizontal: 30,
    backgroundColor: '#f0c9c9',
    borderRadius: 4,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {
  Container,
  Content,
  Header,
  Left,
  Right,
  Body,
  Title,
  Item,
  Input,
} from 'native-base';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default class HomeScreen extends Component {
  static navigationOptions = {
    tabBarIcon: ({tintColor}) => (
      <FontAwesome5 size={20} color={tintColor} name={"home"} />
    ),
  };

  render() {
    return (
      <Container>
        <Header
          noShadow
          style={{
            backgroundColor: '#fff',
            borderBottomColor: '#e6e6e6',
            borderBottomWidth: 1,
            marginTop: StatusBar.currentHeight,
          }}>
          <StatusBar
            backgroundColor={'#fff'}
            barStyle={'dark-content'}
            translucent
          />
          <Left style={{flex: 1, flexDirection: 'row'}}>
            <Title style={{color: '#000'}}>ShopQuick</Title>
          </Left>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('AddProduct')}>
            <Right>
              <FontAwesome5
                size={25}
                color="#000"
                name={"plus-circle"}
                style={{paddingVertical: 15}}
              />
            </Right>
          </TouchableOpacity>
        </Header>
        <View
          style={{
            height: 70,
            backgroundColor: '#f7f7f7',
            borderBottomColor: '#e6e6e6',
            borderBottomWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 5,
          }}>
          <View
            style={{
              flex: 1,
              height: '100%',
              padding: 20,
              justifyContent: 'center',
            }}>
            <Item
              style={{
                backgroundColor: 'white',
                paddingHorizontal: 10,
                borderRadius: 4,
              }}>
              <FontAwesome5
                size={20}
                color="#45454d"
                name={"search"}
                style={{padding: 5}}
              />
              <Input placeholder="Search" />
            </Item>
          </View>
        </View>
        <Content style={{backgroundColor: '#d4d7dd'}}>
          <View
            style={{
              height: 50,
              backgroundColor: '#022c43',
              flexDirection: 'row',
              paddingHorizontal: 5,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{color: 'white'}}>Hello, Supriya Singh</Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('Profile')}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{color: 'white'}}>Your Account </Text>
                <FontAwesome5 size={18} color="#fff" name={"arrow-right"} />
              </View>
            </TouchableOpacity>
          </View>
        </Content>
      </Container>
    );
  }
}
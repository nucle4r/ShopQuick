import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import {StackActions} from 'react-navigation';
import {Container, Content, Right, ListItem} from 'native-base';
import Accordion from 'react-native-collapsible/Accordion';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Category from '../Util/Category.json';

export default class ShopCategoryScreen extends Component {
  state = {
    activeSections: [],
    loading: true,
  };

  componentDidMount = async () => {
    setTimeout(() => {
      this.setState({loading: false});
    }, 100);
  };

  static navigationOptions = {
    tabBarIcon: ({tintColor}) => (
      <Icon size={20} color={tintColor} name="th-large" />
    ),
  };

  gotoProdList = (id, name) => {
    this.props.navigation.navigate('ProductList', {
      subcategoryID: id,
      subcategoryname: name,
    });
    this.setState({activeSections: []});
  };

  _renderHeader = section => {
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 20,
          borderBottomWidth: 0.5,
        }}>
        <Text style={{color: '#032535', fontSize: 16, fontWeight: '400'}}>
          {section.name}
        </Text>
        <Right>
          <Icon size={18} name="chevron-circle-down" />
        </Right>
      </View>
    );
  };

  _renderContent = section => {
    return (
      <FlatList
        data={section.subCategory}
        renderItem={({item}) => (
          <ListItem
            onPress={() => this.gotoProdList(item.subcategoryID, item.name)}>
            <Text style={{color: '#252525', fontSize: 14, fontWeight: '200'}}>
              {item.name}
            </Text>
          </ListItem>
        )}
        keyExtractor={item => item.subcategoryID}
      />
    );
  };

  _updateSections = activeSections => {
    this.setState({activeSections});
  };

  popAction = () => {
    this.props.navigation.dispatch(StackActions.pop());
  };

  render() {
    return (
      <Container>
        <StatusBar
          backgroundColor={'#fff'}
          barStyle={'dark-content'}
          translucent
        />
        <Content>
          <View style={{marginLeft: 15, marginTop: 30, marginBottom: 15}}>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              Browse by Category
            </Text>
          </View>
          {this.state.loading ? (
            <View
              style={{
                flex: 1,
                alignItems:"center",
                justifyContent: 'flex-start',
                borderRadius: 15,
                height: 1000,
                width:"95%",
              }}>
              <Image
                source={require('../assets/list-placeholder.png')}
                style={{
                  flex: 1,
                  alignSelf: 'stretch',
                  height: undefined,
                  width: undefined,
                }}
               
              />
            </View>
          ) : (
            <Accordion
              sections={Category}
              activeSections={this.state.activeSections}
              renderHeader={this._renderHeader}
              renderContent={this._renderContent}
              touchableComponent={TouchableOpacity}
              onChange={this._updateSections}
            />
          )}
        </Content>
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
});

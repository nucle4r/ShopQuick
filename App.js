import React from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';
import * as Font from 'expo-font';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createMaterialTopTabNavigator} from 'react-navigation-tabs';
import AuthLoadingScreen from './screens/AuthLoadingScreen';
import HomeScreen from './screens/HomeScreen';
import ShopCategoryScreen from './screens/ShopCategoryScreen';
import AddProductScreen from './screens/AddProductScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProfileScreen from './screens/ProfileScreen';
import SignInScreen from './screens/SignInScreen';
import RegisterScreen from './screens/RegisterScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';

export default class App extends React.Component {
  state = {
    isReady: false,
  };

  componentDidMount = async () => {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      FontAwesome: require('react-native-vector-icons/Fonts/FontAwesome.ttf'),
      FontAwesome5_Brands: require('react-native-vector-icons/Fonts/FontAwesome5_Brands.ttf'),
      FontAwesome5_Regular: require('react-native-vector-icons/Fonts/FontAwesome5_Regular.ttf'),
      FontAwesome5_Solid: require('react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf'),
      Ionicons: require('react-native-vector-icons/Fonts/Ionicons.ttf'),
    });

    this.setState({isReady: true});
  };
  render() {
    if (!this.state.isReady) {
      return <ActivityIndicator style={styles.container} />;
    }
    return <AppContainer />;
  }
}
// const CustomDrawerContentComponent = props => {
//   return (
//     <Container>
//       <Header
//         style={{
//           backgroundColor: "#fff",
//           borderBottomColor: "#e6e6e6",
//           borderBottomWidth: 1,
//           marginTop: StatusBar.currentHeight
//         }}
//       >
//         <StatusBar
//           backgroundColor={"transparent"}
//           barStyle={"dark-content"}
//           translucent
//         />
//         <Left style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
//           <Icon name="person" style={{ color: "white" }} />
//           <Text
//             style={{
//               marginLeft: 10,
//               fontSize: 22,
//               color: "white",
//               fontStyle: "italic"
//             }}
//           >
//             Hello, Supriya
//           </Text>
//         </Left>
//       </Header>
//       <Content>
//         <FlatList
//           data={[
//             {
//               name: "Home",
//               toScreen: "Home"
//             },
//             {
//               name: "Browse by Category",
//               toScreen: "ShopCategory"
//             },
//             {
//               name: "Your Account",
//               toScreen: "Home"
//             }
//           ]}
//           renderItem={({ item }) => (
//             <ListItem noBorder>
//               <TouchableWithoutFeedback
//                 onPress={() => props.navigation.navigate(item.toScreen)}
//               >
//                 <Text>{item.name}</Text>
//               </TouchableWithoutFeedback>
//             </ListItem>
//           )}
//           keyExtractor={item => item.name}
//         />
//       </Content>
//     </Container>
//   );
// };
const AppStack = createStackNavigator(
  {
    Home: createMaterialTopTabNavigator(
      {
        Home: HomeScreen,
        ShopCategory: ShopCategoryScreen,
        Profile: ProfileScreen,
      },
      {
        initialRouteName: 'Home',
        tabBarPosition: 'bottom',
        swipeEnabled: true,
        lazy: true,
        tabBarOptions: {
          showLabel: false,
          showIcon: true,
          activeTintColor: '#ed1250',
          inactiveTintColor: '#ffffff',
          tabStyle: {backgroundColor: '#022c43'},
        },
      },
    ),
    AddProduct: AddProductScreen,
    ProductList: ProductListScreen,
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
  },
);
const MiddleStack = createStackNavigator(
  {
    CompleteProfile: CompleteProfileScreen,
  },
  {
    initialRouteName: 'CompleteProfile',
  },
);
const AuthStack = createStackNavigator({
  SignIn: SignInScreen,
  Register: RegisterScreen,
});
const AppNavigator = createSwitchNavigator(
  {
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack,
    Middle: MiddleStack,
  },
  {
    initialRouteName: 'AuthLoading',
  },
);
const AppContainer = createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

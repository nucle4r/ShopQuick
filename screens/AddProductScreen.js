import React, { Component } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { Container, Content, Header, Body, Title, Left } from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import AddProductComponent from "../components/AddProductComponent";

export default class AddProductScreen extends Component {
  state = {};

  render() {
    return (
      <Container>
        <Header
          style={{
            backgroundColor: "#fff",
            borderBottomColor: "#e6e6e6",
            borderBottomWidth: 1,
            marginTop: StatusBar.currentHeight
          }}
        >
          <StatusBar
            backgroundColor={"transparent"}
            barStyle={"dark-content"}
            translucent
          />
          <Left style={{ flexDirection: "row" }}>
            <Icon
              onPress={() => this.props.navigation.goBack()}
              size={20}
              color="#000"
              name="arrow-left"
              style={{ paddingLeft: 10, marginRight: 15 }}
            />
          </Left>
          <Body>
            <Title style={{ color: "#000", paddingLeft: 20 }}>
              Add Product
            </Title>
          </Body>
        </Header>
        <Content style={{ backgroundColor: "#f7f7f7" }}>
          <AddProductComponent navigation={this.props.navigation} />
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({});

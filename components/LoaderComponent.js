import React, { Component } from "react";
import { View } from "react-native";
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Progressive,
  Fade
} from "rn-placeholder";

export class CommentLoader extends Component {
  render() {
    return (
      <View>
        <Placeholder Animation={Progressive} Left={PlaceholderMedia}>
          <PlaceholderLine width={80} />
          <PlaceholderLine />
          <PlaceholderLine width={30} />
        </Placeholder>
      </View>
    );
  }
}
export class ProdcutListLoader extends Component {
  render() {
    return (
      <View >
        <Placeholder Animation={Fade} Left={PlaceholderMedia}>
          <PlaceholderLine width={80} />
          <PlaceholderLine />          
          <PlaceholderLine width={30} />
        </Placeholder>
      </View>
    );
  }
}

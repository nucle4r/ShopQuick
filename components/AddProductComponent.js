import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  TouchableHighlight,
} from 'react-native';
import {Form, Picker, Input, Label, Item, Button} from 'native-base';
import Category from '../Util/Category.json';
import firebase from 'react-native-firebase';
import uuid from 'uuid/v4';
import * as ImagePicker from 'expo-image-picker';
import ValidationComponent from 'react-native-form-validator';

export default class AddProductComponent extends ValidationComponent {
  state = {
    subCategoryID: '',
    selectedCategory: '0',
    brand: '',
    name: '',
    desc: '',
    price: '',
    review: '',
    prodImage1: null,
    prodImage2: null,
    prodImage3: null,
    img1Uploading: false,
    img2Uploading: false,
    img3Uploading: false,
    prodImageURLs: [],
    imageUploaded: false,
  };

  databaseRef = firebase.firestore().collection('products');

  selectPhotoTapped = async () => {
    let result = await ImagePicker.launchImageLibraryAsync();

    console.log(result);

    if (!result.cancelled) {
      if (this.state.prodImage1 == null) {
        this.setState({prodImage1: result.uri});
        this.setState({img1Uploading: true});

        let ext = await this.state.prodImage1.split('.').pop(); // Extract image extension
        let filename = `${uuid()}.${ext}`; // Generate unique name
        let storageRef = firebase.storage().ref(`ProdImages/${filename}`);
        await storageRef.putFile(this.state.prodImage1);
        await storageRef.getDownloadURL().then(url => {
          this.state.prodImageURLs.push(url);
          this.setState({img1Uploading: false});
          this.setState({imageUploaded: true});
        });
      } else if (this.state.prodImage2 == null) {
        this.setState({prodImage2: result.uri});
        this.setState({img2Uploading: true});

        let ext = await this.state.prodImage2.split('.').pop(); // Extract image extension
        let filename = `${uuid()}.${ext}`; // Generate unique name
        let storageRef = firebase.storage().ref(`ProdImages/${filename}`);
        await storageRef.putFile(this.state.prodImage2);
        await storageRef.getDownloadURL().then(url => {
          this.state.prodImageURLs.push(url);
          this.setState({img2Uploading: false});
          this.setState({imageUploaded: true});
        });
      } else if (this.state.prodImage3 == null) {
        this.setState({prodImage3: result.uri});
        this.setState({img3Uploading: true});

        let ext = await this.state.prodImage3.split('.').pop(); // Extract image extension
        let filename = `${uuid()}.${ext}`; // Generate unique name
        let storageRef = firebase.storage().ref(`ProdImages/${filename}`);
        await storageRef.putFile(this.state.prodImage3);
        await storageRef.getDownloadURL().then(url => {
          this.state.prodImageURLs.push(url);
          this.setState({img3Uploading: false});
          this.setState({imageUploaded: true});
        });
      }
    }
  };

  navigateHome() {
    this.props.navigation.navigate('Home');
  }

  onCategoryChange(value) {
    this.setState({
      selectedCategory: value,
    });
  }
  onSubCategoryChange(value) {
    this.setState({
      subCategoryID: value,
    });
  }

  addProduct = () => {
    if (this.state.prodImage1 == null) {
      Alert.alert('Please add Product Image! ');
    } else if (
      this.state.img1Uploading ||
      this.state.img2Uploading ||
      this.state.img3Uploading
    ) {
      Alert.alert('Image Upload in Progress');
    } else {
      this.validate({
        brand: {minlength: 2, maxlength: 40, required: true},
        name: {minlength: 4, maxlength: 40, required: true},
        desc: {minlength: 20, maxlength: 200, required: true},
        price: {numbers: true, required: true},
        review: {minlength: 20, maxlength: 200, required: true},
      });
      if (this.isFormValid()) {
        this.databaseRef
          .add({
            subCategoryID: this.state.subCategoryID,
            brand: this.state.brand,
            name: this.state.name,
            desc: this.state.desc,
            userReview: this.state.review,
            price: this.state.price,
            timeStamp: new Date().toDateString(),
            prodImage: this.state.prodImageURLs,
            upvotes: 0,
            commentsCount: 0,
          })
          .then(
            Alert.alert(
              'Success',
              'The Product has been added!',
              [{text: 'Ok', onPress: () => this.navigateHome()}],
              {cancelable: false},
            ),
            this.setState({
              subCategoryID: '',
              selectedCategory: '0',
              brand: '',
              name: '',
              desc: '',
              price: '',
              review: '',
              prodImage1: null,
              prodImage2: null,
              prodImage3: null,
              img1Uploading: false,
              img2Uploading: false,
              img3Uploading: false,
              prodImageURLs: [],
              imageUploaded: false,
            }),
          );
      } else {
        Alert.alert('Please Fill Form Correctly');
      }
    }
  };

  render() {
    const {
      selectedCategory,
      brand,
      name,
      desc,
      price,
      prodImage1,
      prodImage2,
      prodImage3,
      review,
      img1Uploading,
      img2Uploading,
      img3Uploading,
    } = this.state;

    const PickImage = (
      <View style={styles.pickImage}>
        {prodImage1 ? (
          <View style={styles.prodImage}>
            <Image source={{uri: prodImage1}} style={styles.previewImage} />
            {img1Uploading ? <View style={styles.overlay} /> : null}
            {img1Uploading ? (
              <View style={styles.uploadActivity}>
                <ActivityIndicator color="#ffffff" size="large" />
              </View>
            ) : null}
          </View>
        ) : (
          <Button
            block
            style={{
              backgroundColor: '#f34573',
              marginTop: 20,
              alignSelf: 'center',
              width: '75%',
            }}
            onPress={() => this.selectPhotoTapped()}>
            <Text
              style={{
                fontFamily: 'Roboto_medium',
                fontSize: 16,
                color: '#ffffff',
              }}>
              Add Product Image
            </Text>
          </Button>
        )}
        {prodImage2 ? (
          <View style={styles.prodImage}>
            <Image source={{uri: prodImage2}} style={styles.previewImage} />
            {img2Uploading ? <View style={styles.overlay} /> : null}
            {img2Uploading ? (
              <View style={styles.uploadActivity}>
                <ActivityIndicator color="#ffffff" size="large" />
              </View>
            ) : null}
          </View>
        ) : (
          <View>
            {prodImage1 ? (
              <View style={styles.prodImage}>
                <Image
                  source={{
                    uri:
                      'https://cdn3.iconfinder.com/data/icons/touch-gesture-outline/512/touch_click_finger_hand_select_gesture-512.png',
                  }}
                  style={styles.previewImage}
                />
                <View style={styles.overlay2}>
                  <TouchableHighlight
                    style={styles.selectselectImageContainer}
                    onPress={() => this.selectPhotoTapped()}>
                    <Text style={styles.selectImageText}>
                      Select Other Image
                    </Text>
                  </TouchableHighlight>
                </View>
              </View>
            ) : null}
          </View>
        )}
        {prodImage3 ? (
          <View style={styles.prodImage}>
            <Image source={{uri: prodImage3}} style={styles.previewImage} />
            {img3Uploading ? <View style={styles.overlay} /> : null}
            {img3Uploading ? (
              <View style={styles.uploadActivity}>
                <ActivityIndicator color="#ffffff" size="large" />
              </View>
            ) : null}
          </View>
        ) : (
          <View>
            {prodImage2 ? (
              <View style={styles.prodImage}>
                <Image
                  source={{
                    uri:
                      'https://cdn3.iconfinder.com/data/icons/touch-gesture-outline/512/touch_click_finger_hand_select_gesture-512.png',
                  }}
                  style={styles.previewImage}
                />
                <View style={styles.overlay2}>
                  <TouchableHighlight
                    style={styles.selectImageConatiner}
                    onPress={() => this.selectPhotoTapped()}>
                    <Text style={styles.selectImageText}>
                      Select Other Image
                    </Text>
                  </TouchableHighlight>
                </View>
              </View>
            ) : null}
          </View>
        )}
      </View>
    );

    const subcats = Category[selectedCategory].subCategory;

    const renderSubCat = (
      <Item stackedLabel style={styles.formItem}>
        <Label>Sub Category of the Product</Label>
        <Picker
          mode="dropdown"
          style={{width: '95%'}}
          selectedValue={this.state.subCategoryID}
          onValueChange={this.onSubCategoryChange.bind(this)}>
          <Picker.Item label="Select Product Category" value="null" />
          {subcats.map((item, index) => (
            <Picker.Item
              label={item.name}
              value={item.subcategoryID}
              key={index}
            />
          ))}
        </Picker>
      </Item>
    );
    return (
      <Form>
        <Item
          stackedLabel
          style={{
            backgroundColor: 'white',
            marginTop: 5,
            alignSelf: 'center',
            alignItems: 'center',
            width: '95%',
          }}>
          <Label>Category of the Product</Label>
          <Picker
            mode="dropdown"
            style={{alignSelf: 'center', width: '95%'}}
            selectedValue={this.state.selectedCategory}
            onValueChange={this.onCategoryChange.bind(this)}>
            {Category.map((item, index) => (
              <Picker.Item
                label={item.name}
                value={String(index)}
                key={index}
              />
            ))}
          </Picker>
        </Item>
        {this.state.selectedCategory != null ? renderSubCat : null}

        {PickImage}

        <View>
          <Item rounded style={styles.formItem}>
            <Input
              placeholder="   Brand Name of Product              *Required"
              selectable
              editable={true}
              value={String(brand)}
              selectTextOnFocus={true}
              onChangeText={value => this.setState({brand: value})}
            />
          </Item>
          <Item rounded style={styles.formItem}>
            <Input
              placeholder="   Name of Product               *Required"
              selectable
              editable={true}
              value={String(name)}
              selectTextOnFocus={true}
              onChangeText={value => this.setState({name: value})}
            />
          </Item>
          <Item rounded style={styles.formItem}>
            <Input
              placeholder={
                '   Details of Product      *Required\n   Min Char: 20 Max Char:200'
              }
              style={{height: 200, textAlignVertical: 'top', padding: 20}}
              multiline={true}
              selectTextOnFocus
              value={String(desc)}
              onChangeText={value => this.setState({desc: value})}
            />
          </Item>
          <Item rounded last style={styles.formItem}>
            <Input
              placeholder={'Avg Price of Product in ₹        *Required'}
              numeric
              selectTextOnFocus
              value={price}
              keyboardType={'numeric'}
              onChangeText={value => this.setState({price: value})}
            />
          </Item>
          <Item rounded style={styles.formItem}>
            <Input
              placeholder={
                '   Add Your Positive Review      *Required\n   Min Char: 20 Max Char:200'
              }
              style={{height: 200, textAlignVertical: 'top', padding: 20}}
              multiline={true}
              selectTextOnFocus
              value={String(review)}
              onChangeText={value => this.setState({review: value})}
            />
          </Item>
          <Button
            block
            style={{
              backgroundColor: '#3e64ff',
              marginTop: 20,
              marginBottom: 20,
              alignSelf: 'center',
              width: '90%',
            }}
            onPress={() => this.addProduct()}>
            <Text
              style={{
                fontFamily: 'Roboto_medium',
                fontSize: 16,
                color: '#ffffff',
              }}>
              Submit Product
            </Text>
          </Button>
        </View>
      </Form>
    );
  }
}
const styles = StyleSheet.create({
  formItem: {
    backgroundColor: 'white',
    marginTop: 15,
    alignSelf: 'center',
    width: '95%',
  },
  pickImage: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prodImage: {
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'center',
    width: 100,
    height: 100,
  },
  previewImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  selectImageContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    height: 100,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectImageText: {
    fontFamily: 'Roboto_medium',
    fontSize: 16,
    color: '#ffffff',
  },
  uploadActivity: {
    position: 'absolute',
    top: 35,
    bottom: 0,
    right: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000000',
    opacity: 0.8,
  },
  overlay2: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000000',
    opacity: 0.4,
  },
});

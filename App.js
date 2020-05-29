import * as React from 'react';
import { Platform, StyleSheet, Text, View, Button, Image, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-picker'

const instructions = Platform.select({
  ios: `Press Cmd+R to reload,\nCmd+D or shake for dev menu`,
  android: `Double tap R on your keyboard to reload,\nShake or press menu button for dev menu`,
});

const createFormData = (photo) => {
  const data = new FormData();

  data.append("file", {
    name: photo.fileName || "image.jpg",
    type: photo.type,
    uri:
      Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
  });

  return data;
};

const cloudinaryUpload = (photo) => {

  console.log(photo);
  const fromData = new FormData()
  fromData.append('file', photo)
  fromData.append('upload_preset', 'st4y3ops')
  fromData.append("cloud_name", "yanninthesky")

  fetch("https://api.cloudinary.com/v1_1/yanninthesky/upload", {
      method: "post",
      body: fromData
    })
    .then(res => res.json())
    .then(dat => {
      console.log("Upload okay!", dat)
    })
    .catch(err => {
      console.log("An Error Occured While Uploading")
    })
};

export default class App extends React.Component {

  state = {
    photo: null,
    answer: {
        result: "",
        details: {}
      },
    log: "",
    askBtnText: "Ask the AI",
    askDisabled: false
  }

  handleChoosePhoto = () => {
    const options = {
      title: 'Select Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    }

    ImagePicker.showImagePicker(options, (response) => {
      // console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const uri = response.uri;
        const type = response.type;
        const name = response.fileName;
        const source = {
          uri,
          type,
          name,
        }
        this.setState({ photo: source})
      }
    });
  }


  handleUploadPhoto = () => {

    const { photo, askDisabled } = this.state;

    // cloudinaryUpload(photo);
    if (askDisabled) {
      return 0;
    }
    if (!photo) {
      this.setState(
          {
            log: "Upload a picture first!"
          }
      );
      return 0;
    }
    // console.log("not disabled, pic attached")
    this.setState(
      {
        askBtnText: "Analyzing... give us a minute.",
        askDisabled: true,
      }
    );

    fetch("https://yanns-ai.onrender.com/analyze", {
      method: "POST",
      body: createFormData(photo)
    })
      .then(response => response.json())
      .then(data => {
        console.log("upload succes", data);
        this.setState(
          {
            answer: data,
            log: "",
            askBtnText: "Ask the AI",
            askDisabled: false
          }
        );
      })
      .catch(error => {
        console.log("upload error", error);
        this.setState(
          {
            log: error.toString(),
            askBtnText: "Ask the AI",
            askDisabled: false
          }
        );
      });
  };

  render() {
    const { photo, answer, log, askBtnText, askDisabled } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.uploadSection}>
          <Text style={styles.title}>What's the sushi?! 🍣</Text>
          <Text style={styles.parag}> What kind of <Text style={{fontWeight: "bold"}}>sushi</Text> are you eating? Let the AI guess! </Text>
          <TouchableOpacity style={styles.upload} onPress={this.handleChoosePhoto} >
            <Text style={styles.uploadText}>Upload a sushi</Text>
          </TouchableOpacity>
          <View style={styles.photo}>
            {photo && (
              <Image
                source={{ uri: photo.uri }}
                style={{ width: 200, height: 200 }}
              />
            )}
          </View>
        </View>
        <View style={styles.result}>
          <Text style={styles.answer}> { (answer.result === "" ? '' : `That's a... ${answer.result[0].toUpperCase()}${answer.result.substring(1)} sushi!`) }</Text>
          <Text style={styles.list}>{ (answer.result === "" ? '' : Object.keys(answer.details).map(key => `${key[0].toUpperCase()}${key.substring(1)} sushi - ${answer.details[key]}%\n`).join('') ) } </Text>
        </View>
        <Text style={styles.parag}> { log } </Text>
        <TouchableOpacity style={styles.ask} onPress={this.handleUploadPhoto} >
          <Text style={styles.askText} >{ askBtnText }</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  uploadSection: {
    flex: 1,
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    marginVertical: 32,
    fontWeight: 'bold'
  },
  parag: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 24
  },
  result: {
    flex: 1,
    alignItems: 'center',
    marginTop: 184
  },
  answer: {
    fontSize: 24,
    marginTop: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  list: {
    color: '#333333',
  },
  ask: {
    backgroundColor: '#FF4F64',
    width: '100%',
    paddingTop: 32,
    paddingBottom: 40,
    margin: 0
  },
  askText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 24,
  },
  upload: {
    borderColor: '#FF4F64',
    borderWidth: 1,
    padding: 16,
    marginBottom: 24
  },
  uploadText: {
    textAlign: 'center',
    color: '#FF4F64'
  },
});

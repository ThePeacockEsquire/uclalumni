import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, Image, ScrollView, TextInput, Navigator, TouchableHighlight } from 'react-native';
import { sendXHR } from './server';
import Peer from 'peerjs';

var styles = require('./style');
var QRCodeScreen = require('./QRCodeScreen');

class MobileFilesAndFolders extends Component {

  success(result, path){
    console.log(result);
    sendXHR('POST', '/device/url', {deviceId: result, url: "https://drive.google.com/file/d/" + path + "/view?usp=sharing"}, (xhr) => {
      this.props.navigator.pop();
    })
  }

  constructor(props){
    super(props);
    this.pressFile = this.pressFile.bind(this);
    this.pressFolder = this.pressFolder.bind(this);
    this.backButton = this.backButton.bind(this);
    this.success = this.success.bind(this);
    this.state = { data: { files: [], path: "" }, service: "" };
  }

  componentWillMount(){
    sendXHR('GET', '/user/cloudservices/' + this.props.serviceName + '/files?path=' + this.props.path, undefined, (xhr) => {
      var data = JSON.parse(xhr.responseText);
      this.setState({ data: data });
    });
    if (this.props.serviceName === "google_drive"){ this.setState({ service: "Google Drive" })};
    if (this.props.serviceName === "dropbox"){this.setState({service: "Dropbox"})};
  }

  pressFile(path){
    this.props.navigator.push({component: QRCodeScreen, onSuccess: this.success, filePath: path});
  }

  pressFolder(path){
    this.props.navigator.push({component: MobileFilesAndFolders, serviceName: this.props.serviceName, path: path})
  }

  backButton(){
    this.props.navigator.pop();
  }


  render() {
    return (
      <ScrollView style={styles.body}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.title}>Showing files and folders</Text>
          <Text style={styles.title}>from {this.state.service}</Text>
            <TouchableHighlight style={styles.share}>
              <Text style={styles.title} onPress={this.backButton}>Back</Text>
            </TouchableHighlight>
          {this.state.data.files.map((file) => {
            if (file.type === "file"){
              return <TouchableHighlight onPress={() => this.pressFile(file.path)} style={styles.share}><Text style={styles.text}>{file.name}</Text></TouchableHighlight>
            }
            else{
              return <TouchableHighlight onPress={() => this.pressFolder(file.path)} style={styles.share}><Text style={styles.text}>{file.name}</Text></TouchableHighlight>
            }
          })}
        </View>
      </ScrollView>
    )
  }
}
module.exports = MobileFilesAndFolders

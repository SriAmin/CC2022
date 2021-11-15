import React, { Component, useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableHighlight } from 'react-native';
import axios from 'axios';
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
const _backendEndpoint = 'https://web-chat.global.assistant.watson.cloud.ibm.com/preview.html?region=us-south&integrationID=fd12d112-4a17-4d8d-a7c8-d7a3251078ce&serviceInstanceID=2e6dde76-92d5-4ef8-824d-cb9a6aaf2d02';

class ChatbotScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            status: '',
            userPayload: '',
            userSession: '',
            userInput: ''
        };

        this.onStartButtonPress = this.onStartButtonPress.bind(this);
    }

    componentWillMount() {
        this.getSession();
    }

    //GET WATSON SESSION
    getSession = async () => {
        const response = await axios.get(
            `${_backendEndpoint}/api/session`,
            this.state.userPayload,
        );
        this.init(response.data);
    };

    //ASSISTANT GREETING
    init = async session => {
        try {
            const initialPayload = {
                input: {
                    message_type: 'text',
                    text: '',
                },
            };
            let response = await axios.post(`${_backendEndpoint}/api/message`, {
                ...initialPayload,
                ...session,
            });
            Tts.speak(response.data.output.generic[0].text);

            this.setState({ userSession: session });
            this.setState({ text: response.data.output.generic[0].text });
            this.setState({ userPayload: response.data });
        } catch (err) {
            console.log('Failed to retrive data from Watson API', err);
        }
    };


    //                                                          GRAB USER INPUT TO SEND TO WATSON
     onStartButtonPress = e => {
         this.sendMessage(this.state.userInput);
         console.log('DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD', this.state.userInput);
     };




    //                                                          SEND USER INPUT TO WATSON
    sendMessage = async payload => {
        try {
            let { userSession } = this.state;
            let inputPayload = {
                input: {
                    message_type: 'text',
                    text: payload,
                },
            };

            let responseData = { ...inputPayload, ...userSession };
            let response = await axios.post(
                `${_backendEndpoint}/api/message`,
                responseData,
            );
            this.setState({ text: response.data.output.generic[0].text });
            Tts.speak(response.data.output.generic[0].text);
        } catch (err) {
            console.log('Failed to send data to Watson API', err);
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>Welcome to Beer Advisor!</Text>
                <TextInput style={{height: 40}} placeholder="Type here to talk to bot!" 
                onChangeText={(userInput) => this.setState({userInput})}/>

                <TouchableHighlight
                    style={{
                        borderColor: 'black',
                        borderWidth: 1,
                        width: 100,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    underlayColor={'gray'}
                    onPressIn={e => this.onStartButtonPress(e)}>
                    <Text>Talk</Text>
                </TouchableHighlight>

                <Text style={{ fontSize: 20, color: 'red' }}>{this.state.text}</Text>
                <Text style={{ fontSize: 20, color: 'blue' }}>{this.state.status}</Text>
            </View>
        );
    }
}
export default ChatbotScreen;



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        padding: 20,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
});
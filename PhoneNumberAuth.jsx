import 'react-native-get-random-values';
import React, { useState, useCallback } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import cognito  from './aws-config';
import CryptoJS from 'crypto-js';
import { configs } from './aws-config';
import * as SecureStore  from 'expo-secure-store'

const API = "https://3kder76760.execute-api.us-east-1.amazonaws.com/Pre-SIT/device/"

function generateSecretHash(username, clientId, clientSecret) {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(username + clientId, clientSecret)
  );
}

export default function PhoneNumberAuth({ navigation }) {
  console.log("logs",configs.clientID)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('')


  const handleSendOtp = useCallback(async() => {
    setErrorMessage('');
    console.log(otp);
    try {
      const clientId = configs.clientID;
      const clientSecret =configs.clientSecret;
      const secretHash = generateSecretHash(phoneNumber, clientId, clientSecret);
  
      console.log(secretHash);
  
      const params = {
        AuthFlow: 'CUSTOM_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: phoneNumber,
          SECRET_HASH: secretHash,
        },
      };

      const result = await cognito.initiateAuth(params).promise();
      setSession(result.Session);
      setStep(2);
    } catch (error) {
      console.error('Error sending OTP:', error);
 
      switch (error.code) {
        case 'UserLambdaValidationException':
          console.error('Validation error:', error.message);
          setErrorMessage('An unknown error occurred: ' + error.message);
          break;

          case 'InvalidLambdaResponseException':
            console.error('Not authorized from otp here1:', error.message);
            setErrorMessage('Your are not yet registered');
            break;

        case 'NotAuthorizedException':
          console.error('Not authorized:', error.message);
          setErrorMessage('An unknown error occurred: ' + error.message);
          break;

        default:
          console.error('An unknown error occurred:', error.message);
          setErrorMessage('An unknown error occurred: ' + error.message);
          break;
      }
    }
  });
  


  const handleVerifyOtp = useCallback(async () => {
    console.log(otp);
    try {
      const clientId = configs.clientID;
      const clientSecret =configs.clientSecret;
      const secretHash = generateSecretHash(phoneNumber, clientId, clientSecret);
  
      const params = {
        ChallengeName: 'CUSTOM_CHALLENGE',
        ClientId: clientId,
        ChallengeResponses: {
          USERNAME: phoneNumber,
          SECRET_HASH: secretHash,
          ANSWER: otp,
        },
        Session: session,
      };
      const result = await cognito.respondToAuthChallenge(params).promise();
      console.log(result);
      if (result.AuthenticationResult) {
      const accessToken = await SecureStore.getItemAsync("AccessToken");
        console.log('User authenticated:', result.AuthenticationResult.AccessToken);
        console.log(phoneNumber)
              }
        navigation.navigate('Home'); 
    } catch (error) { 
      console.error('Error verifying OTP:', error);
      setErrorMessage('An unknown error occurred: ' + error.message);
 
      switch (error.code) {
        case 'UserLambdaValidationException':
          console.error('Validation error from otp:', error.message);
          setErrorMessage('An unknown error occurred: ' + error.message);
          break;

        case 'NotAuthorizedException':
          console.error('Not authorized from otp:', error.message);
          setErrorMessage('An unknown error occurred: ' + error.message);
          break;

        default:
          console.error('An unknown error occurred from otp:', error.message);
          setErrorMessage('An unknown error occurred: ' + error.message);
          break;
      }
    }
  });
  

  return (
    <View style={styles.container}>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {step === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType='phone-pad'
          />
          <Button title="Send OTP" onPress={handleSendOtp} />
        </>
      )}
      {step === 2 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
          />
          <Button title="Verify OTP" onPress={handleVerifyOtp} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});

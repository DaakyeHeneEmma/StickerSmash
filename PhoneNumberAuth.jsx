import 'react-native-get-random-values';
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { cognito } from './aws-config';
import CryptoJS from 'crypto-js';
import { configs } from './aws-config';

function generateSecretHash(username, clientId, clientSecret) {
  return CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(username + clientId, clientSecret)
  );
}

export default function PhoneNumberAuth({ navigation }) { // Accept navigation prop
  console.log("logs",configs.clientID)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(1);

  const handleSendOtp = async () => {
    console.log(otp);
    try {
      const clientId = configs.clientID;
      const clientSecret = configs.clientSecret;
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
    }
  };

  const handleVerifyOtp = async () => {
    console.log(otp);
    try {
      const clientId = configs.clientID;
      const clientSecret = configs.clientSecret;
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
        console.log('User authenticated:', result.AuthenticationResult);
        navigation.navigate('Home'); // Navigate to Home screen
      } else {
        console.log('Additional challenge required.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  return (
    <View style={styles.container}>
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
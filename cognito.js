
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { awsConfig } from './aws-config';
import { generateSecretHash } from './secretHash';

const userPool = new CognitoUserPool({
    UserPoolId: awsConfig.UserPoolId,
    ClientId: awsConfig.ClientId,
    Storage: AsyncStorage,
});

export const signUp = (phoneNumber, callback) => {
    const attributeList = [
        {
            Name: 'phone_number',
            Value: phoneNumber,
        },
            ];
            
            const secretHash = generateSecretHash(phoneNumber);
            console.log(secretHash)


    userPool.signUp(phoneNumber, Math.random().toString(36).slice(-8), attributeList, null, (err, result) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, result);
    }, {
        SecretHash: secretHash
    });
};

export const confirmSignUp = (phoneNumber, code, callback) => {
    const userData = {
        Username: phoneNumber,
        Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    const secretHash = generateSecretHash(phoneNumber);

    cognitoUser.confirmRegistration(code, true, (err, result) => {
        console.log(code)
        if (err) {
            callback(err);
            return;
        }
        callback(null, result);
    }, {
        SecretHash: secretHash
    });
};

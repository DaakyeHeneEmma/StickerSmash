import CryptoJS from 'crypto-js';
import { awsConfig } from './aws-config';

export const generateSecretHash = (username) => {
    console.log(awsConfig.ClientId)
    const message = username + awsConfig.ClientId;
    const hmac = CryptoJS.HmacSHA256(message, awsConfig.ClientSecret);
    return CryptoJS.enc.Base64.stringify(hmac);
};


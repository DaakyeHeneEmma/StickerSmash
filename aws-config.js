import AWS from 'aws-sdk';

export const configs = {
  clientSecret : process.env.EXPO_PUBLIC_CLIENT_SECRET,
  clientID : process.env.EXPO_PUBLIC_CLIENT_ID,
  region : process.env.EXPO_PUBLIC_REGION,
  identityPoolID : process.env.EXPO_PUBLIC_IDENTITY_POOL_ID
}

AWS.config.update({
  region: configs.region,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: configs.identityPoolID,
  }),
});

const cognito = new AWS.CognitoIdentityServiceProvider({
  apiVersion: 'v1',
  region: configs.region,
},{
  triggerSource:'DefineAuthChallenge_Authentication',
  request: {
    UpdateUserAttributesCommand: {
      email_verified:true
    }
  }
});

export { cognito };



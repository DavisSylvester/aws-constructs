import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { AccountRecovery, DateTimeAttribute, NumberAttribute, StringAttribute, UserPoolProps, 
    VerificationEmailStyle } from "aws-cdk-lib/aws-cognito";

export const createUserPoolProps = (securityUserPool: string) => {
   
    const cognitoProps: UserPoolProps = {
        userPoolName: securityUserPool.toLowerCase(),
        selfSignUpEnabled: true,
        userVerification: {
            emailSubject: 'Verify your email for Bishop CDK Constructs!',
            emailBody: 'Thanks for creating an account with Bishop CDK Constructs! Your verification code is {####}',
            emailStyle: VerificationEmailStyle.CODE,
            smsMessage: 'Thanks for signing up {username} with Bishop CDK Constructs! Your verification code is {####}',
        },
        userInvitation: {
            emailSubject: 'Invite to join Bishop CDK Constructs!',
            emailBody: 'Hello {username}, you have been invited to join Bishop CDK Constructs! Your temporary password is {####}',
            smsMessage: 'Your temporary password for {username} with Bishop CDK Constructs is {####}'
        },
        signInAliases: {
            username: true,
            email: true,
            phone: true
        },
        customAttributes: {
            'firstName': new StringAttribute({ minLen: 3, maxLen: 30, mutable: true }),
            'lastName': new StringAttribute({ minLen: 3, maxLen: 30, mutable: true }),
            'phoneNumber': new StringAttribute({ minLen: 3, maxLen: 30, mutable: true }),
            'acccountType': new NumberAttribute({ mutable: true }),
            'joinedOn': new DateTimeAttribute(),
        },
        passwordPolicy: {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireDigits: true,
            requireSymbols: true,
            tempPasswordValidity: Duration.days(1),
        },
        accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
        removalPolicy: RemovalPolicy.DESTROY,
    }
    return cognitoProps;
};


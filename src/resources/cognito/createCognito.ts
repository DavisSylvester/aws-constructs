import { IUserPool, UserPool, UserPoolClient, UserPoolClientProps, UserPoolIdentityProviderAmazon, UserPoolIdentityProviderAmazonProps, UserPoolIdentityProviderSaml, UserPoolIdentityProviderSamlMetadataType } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { AppConfig } from "../../config/AppConfig";
import { createUserPoolProps } from "./createCognitoProps";
import { Duration } from "aws-cdk-lib";
import { ClientAppType } from "../../config/Environments";

export const createCognito = (scope: Construct, appConfig: AppConfig) => {


    const userPool = createUserPool(scope, appConfig);
    const clientPool = createUserPoolClient(scope, userPool, "mobile", appConfig);    
    
    return {
        userPool,
        clientPool
    };
};

const createUserPool = (scope: Construct, appConfig: AppConfig, userPoolName?: string) => {

    return new UserPool(scope, `${appConfig.AppName}-user-pool`,
        createUserPoolProps(`${appConfig.AppName}-user-pool`));

};

const createUserPoolClient = (scope: Construct, userPool: IUserPool, appType: ClientAppType,
    appConfig: AppConfig) => {

    const client = new UserPoolClient(scope, `${appConfig.AppName}-user-pool-client`,
        createUserPoolClientProps(userPool, appConfig, appType));

    return client;
};

const createUserPoolClientProps = (userpool: IUserPool, config: AppConfig, appType: ClientAppType): UserPoolClientProps => {
    const props: UserPoolClientProps = {
        userPool: userpool,
        accessTokenValidity: Duration.hours(3),
        refreshTokenValidity: Duration.days(3),
        userPoolClientName: `${config.AppName}-${appType}`,
        authFlows: {
            userPassword: true,
        }
    };
    return props;
};

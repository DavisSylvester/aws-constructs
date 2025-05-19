import { AttributeType, BillingMode, ProjectionType } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { CONSTANTS } from "./Constants";
import { IAppConfig } from "./customConfigs/IAppConfig";

export const config: IAppConfig = {
    GLOBALS: {
        name: `${process.env.APP_NAME}`,
        accountNumber: process.env.CDK_DEFAULT_ACCOUNT || "",
        region: process.env.CDK_DEFAULT_REGION || "us-east-1",
        stackRuntime: Runtime.NODEJS_22_X,
    },
    API: {
        Name: `${process.env.APP_NAME}-auth-api`,
        Description: 'This is my new API',
        DomainPrefix: 'my-custom-api'
    },
    RESOURCES: {
        LAMBDA: [
            {
                name: `create-account`,
                codePath: './lambda-functions/auth/createAccount.ts',
                handler: 'main',
                apiGateway: {
                    route: '/account/create-account',
                    method: 'post',                    
                },

            },
            {
                name: `change-password`,
                codePath: './lambda-functions/auth/changePassword.ts',
                handler: 'main',
                apiGateway: {
                    route: '/account/change-password',
                    method: 'post',
                    version: 2
                }
            },
        ],
        
        DYNAMO: {
            TABLES: [
                {
                    tableName: `${CONSTANTS.DYNAMODB.TABLES.AUTH_HISTORY_TABLE.name}`,
                    primaryKey: {
                        name: 'id',
                        type: AttributeType.STRING,
                    },
                    billingMode: BillingMode.PAY_PER_REQUEST,
                    indexes: [
                        {
                            indexName: CONSTANTS.DYNAMODB.TABLES.AUTH_HISTORY_TABLE.indexes.AuthHistoryTS.name,
                            partitionKey: {
                                name: 'createdTS',
                                type: AttributeType.NUMBER
                            },
                            projectionType: ProjectionType.ALL
                        },
                        {
                            indexName: CONSTANTS.DYNAMODB.TABLES.AUTH_HISTORY_TABLE.indexes.Username.name,
                            partitionKey: {
                                name: 'username',
                                type: AttributeType.STRING
                            },
                            projectionType: ProjectionType.ALL
                        },
                    ]
                },
            ],
        },

    },
    DNS: {
        ZoneName: '',
        ZoneId: '',
        ZoneNameWithoutPeriod: 'not-used',
        ZoneNameWithoutSuffix: 'not-used',
        ZoneExist: true,
        HostName: '',
        FQDN: ''

    }
}; 
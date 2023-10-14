import { Runtime } from "aws-cdk-lib/aws-lambda";
import { MicroserviceProps, TsgAuthorizerType } from "../../src/index"
import { AttributeType, BillingMode, ProjectionType } from "aws-cdk-lib/aws-dynamodb";

export const testConfig: MicroserviceProps = {
    GLOBALS: {
        name: `todo-sameple-microservice`,
        stackRuntime: Runtime.NODEJS_LATEST,
        accountNumber: '',
        region: '',        
        prefix: `tdm`
    },
    API: {
        Name: `api`,
        Description: 'ToDo Sample API'
    },
    RESOURCES: {
        LAMBDA: [
            {
                name: `create-todo`,
                codePath: './resources/functions/todo/index.ts',
                handler: 'post',
                apiGateway: {
                    method: 'post',
                    route: '/todo',
                },
                environment: {
                    
                }
            },
            {
                name: `delete-todo`,
                codePath: './resources/functions/todo/index.ts',
                handler: 'delete',
                apiGateway: {
                    method: 'delete',
                    route: '/todo',
                },
                environment: {}
            },
            {
                name: `update-todo`,
                codePath: './resources/functions/todo/index.ts',
                handler: 'update',
                apiGateway: {
                    method: 'patch',
                    route: '/todo',
                },
                environment: {}
            },
            {
                name: `get-todos`,
                codePath: './resources/functions/todo/index.ts',
                handler: 'get',
                apiGateway: {
                    method: 'get',
                    secure: false,
                    route: '/todo',
                },
                environment: {}
            },
            {
                name: `get-todo-by-id`,
                codePath: './resources/functions/todo/index.ts',
                handler: 'getById',
                apiGateway: {
                    method: 'get',
                    secure: false,
                    route: '/todo/{id}',
                },
                environment: {}
            },
            {
                name: `create-todo-non-versioned`,
                codePath: './resources/functions/todo/index.ts',
                handler: 'postNonVersioned',
                apiGateway: {
                    method: 'post',
                    route: '/todo',
                    useRouteOverride: true,
                    version: 2
                },
                environment: {}
            },
            {
                name: `create-todo-v3`,
                codePath: './resources/functions/todo/index.ts',
                handler: 'postV3',
                apiGateway: {
                    method: 'post',
                    route: '/todo',
                    useRouteOverride: true,
                    version: 3
                },
                environment: {}
            },
        ],
        DYNAMO: {
            TABLES: [
                {
                    tableName: `todos`,
                    primaryKey: {
                        name: 'pk',
                        type: AttributeType.STRING,
                    },
                    sortKey: { 
                        name: 'sk',
                        type: AttributeType.STRING,
                     },
                    billingMode: BillingMode.PAY_PER_REQUEST,
                    indexes: [
                        {
                            indexName: 'gsi1Index',
                            partitionKey: {
                                name: 'GSI1pk', 
                                type:  AttributeType.STRING
                            },
                            sortKey: {
                                name: 'sk', 
                                type:  AttributeType.STRING
                            },
                            projectionType: ProjectionType.ALL
                        },
                    ]
                },
            ],
        },
        LAMBDA_LAYERS: [
            {
                name: 'common-layer',
                description: `Common Lambda Layers`,
                codePath: `./layers/common/dist/nodejs/node_modules/@todo/common`,
            }
        ],
        AUTHORIZER: {
            type: TsgAuthorizerType.REQUEST_AUTHORIZER,
            name: `authorizer-api`,
            runtime: Runtime.NODEJS_LATEST,
            codePath: "./resources/functions/authorizer/index.ts",
            handler: "authorizer",
            environment: {
                VERBOSE_LOGGING: "true",
            },
            memory: 512,
        }
    }
}; 
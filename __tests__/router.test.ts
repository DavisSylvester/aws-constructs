import { Runtime } from "aws-cdk-lib/aws-lambda";
import { MicroService, MicroserviceProps } from "../src";
// import { testConfig } from "./data/testConfig";
import { AttributeType, BillingMode, ProjectionType } from "aws-cdk-lib/aws-dynamodb";
import { App} from "aws-cdk-lib";
import { AppConfig } from "../src/config/AppConfig";
import { Routes } from "../src/resources/helpers/createRoutes";
import { Resource } from "aws-cdk-lib/aws-apigateway";




describe('ROUTER', () => {

    const api = {
        root: {
            addResource: jest.fn(() => (path: string) => { return path}),
        },
        addResource: jest.fn(() => (path: string) => { return path;}),
    };

    const playSoundFileMock = jest
    .spyOn(Resource.prototype, 'addResource')
    //@ts-ignore
    .mockImplementation((path: string) => {
      console.log('mocked function');
      return path;
    });
    
        // jest.mock('axios');
    // const app = new App();
    // let microservice: MicroService|null = null;
    let props = {
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
        }
    } as MicroserviceProps;

    const appConfig = new AppConfig(props);

    console.log(appConfig.lambdaConfigs);

    const requireDynamoTables = (props.RESOURCES.DYNAMO?.TABLES &&
        props.RESOURCES.DYNAMO.TABLES.length > 0) ? true : false;

    const hasLambdaLayers = (props.RESOURCES.LAMBDA_LAYERS && 
        props.RESOURCES.LAMBDA_LAYERS.length > 0) ? true : false;

    const lambdaConfig = props.RESOURCES.LAMBDA[0];

    beforeEach(() => {

        // microservice = new MicroService(app, 'test', config) as MicroService;

        console.log('appConfig', appConfig);
        console.log('requireDynamoTables', requireDynamoTables);
        console.log('hasLambdaLayers', hasLambdaLayers);
        console.log(JSON.stringify(appConfig, null, 2));
        console.log('lambda 0::', props.RESOURCES.LAMBDA[0]);

    });

    test('useRouteOverride', () => {

        Routes.createResource(lambdaConfig, api as any, {} as any);
    });

});
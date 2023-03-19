# GravyStack CDK Construct Library

## Gravystack Constructs <a name="Constructs" id="Constructs"></a>

Gravystack Constructs is a construct library for creating new AWS Infrastructure in a standardize
reusable manner. 

### Available Constructors

 - [Microservice](#microservice-construct)

And more...

## Installation

1. Install the npm package:

    `npm install @gravystack/gs-cdk-constructs --save`
    - *ensure you have a `.npmrc` that uses the @gravystack npm registry*



# Microservice Construct
The Microservice construct provides and easy way to get started with a basic Microservice.

#### Infrastructure
    - API Gateway (Rest API)
    - Lambda 
    - Dynamodb
    - Lambda Authorizer 
      - TokenAuthorizer

#### Access 
*All lambdas are created with Read/Write Access to DynamoDB tables*

### Usage
```typescript
import { MicroService, MicroserviceProps } from '@gravystack/gs-cdk-constructs';

new MicroService(this, 'microservice-test', microServiceProps);
```

 ## MicroserviceProps

 ```json
 const microServiceProps: MicroserviceProps = {
      GLOBALS: {
          name: `sample-test-app`,
          environments: "dev",
          stackRuntime: Runtime.NODEJS_18_X,
          accountNumber: "",
          region: ""
      },
      API: {
          Name: `sample-test-app`,
          Description: 'This is my new API'
      },
      RESOURCES: {
          AUTHORIZER: {
            name: `jwt-authorizer`,
            codePath: './lambda-functions/authorizer/index.ts',
            handler: 'handler',
            apiPathRoot: '',
            route: '',
        }, 
          LAMBDA: [
              {
                  name: `hello-world`,
                  codePath: './lambda-functions/hello-world/index.ts',
                  handler: 'main',
                  method: 'get',
                  apiPathRoot: 'hello-world',
                  route: '/hello-world'
              },
              {
                  name: `hellow-world2`,
                  codePath: './lambda-functions/hello-world/index.ts',
                  handler: 'main',
                  method: 'get',
                  apiPathRoot: '/hello-world/2',
                  route: '/hello-world/2'
              },
              {
                name: `hello-world3`,
                codePath: './lambda-functions/hello-world/index.ts',
                handler: 'main',
                method: 'get',
                apiPathRoot: '/hello-world/2',
                route: '/hello-world/2/{id}',
                secure: true
            },
          ],
          DYNAMO: {
              TABLES: [
                  {
                      tableName: `sample-audit-history`,
                      primaryKey: {
                          name: 'id',
                          type: AttributeType.STRING,
                      },
                      billingMode: BillingMode.PAY_PER_REQUEST,
                      indexes: [
                          {
                              indexName: 'createdTS',
                              partitionKey: {
                                  name: 'createdTS',
                                  type: AttributeType.NUMBER
                              },
                              projectionType: ProjectionType.ALL
                          },
                          {
                              indexName: 'username',
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
  
      }
  }; 
 ```


## Best Practice
When using this library it is a good practice to start with a new CDK project
   
   - `npm install -g typescript aws-cdk`
   - `mkdir my-new-project`
   - `cd my-new-project`
   - `cdk init app --language typescript`
   - `npm i @gravystack/gs-cdk-constructs`
   - `mkdir lambda-functions` (*holds all your lambda code*)

# [Demo Project](https://github.com/GravyStack/gs-cdk-constructs-demo.git)

- Clone the repository
  - `git clone https://github.com/GravyStack/gs-cdk-constructs-demo.git`
  - `npm i`
  - `cdk bootstrap`
  - `cdk deploy`



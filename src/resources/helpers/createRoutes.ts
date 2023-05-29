import { IRestApi, LambdaIntegration, Resource, TokenAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { TsgLambdaProp } from "../../config/types";


export class Routes {

    public static Resources: Resource[] = [];
    private static routeMap = new Map();

    public static createResource(
        prop: TsgLambdaProp,
        api: IRestApi,
        lambdaNode: NodejsFunction,
        authorizer?: TokenAuthorizer) {

        const routeMap: Map<string, Resource> = new Map();

        let activeRoutePath = "";
        let activeResource: Resource | undefined = undefined;

        //  Only attach lambda to an Api Gateway if a route exist
        if (prop.apiGateway?.route) {

            if (!prop.apiGateway.useRouteOverride) {
                //  Note:  this now uses the bundle version as the first segment in the path.
                activeRoutePath = `v${(prop.apiGateway.version) ? prop.apiGateway.version : 1}`;
                activeResource = Routes.routeMap.get(activeRoutePath) || api.root.addResource(activeRoutePath);
                Routes.routeMap.set(activeRoutePath, activeResource);
            }
            //  Now we go through our route segments creating the rest of the path.
            const pathSegments = prop.apiGateway?.route.split("/").filter(x => (x));
            for (let i = 0; i < pathSegments.length; i++) {
                activeRoutePath = `${activeRoutePath}/${pathSegments[i]}`;
                let secondaryResource = Routes.routeMap.get(activeRoutePath) || activeResource!.addResource(pathSegments[i]);
                Routes.routeMap.set(activeRoutePath, secondaryResource);
                activeResource = secondaryResource;
            }

            //  Finally, we attach our function to the last resource
            activeResource!.addMethod(prop.apiGateway.method || 'GET',
                new LambdaIntegration(lambdaNode, { proxy: true, }),
                prop.apiGateway.secure ? { authorizer } : undefined);
        }
    }

}
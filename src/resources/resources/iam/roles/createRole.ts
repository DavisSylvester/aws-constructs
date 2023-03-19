import { CompositePrincipal, PolicyDocument, Role, RoleProps, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";


export const createRole = (scope: Construct, roleName: string, desc: string, policyDocument: PolicyDocument, 
    servicePrincipal: ServicePrincipal) => {

    const role = new Role(scope, `${roleName}-role`, createRoleProps(roleName, desc, 
        policyDocument, servicePrincipal));
    
    return role;
};

export const createRoleProps = (roleName: string, desc: string, policyDocument: PolicyDocument, 
    servicePrincipal: ServicePrincipal) => {

    const roleProp: RoleProps = {
        roleName,
        description: 'Allows access to DynamoDb Client Table',
        inlinePolicies: {
          policyDocument
        },
        assumedBy: new CompositePrincipal(
          servicePrincipal,
        )
  
      };
  
   return roleProp;
};
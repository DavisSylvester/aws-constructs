import { MicroserviceProps } from "../src";
import { AppConfig } from "../src/config/AppConfig";
import { testConfig } from "./data/testConfig";

let props: MicroserviceProps|null = null;
let appConfig: AppConfig|null = null;

beforeAll(() => {
    props = testConfig;
    appConfig = new AppConfig(props);

    // console.log('appConfig', appConfig);
});    
describe('app Config', () => {

    test('Application Config', () => {       
        
        
        expect(appConfig!.RESOURCES.AUTHORIZER).toBeTruthy();
    });

    test.skip('Application Config', () => {       
        
        expect(appConfig!.RESOURCES.AUTHORIZER).toBeTruthy();
    });

    test.skip('Require Authorizer', () => {

        const requireAuthorizer = (appConfig!.RESOURCES.AUTHORIZER && appConfig!.RESOURCES.AUTHORIZER.type) ? true : false;
        expect(requireAuthorizer).toBe(true);   
        
    });
});
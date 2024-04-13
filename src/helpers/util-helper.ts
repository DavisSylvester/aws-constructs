import { v4 as uuidv4 } from 'uuid';
import { Environment } from '../config/Environments';

export const getUUID = () => {

    return uuidv4();
};

export const environmentSuffix = (env: Environment = "prod") => {
    return env === 'prod' ? '' : env === 'qa' ? '-qa' : '-dev';
}

export const environmentSuffixForDomain = (env: Environment = "prod") => {
    return env === 'prod' ? '.' : env === 'qa' ? '.qa' : '.dev';
}
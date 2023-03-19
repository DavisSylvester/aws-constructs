export const badResponse = (errorMessage: string) => {
    return {
        statusCode: 400,
        body: JSON.stringify({
            message: errorMessage
        }),
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
    };

};

export const okResponse = (data: Object) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            data
        }),
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
    };

};

export const unauthorizedResponse = (data: object) => {
    return {
        statusCode: 401,
        body: JSON.stringify({
            data
        }),
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
    };

};

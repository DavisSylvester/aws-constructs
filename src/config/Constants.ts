export const CONSTANTS = {

    DYNAMODB: {
        TABLES: {
            AUTH_HISTORY_TABLE: {
                name: 'auth-history',
                indexes: {
                    AuthHistoryTS: {
                        name: 'auth-history-ts'
                    },
                    Username: {
                        name: 'username',
                    }
                }
            }
        },
    },
    WEB: {
        ADMIN_PORTAL_BUCKET: 'agent-dashboard.gravystack.net',
    },
    AUTH:{
        OAUTH: {
            CLIENT_ID: process.env.AMAZON_OAUTH_CLIENT_ID,
            CLIENT_SECRET: process.env.AMAZON_OAUTH_CLIENT_SECRET
        }
    }
};
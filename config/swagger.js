// we need swagger-jsdoc to parse JSDoc comments and swagger-ui-express to serve the page
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// options for swagger definition
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'College Placement Portal API',
            version: '1.0.0',
            description: 'API Documentation for the College Placement Portal Backend',
        },
        servers: [
            {
                url: process.env.BASE_URL,
                description: 'Development server',
            },
        ],
    },
    // point to where our routes are documented
    apis: ['./routes/*.js'],
};

// initialize swagger-jsdoc
const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};

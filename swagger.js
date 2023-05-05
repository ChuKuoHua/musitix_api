const swaggerAutogen = require('swagger-autogen')();
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
  swaggerDefinition: {
    // 這邊會是你的api文件網頁描述
    info: {
      title: 'musitix API',
      version: '1.2.7',
      description: 'Generate musitix API document with swagger'
    },
    schemes: [
      "http",
      "https"
    ],
  },
  // 這邊會是你想要產生的api文件檔案，我是直接讓swagger去列出所有controllers
  apis: ['./controllers/*.js']
};
const specs = swaggerJsdoc(options);
const outputFile = './swagger_output.json';
const endpointsFiles = ['./app.ts'];

swaggerAutogen(outputFile, endpointsFiles, specs);
import swaggerJsdoc from "swagger-jsdoc";

const version = Date.now();

const servers = [
  {
    url: process.env.SERVER_IP
      ? `https://${process.env.SERVER_IP}/api/v1`
      : "http://localhost:3000/api/v1",
    description: "API Base URL",
  },
];
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Salon App",
      version: "1.0.2",
      description: "API documentation for Salon App",
    },
    servers, // ✅ Define the base URL for API requests
    components: {
      securitySchemes: {
        UserBearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        AdminBearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./docs/user/*.js", "./docs/admin/*.js"],
  cacheBust: version,
};

const swaggerDocs = swaggerJsdoc(options);
export default swaggerDocs;

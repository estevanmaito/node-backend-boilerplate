const { GraphQLServer } = require("graphql-yoga");
const resolvers = require("./resolvers");
const startDB = require("./db").startDB;
const models = require("./db").models;

const db = startDB({
  url: "mongodb:27017",
  db: "nodeBackend"
});

const context = {
  db,
  models
};

const server = new GraphQLServer({
  typeDefs: `${__dirname}/schema.graphql`,
  resolvers,
  context
});

server.start(() => console.log("Server is running on http://localhost:4000"));

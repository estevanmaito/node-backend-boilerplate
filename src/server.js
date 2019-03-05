const { GraphQLServer } = require("graphql-yoga");
const resolvers = require("./resolvers");
const { startDB, models } = require("./db");

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

const options = {
  port: 4000,
  endpoint: "/graphql",
  playground: "/playground"
};

server.start(options, ({ port }) =>
  console.log(`Server is running on http://localhost:${port}`)
);

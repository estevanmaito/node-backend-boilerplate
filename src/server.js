const { GraphQLServer } = require("graphql-yoga");
const mongoose = require("mongoose");
const resolvers = require("./resolvers");

mongoose.connect(`mongodb://mongodb:27017/nodeBackend`, {
  useNewUrlParser: true
});

const server = new GraphQLServer({
  typeDefs: `${__dirname}/schema.graphql`,
  resolvers
});

server.start(() => console.log("Server is running on http://localhost:4000"));

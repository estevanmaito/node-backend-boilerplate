const { GraphQLServer } = require("graphql-yoga");
const resolvers = require("./resolvers");
const { startDB, models } = require("./db");
const Redis = require("ioredis");

const db = startDB({
  url: "mongodb:27017",
  db: "nodeBackend"
});

const redis = new Redis(6379, "redis");

const context = ({ request }) => ({
  db,
  redis,
  models,
  url: `${request.protocol}://${request.get("host")}`
});

const server = new GraphQLServer({
  typeDefs: `${__dirname}/schema.graphql`,
  resolvers,
  context
});

server.express.get("/confirm/:id", async (req, res) => {
  const id = req.params.id;
  const userId = await redis.get(id);
  if (userId) {
    const user = await models.User.findByIdAndUpdate(userId, {
      confirmed: true
    });
    user.save();
    res.send("Email validated");
  } else {
    res.send("Invalid code");
  }
});

const options = {
  port: 4000,
  endpoint: "/graphql",
  playground: "/playground"
};

server.start(options, ({ port }) =>
  console.log(`Server is running on http://localhost:${port}`)
);

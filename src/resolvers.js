const { models } = require("./db/models");

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || "Mundo"}`
  },
  Mutation: {
    register: async (_, { email, password }) => {
      await models.User.create({
        email,
        password
      }),
        err => {
          if (err) throw new Error("Cannot save user!");
        };

      return true;
    }
  }
};

module.exports = resolvers;

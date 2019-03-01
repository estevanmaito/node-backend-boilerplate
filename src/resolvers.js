const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || "Mundo"}`
  },
  Mutation: {
    register: (_, { email, password }, { models }) => {
      const user = new models.User({
        email,
        password
      });

      user.save(err => {
        if (err) throw new Error("Cannot save user!");
      });

      return true;
    }
  }
};

module.exports = resolvers;

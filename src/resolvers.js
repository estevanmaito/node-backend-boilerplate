const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || "Mundo"}`
  },
  Mutation: {
    register: (_, { email, password }, { models }) => {
      const userExists = models.User.findOne({ email });

      if (userExists) {
        return {
          field: "email",
          message: "Email already in use. Try to login instead."
        };
      }

      const user = new models.User({
        email,
        password
      });

      user.save(err => {
        if (err) throw new Error("Cannot save user!");
      });

      return null;
    }
  }
};

module.exports = resolvers;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'Mundo'}`,
  },
  Mutation: {
    register: (_, { email, password }) => {}
  }
}

module.exports = resolvers
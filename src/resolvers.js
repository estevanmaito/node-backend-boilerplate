const yup = require("yup");
const { EMAIL_DUPLICATE } = require("./utils/errorMessages");
const { formatErrorMessage } = require("./utils/formatErrorMessage");

const schema = yup.object().shape({
  email: yup
    .string()
    .min(4)
    .max(100)
    .email(),
  password: yup
    .string()
    .min(6)
    .max(40)
});

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || "Mundo"}`
  },
  Mutation: {
    register: async (_, { email, password }, { models }) => {
      // validate fields
      try {
        await schema.validate({ email, password }, { abortEarly: false });
      } catch (e) {
        return formatErrorMessage(e);
      }

      // checks if user already exists
      const userExists = await models.User.findOne({ email });

      if (userExists) {
        return [
          {
            path: "email",
            message: EMAIL_DUPLICATE
          }
        ];
      }

      // create a new user
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

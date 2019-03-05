const { request } = require("graphql-request");
const { models } = require("../db");

/* TODO
 * 1) Create a Docker environment for tests?
 * 2) Start a separate server and connect to a test database
 * 3) How to handle the docker-compose container creation
 * that right now start the server and the database together?
 * 4) Use .matchToSnapshot instead of toEqual?
 */

const mutation = (email, password) => `
  mutation {
    register(email: "${email}", password: "${password}") {
      path
      message
    }
  }
`;

const getHost = "http://localhost:4000/graphql";

describe("Register a user", async () => {
  it("should not register a duplicate user", async () => {
    const [email, password] = ["senhordoceu@user.com", "password"];
    const response = await request(getHost, mutation(email, password));
    console.log(response);
    expect(response.register[0].message).toEqual("Email already in use");

    const user = await models.User.find({ email });
    expect(user.email).toEqual(email);
    expect(user.password).toEqual(password);
  });
});

const yup = require("yup");

exports.validateInput = fields => {
  const schema = yup.object().shape({
    email: yup.string().min(4).max(100).email(), // prettier-ignore
    password: yup.string().min(6).max(40) // prettier-ignore
  });

  return schema.validate(fields, { abortEarly: false });
};

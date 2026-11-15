const Joi = require("joi");

// Register Validation Schema
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "string.min": "Name must be at least 2 characters long",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string()
      .min(8)
      .max(1024)
      .required()
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        ),
      )
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      }),
  });
  return schema.validate(data, { abortEarly: false });
};

// Login Validation Schema
const logInValidate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports.registerValidation = registerValidation;
module.exports.logInValidate = logInValidate;
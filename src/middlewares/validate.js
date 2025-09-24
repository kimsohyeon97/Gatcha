import status from "http-status";

const validate = (schema) => (req, res, next) => {
  let errors = [];

  // body validation
  if (schema.body) {
    const { error } = schema.body.validate(req.body);
    if (error) {
      errors = [...errors, ...error.details.map((detail) => detail.message)];
    }
  }

  // query validation
  if (schema.query) {
    const { error } = schema.query.validate(req.query, { aborEarly: false });
    if (error) {
      errors = [...errors, ...error.details.map((detail) => detail.message)];
    }
  }

  // params validation
  if (schema.params) {
    const { error } = schema.params.validate(req.params, { aborEarly: false });
    if (error) {
      errors = [...errors, ...error.details.map((detail) => detail.message)];
    }
  }

  if (errors.length > 0) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({
      status: "Validation Error",
      statusCode: status.UNPROCESSABLE_ENTITY,
      message: errors,
    });
  }

  return next();
};

export default validate;

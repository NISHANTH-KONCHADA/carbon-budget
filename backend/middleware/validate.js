const { validationResult } = require('express-validator');

/**
 * Runs after express-validator checks; short-circuits with a clean
 * 400 response listing every validation issue found.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;

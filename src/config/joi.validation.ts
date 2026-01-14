import Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  MONGODB: Joi.string().required(),
  PORT: Joi.number().default(3003).required(),
  DEFAULT_LIMIT: Joi.number().default(5),
});

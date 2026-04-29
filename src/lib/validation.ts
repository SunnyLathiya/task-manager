import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.'
    }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long.',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        'any.required': 'Password is required.'
      })
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export const taskSchemas = {
  create: Joi.object({
    title: Joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'Task title is required.',
      'string.max': 'Task title cannot exceed 100 characters.'
    }),
    description: Joi.string().trim().max(500).allow('').messages({
      'string.max': 'Description cannot exceed 500 characters.'
    })
  }),
  update: Joi.object({
    title: Joi.string().trim().min(1).max(100).messages({
      'string.empty': 'Task title cannot be empty.',
      'string.max': 'Task title cannot exceed 100 characters.'
    }),
    description: Joi.string().trim().max(500).allow(''),
    status: Joi.string().valid('pending', 'in-progress', 'completed')
  })
};

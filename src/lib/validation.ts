import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
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

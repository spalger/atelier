import Joi from 'joi'

export const cliConfigSchema = Joi.object().keys({
  main: Joi.string().regex(/^(?:\.\/)?dist\//).required(),
  name: Joi.string().required(),
  pkgConfig: Joi.object().keys({
    target: Joi.string().valid('npm', 'web', 'executable').default('npm'),
    noTransformJs: Joi.array().items(Joi.string()).single().default([]),
  }).required(),
})

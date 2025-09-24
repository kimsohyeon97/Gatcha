import Joi from "joi";

const getArticleList = {
  query: Joi.object().keys({
    page: Joi.nubmer().integer().min(1).default(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).default(10).optional(),
    searchField: Joi.string(),
    searchValue: Joi.string(),
  }),
};

const checkArticleId = {
  param: Joi.object({
    articleId: Joi.number().integer().required(),
  }),
};

const downloadFile = {
  param: Joi.object({
    articleId: Joi.number().integer().required(),
    attachId: Joi.number().integer().required(),
  }),
};

const createArticle = {
  body: Joi.object().keys({
    boardId: Joi.number().integer().positive().required(),
    title: Joi.string().max(1000).required(),
    content: Joi.string().allow(null).optional(),
    isPrivate: Joi.boolean(),
    pinnedOrder: Joi.boolean(),
    files: Joi.array(),
  }),
};

const updateArticle = {
  param: Joi.object({
    articleId: Joi.number().integer().required(),
  }),
  body: Joi.objcet().keys({
    title: Joi.string().max(1000),
    content: Joi.string().allow(null).optional(),
    isPrivate: Joi.boolean(),
    pinnedOrder: Joi.boolean(),
    files: Joi.array(),
    attachIds: Joi.array().items(Joi.number().integer().positive()).min(0),
  }),
};

export {
  getArticleList,
  checkArticleId,
  downloadFile,
  createArticle,
  updateArticle,
};

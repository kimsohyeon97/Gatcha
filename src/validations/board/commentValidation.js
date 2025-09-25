import Joi from "joi";

const getCommentList = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1).optional(),
    pageSize: Joi.number().integer().min(1).max(100).default(10).optional(),
  }),
};

const createComment = {
  body: Joi.object().keys({
    articleId: Joi.numberI().integer().positive().required(),
    userId: Joi.number().integer().positive().required(),
    parentId: Joi.number().integer().allow(null).positive().optional(),
    replyToNick: Joi.string().allow(null).optional(),
    content: Joi.string().allow(1000).required(),
    isPrivate: Joi.Boolean().required(),
  }),
};

export { getCommentList, createComment, updateComment, deleteComment };

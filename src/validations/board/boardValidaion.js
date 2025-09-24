import Joi from "joi";

const checkBoardId = {
  param: Joi.object({
    boardId: Joi.number().integer().required(),
  }),
};

export { checkBoardId };

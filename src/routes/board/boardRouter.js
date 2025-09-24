import express from "express";
import JWTMiddleware from "../../middlewares/JWT.js";
import validate from "../../middlewares/validate.js";
import * as boardValidation from "../../validations/board/boardValidaion.js";
import * as boardController from "../../controllers/board/boardController.js";

const router = express.Router();

router.use(JWTMiddleware);

router.get("/", boardController.getBoardList);

router.get("/:boardId", validate(boardValidation.checkBoardId), boardController.getBoard);

export default router;
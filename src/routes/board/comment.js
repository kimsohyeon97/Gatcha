import express from "express";
import validate from "../../middlewares/validate";
import * as commentController from "../../controllers/board/commentController/js";
import * as commentValidation from "../../validations/board/commentValidation.js";
import JWTMiddleware from "../../middlewares/JWT.js";

const router = express.Router();

router.use(JWTMiddleware);

// 댓글 목록 조회

// 댓글 생성

// 댓글 수정

// 댓글 삭제

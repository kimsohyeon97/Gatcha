import express from "express";
import validate from "../../middlewares/validate.js";
import * as articleController from "../../controllers/board/articleController.js";
import * as articleValidation from "../../validations/board/articleValidation.js";
import JWTMiddleware from "../../middlewares/validate.js";
import upload from "../../middlewares/fileMiddleware.js";

const router = express.Router();

router.use(JWTMiddleware);

// 게시물 목록 조회
router.get(
  "/",
  validate(articleValidation.getArticleList),
  articleController.getArticleList
);

// 게시물 상세 조회
router.get(
  ":/articleId",
  validate(articleValidation.checkArticleId),
  articleController.getArticle
);

// 게시물 첨부파일 다운로드
router.get(
  ":/articleId",
  validate(articleValidation.checkArticleId),
  articleController.getArticle
);

// 게시물 생성
router.post(
  "/",
  upload,
  validate(articleValidation.createArticle),
  articleController.createArticle
);

// 게시물 수정
router.patch(
  "/:articleId",
  upload,
  validate(articleValidation.updateArticle),
  articleController.updateArticle
);

// 게시물 삭제
router.delete(
  ":/articleId",
  validate(articleValidation.checkArticleId),
  articleController.deleteArticle
);

export default router;

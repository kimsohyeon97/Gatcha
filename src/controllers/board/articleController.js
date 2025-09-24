import status from "http-status";
import articleService from "../../services/board/articleService.js";
import fs from "fs";

/**
 * 게시물 목록 조회
 */
const getArticleList = async (req, res, next) => {
  const { page, pageSize, searchField, searchValue } = req.query;

  try {
    const { totalPages, currentPage, totalCount, articles } =
      await articleService.getArticleList(
        page,
        pageSize,
        searchField,
        searchValue
      );

    res.status(status.OK).json({
      message: "success",
      totalPages: Number(totalPages),
      currentPage: Number(currentPage),
      totalCount: Number(totalCount),
      data: articles,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 게시물 상세 조회
 */
const getArticle = async (req, res, next) => {
  const { articleId } = req.params;

  try {
    const article = await articleService.getArticle(articleId);

    res.status(status.OK).json({
      message: "success",
      article: article,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 게시물 첨부파일 다운로드
 */
const downloadFile = async (req, res, next) => {
  const { articleId, attachId } = req.params;

  try {
    const { filePath, fileRealName, fileType } = await articleService.getFile(
      articleId,
      attachId
    );

    // 이미지일 경우만 저장된 fileType으로 contentType 설정
    const contentType = fileType.startsWith("image/")
      ? fileType
      : "application/octet-stream";

    // 헤더 설정 (파일명 인코딩)
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileRealName)}"`
    );
    res.setHeader("Content-type", contentType);

    // 파일 스트림
    const stream = fs.createReadStream(filePath);

    // 파일 전송
    stream.pipe(res).on("error", (err) => {
      logger.error(`게시물 파일 다운로드 오류 : ${err}`);
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ message: "파일 다운로드에 실패했습니다." });
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 게시물 생성
 */
const createArticle = async (req, res, next) => {
  try {
    await articleService.createArticle(req.user, req.body, req.files);

    res.status(status.CREATED).json({
      message: "success",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 게시물 수정
 */
const updateArticle = async (req, res, next) => {
  const { articleId } = req.params;

  try {
    await articleService.updateArticle(
      articleId,
      req.user,
      req.body,
      req.files
    );
    res.status(status.OK).json({
      message: "success",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 게시물 삭제
 */
const deleteArticle = async (req, res, next) => {
  const { articleId } = req.params;

  try {
    await articleService.deleteArticle(req.user, articleId);

    res.status(status.OK).json({
      message: "success",
    });
  } catch (err) {
    next(err);
  }
};
export default {
  getArticleList,
  getArticle,
  downloadFile,
  createArticle,
  updateArticle,
  deleteArticle,
};

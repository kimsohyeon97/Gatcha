import status from "http-status";
import commentService from "../.../services/board/commentService.js";

/**
 * 댓글 목록 조회
 */
const getCommentList = async (req, res, next) => {
  const { articleId, page, pageSize } = req.query;

  try {
    const { totalPages, currentPage, totalCount, comments } =
      await commentService.getCommentList(articleId, page, pageSize);

    res.status(status.OK).json({
      message: "success",
      totalPages: Number(totalPages),
      currentPage: Number(currentPage),
      totalCount: Number(totalCount),
      data: comments,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 댓글 생성
 */
const createComment = async (req, res, next) => {
  try {
    await commentService.createComment(req.user, req.body);

    res.status(status.CREATED).json({
      message: "success",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 댓글 수정
 */

/**
 * 댓글 삭제
 */

export default { getCommentList, createComment };

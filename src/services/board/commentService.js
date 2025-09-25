import db from "../../mdoels/index.js";
import status from "http-status";
import articleService from "./articleService.js";
import constants from "../../config/constants.js";

/**
 * 댓글 목록 조회
 */
// const getCommentList = async (page = 1, pageSize = 10, articleId) => {
//   const map = {};
//   const tree = [];

//   const offset = (page - 1) * pageSize;

//   const { count, rows } = await db.Comment.findAndCountAll({
//     attributes: [
//       "id",
//       "userId",
//       "parentId",
//       "replayToNick",
//       "depth",
//       "content",
//       "isPrivate",
//       "enable",
//       "createdAt",
//       "updatedAt",
//     ],
//     include: [
//       {
//         model: db.User,
//         attributes: ["id", "nickname"],
//         required: false,
//       },
//     ],
//     where: {
//       articleId: articleId,
//     },
//     orderBy: [
//       ["parentId", "ASC"],
//       ["createdAt", "ASC"],
//     ],
//     limit: Number(pageSize),
//     offset: Number(offset),
//     distinct: true,
//   });

//   const totalPages = count ? Math.ceil(count / pageSize) : 1;

//   rows.forEach((c) => {
//     map[c.id] = { ...c, children: [] };
//   });

//   rows.forEach((c) => {
//     if (c.parent_id) {
//       map[c.parent_id].children.push(map[c.id]);
//     } else {
//       tree.push(map[c.id]);
//     }
//   });

//   return {
//     totalPages,
//     currentPages: page,
//     totalCount: count,
//     comments: rows,
//   };
// };

const createArticle = async (user, body) => {
  const article = articleService.getArticleById(body.articleId);
  if (!article) {
    const error = new Error("게시물이 존재하지 않습니다.");
    error.status = status.NOT_FOUND;
    throw error;
  }

  if (
    article.Board.type === constants.BOARDTYPE.FNA ||
    article.Board.type === constants.BOARDTYPE.NOTICE
  ) {
    const error = new Error("해당 게시물에 댓글 권한이 없습니다.");
    error.status = status.FORBIDDEN;
    throw error;
  }

  if (!parentId) {
  }
};

export default { getCommentList, createArticle };

import constants from "../../config/constants.js";
import { Op } from "sequelize";
import db from "../../models/index.js";
import boardService from "../../services/board/boardService.js";
import articleAttachService from "../../services/board/articleAttachService.js";
import status from "http-status";

/**
 * id로 게시물 조회
 */
const getArticleById = (id) => {
  return db.Article.findByPk(id);
};

/**
 * 게시물 목록 조회
 */
const getArticleList = async (
  page = 1,
  pageSize = 10,
  searchField,
  searchValue
) => {
  // sequelize에서 where 조건에 null 넣으면 IS NULL 조건이 된다
  const whereCondition = {}; // 객체 선언

  // 고정된 컬럼 → .컬럼명
  // 동적으로 컬럼 지정 → [변수]

  switch (searchField) {
    case "nickname":
      whereCondition.nickname = { [Op.like]: `%${searchValue}%` };
      break;
    case "title":
      whereCondition.title = { [Op.like]: `%${searchValue}%` };
      break;
    case "content":
      whereCondition.content = { [Op.like]: `%${searchValue}%` };
      break;
    case "title+content":
      // WHERE title LIKE '%검색어%' OR content LIKE '%검색어%'
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${searchValue}%` } },
        { content: { [Op.like]: `%${searchValue}%` } },
      ];
      break;
    case "all":
      whereCondition[Op.or] = [
        { nickname: { [Op.like]: `%${searchValue}%` } },
        { title: { [Op.like]: `%${searchValue}%` } },
        { content: { [Op.like]: `%${searchValue}%` } },
      ];
      break;
    default:
  }

  whereCondition.enable = true;

  const offset = (page - 1) * pageSize;

  const { count, rows } = await db.Article.findAndCountAll({
    attributes: [
      "id",
      "boardId",
      "userId",
      "title",
      "content",
      "hit",
      "isPrivate",
      "pinnedOrder",
    ],
    include: [
      {
        model: db.Board,
        attributes: ["id", "name", "type"],
        // required: false → LEFT JOIN
        // 관련된 Board나 User가 없어도 Article은 조회
        // required: true → INNER JOIN
        // 관련된 Board나 User가 없으면 해당 Article은 조회X
        required: false,
      },
      {
        model: db.User,
        attributes: ["id", "nickname"],
        required: false,
      },
    ],
    where: {
      ...whereCondition,
    },
    order: [
      ["createdAt", "DESC"],
      ["id", "ASC"],
    ],
    limit: Number(pageSize),
    offset: Number(offset),
    distinct: true,
    // 모델이 이미 paranoid: true로 설정되어 있으면, 조회할 때 자동으로 deletedAt IS NULL 조건이 적용
  });

  // Math.ceil -> 올림 수 구하는 메서드
  // count ? ... : 1 은 count가 0이면 최소 1페이지로 처리하는 안전장치
  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return {
    totalPages,
    currentPages: page,
    totalCount: count,
    articles: rows,
  };
};

/**
 * 게시물 상세 보기
 */
const getArticle = async (articleId) => {
  let article = await db.Article.findOne({
    attributes: [
      "id",
      "boardId",
      "userId",
      "title",
      "content",
      "hit",
      "isPrivate",
      "attachCount",
      "enable",
      "createdAt",
    ],
    include: [
      {
        model: db.Board,
        attributes: ["id", "name", "type"],
        required: false,
      },
      {
        model: db.User,
        attributes: ["id", "nickname"],
        required: false,
      },
      {
        model: db.ArticleAttach,
        attributes: ["id", "fileRealName", "fileSize", "fileType", "download"],
        required: false,
      },
    ],
    where: {
      id: articleId,
    },
  });

  if (!article) {
    const error = new Error("게시물 정보가 존재하지 않습니다.");
    error.status = status.NOT_FOUND;
    throw error;
  }

  // 조회수 증가
  await db.Article.increment("hit", {
    by: 1,
    where: { id: articleId },
    silent: true, // update 갱신X
  });

  return article;
};

/**
 * 게시물 생성
 */
const createArticle = async (user, body, files) => {
  const board = boardService.getBoardById(body.boardId);
  if (!board) {
    const error = new Error("게시판이 존재하지 않습니다.");
    error.status = status.NOT_FOUND;
    throw error;
  }

  if (
    (user.type !== constants.AUTHENTICATION.SUPER &&
      article.Board.type === constants.BOARDTYPE.NOTICE) ||
    (user.type !== constants.AUTHENTICATION.SUPER &&
      article.Board.type === constants.BOARDTYPE.FNA)
  ) {
    const error = new Error("해당 게시판에 작성 권한이 없습니다.");
    error.status = status.FORBIDDEN;
    throw error;
  }

  const transaction = await db.sequelize.transaction();
  try {
    // 파일 개수
    const attachCount = files.length;

    // 게시물 생성
    const article = await db.Article.create(
      {
        ...body,
        userId: user.id,
        attachCount,
      },
      {
        transaction,
        metaData: { userId: user.id },
      }
    );

    // 첨부파일 생성
    if (attachCount > 0) {
      await articleAttachService.createAttachments(article.id, files, {
        transaction,
      });
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * 게시물 수정
 */
const updateArticle = async (articleId, user, body, files) => {
  const article = await db.Article.findOne({
    include: [
      {
        model: db.ArticleAttach,
        attributes: ["id", "fileName"],
      },
      {
        model: db.Board,
        attributes: ["id", "type"],
      },
    ],
    where: {
      id: articleId,
    },
  });

  if (!article) {
    const error = new Error("게시물이 존재하지 않습니다.");
    error.status = status.NOT_FOUND;
    throw error;
  }

  if (
    (user.type !== constants.AUTHENTICATION.SUPER &&
      article.Board.type === constants.BOARDTYPE.NOTICE) ||
    (user.type !== constants.AUTHENTICATION.SUPER &&
      article.Board.type === constants.BOARDTYPE.FNA)
  ) {
    const error = new Error("해당 게시판의 수정 권한이 없습니다.");
    error.status = status.FORBIDDEN;
    throw error;
  }

  const transaction = await db.sequelize.transaction();
  try {
    // 게시물 첨부파일 수정
    const attachCount = await articleAttachService.updateAttachments(
      articleId,
      article.ArticleAttaches,
      files,
      body.articleIds,
      { transaction }
    );

    // 게시물 수정
    await db.Article.update(
      {
        ...body,
        attachCount: attachCount,
      },
      {
        where: { id: article.id },
        transaction,
        metaData: { userId: user.id },
        individualHooks: true,
      }
    );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * 게시물 삭제
 */
const deleteArticle = async (user, articleId) => {
  const article = await getArticleById(articleId);
  if (!article) {
    const error = new Error("게시물이 존재하지 않습니다.");
    error.status = status.NOT_FOUND;
    throw error;
  }

  if (
    (user.type !== constants.AUTHENTICATION.SUPER &&
      article.Board.type === constants.BOARDTYPE.NOTICE) ||
    (user.type !== constants.AUTHENTICATION.SUPER &&
      article.Board.type === constants.BOARDTYPE.FNA)
  ) {
    const error = new Error("해당 게시판의 수정 권한이 없습니다.");
    error.status = status.FORBIDDEN;
    throw error;
  }

  const transaction = await db.sequelize.transaction();

  try {
    // 게시물 삭제
    await article.destory({
      transaction,
      metaData: { articleId: article.id },
    });

    // 파일 삭제
    await articleAttachService.deleteAttachments(article.id, { transaction });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export default {
  getArticleById,
  getArticleList,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
};

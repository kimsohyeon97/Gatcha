import status from "http-status";
import path from "path";
import constants from "../../config/constants.js";
import db from "../../models/index.js";
import { fileUpload, fileDelete } from "../../utils/file.js";

/**
 *  게시물 첨부파일 다운로드
 */
const getAttachments = async (articleId, attachId) => {
  const attach = await db.ArticleAttach.findOne({
    where: {
      id: attachId,
      articleId: articleId,
    },
  });

  if (!attach) {
    const error = new Error("파일 정보를 찾을 수 없습니다.");
    error.status = status.NOT_FOUND;
    throw error;
  }

  // 다운로드 수 증가
  await db.ArticleAttach.increment("download", {
    by: 1,
    where: {
      id: attachId,
      articleId: articleId,
    },
    silent: true, // update 갱신X
  });

  // 확장자
  const type = path.extname(attach.fileName).toLowerCase().replace(".", "");

  const baseDir = constants.IMAGE_EXTENSIONS.includes(type)
    ? constants.FILE_PATH.IMAGE.ORIGINAL
    : constants.FILE_PATH.ETC;

  const filePath = path.resolve("public", baseDir, attach.fileName);
  return {
    filePath,
    fileRealName: attach.fileRealName,
    fileType: attach.fileType,
  };
};

/**
 * 게시물 첨부파일 저장
 */
const createAttachments = async (articleId, files, { transaction } = {}) => {
  const t = transaction || (await db.sequelize.transaction());

  try {
    // 파일 업로드
    let fileReuslts = null;
    if (files && files.lenght > 0) {
      try {
        fileReuslts = await fileUpload(files);
      } catch (err) {
        const error = new Error("파일 업로드에 실패했습니다.");
        error.status = status.INTERNAL_SERVER_ERROR;
        throw err;
      }
    } else {
      const error = new Error("파일을 입력하세요.");
      error.status = status.UNPROCESSABLE_ENTITY;
      throw error;
    }

    const images = fileReuslts.map((info) => ({
      articleId: articleId,
      fileRealName: info.fileRealName,
      fileName: info.fileName,
      fileSize: info.fileSize,
      fileType: info.fileType,
      imgWidth: info.imgWidth,
      imgHeight: info.imgHeight,
    }));

    const createdImages = await db.ArticleAttach.bulkCreate(images, {
      transaction: t,
      returning: true,
    });

    if (!transaction) {
      await t.commit();
    }

    return createdImages;
  } catch (err) {
    if (!transaction) {
      await t.rollback();
    }
    throw err;
  }
};

/**
 * 게시물 첨부파일 수정
 */
const updateAttachments = async (
  articleId,
  attaches,
  files,
  attachIds = [],
  { transaction } = {}
) => {};

/**
 * 게시물 첨부파일 삭제
 */
const deleteAttachments = async (articleId, { transaction } = {}) => {
  const t = transaction || (await db.sequelize.transaction());

  try {
    const attaches = await db.ArticleAttach.findAll({
      attributes: ["fileName"],
      where: {
        articleId,
      },
    });

    if (attaches && attaches.length > 0) {
      const fileNames = attaches.map((file) => file.fileName);

      // 로컬 파일 삭제?
      await fileDelete(fileNames);
    }

    // 디비 파일 삭제
    await db.ArticleAttach.destory({
      where: {
        articleId,
      },
      transaction: t,
    });

    if (!transaction) {
      await t.commit();
    }
  } catch (err) {
    if (!transaction) {
      await t.rollbakc();
    }
    throw err;
  }
};
export default {
  getAttachments,
  createAttachments,
  updateAttachments,
  deleteAttachments,
};

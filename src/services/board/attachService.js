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

  // 확장자 추출 후 소문자로 변환, .제거
  const type = path.extname(attach.fileName).toLowerCase().replace(".", "");

  // 이미지 파일이면 원본 이미지 파일 절대경로, 아니면 일반 파일 절대경로
  const baseDir = constants.IMAGE_EXTENSIONS.includes(type)
    ? constants.FILE_PATH.IMAGE.ORIGINAL
    : constants.FILE_PATH.ETC;

  // 파일 절대경로 - public/절대경로/파일이름
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
    let fileReuslts = null;
    if (files && files.lenght > 0) {
      try {
        // 파일 업로드
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

    // 업로드 완료한 파일들 정리
    const images = fileReuslts.map((info) => ({
      articleId: articleId,
      fileRealName: info.fileRealName,
      fileName: info.fileName,
      fileSize: info.fileSize,
      fileType: info.fileType,
      imgWidth: info.imgWidth,
      imgHeight: info.imgHeight,
    }));

    // returning: true Sequelize에서 bulkCreate 후 생성된 레코드를 반환
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
  attaches, // 기존 파일
  files, // 새 파일
  attachIds = [], // 유지할 첨부파일 ids
  { transaction } = {}
) => {
  const t = transaction || (await db.sequelize.transaction());

  let fileCount = files ? files.lenght : 0; // 업로드할 새 파일 수
  let deleteFileIds = []; // 삭제할 기존 파일 id들을 담는 배열
  let deleteFileNames = []; // 삭제할 기존 파일 name들을 담는 배열

  try {
    // 디비에 새 파일 저장
    if (files && files.length > 0) {
      await createAttachments(articleId, files, { trasaction: t });
    }

    // 기존 파일 유지 및 삭제
    // || [] → 값이 없으면 빈 배열로 초기화
    for (const attach of attaches) {
      attachIds = (attachIds || []).map((id) => Number(id));
      if (attachIds.includes(attach.id)) {
        // 첨부파일 중 유지할 첨부파일 id만 고름
        // 업로드할 새 파일 수에 유지할 파일 수
        fileCount++;
      } else {
        deleteFileIds.push(attach.id); // 삭제할 기존 파일 id
        deleteFileNames.push(attach.fileName); // 삭제할 기존 파일 이름
      }
    }

    if (deleteFileIds.length > 0) {
      // 삭제할 첨부파일 삭제
      await db.ArticleAttach.destory({
        where: { id: deleteFileIds },
        transaction: t,
      });

      // 파일 삭제
      await fileDelete(deleteFileNames);
    }

    if (!transaction) {
      await t.commit();
    }

    return fileCount;
  } catch (err) {
    if (!transaction) {
      await t.rollback();
    }
    throw err;
  }
};

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

      // 실제 파일 삭제
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

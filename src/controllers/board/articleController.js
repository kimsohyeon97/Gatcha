import status from "http-status";
import articleService from "../../services/board/articleService.js";
import articleAttachService from "../../services/board/articleAttachService.js";
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
    // 다운로드 할 파일 정보 가져오기
    const { filePath, fileRealName, fileType } =
      await articleAttachService.getFile(articleId, attachId);

    // image/로 시작하는 이미지 파일인 경우 저장된 fileType으로 contentType 설정
    // "application/octet-stream"은 바이너리 데이터 일반 형식(MIME type)을 나타내는 문자열
    // 파일 형식을 정확히 모를 때 사용
    // 브라우저나 서버가 특별한 타입이 아닌 일반 파일이라고 인식하게 함
    // 다운로드용 파일로 처리될 때 주로 사용됨
    const contentType = fileType.startsWith("image/")
      ? fileType
      : "application/octet-stream";

    // HTTP 응답 헤더를 설정하는 부분
    // `Content-Disposition`: 브라우저에게 이 응답을 다운로드용 파일로 처리하라고 알려주는 헤더
    // `attachment; filename=`: 다운로드될 파일 이름을 지정
    // `encodeURIComponent(fileRealName)`: 파일명에 공백이나 한글, 특수문자가 있어도 안전하게 URL 인코딩
    // 즉, 이 코드를 쓰면 브라우저에서 바로 열지 않고, 사용자에게 다운로드 창을 띄우면서 지정한 이름으로 파일을 저장
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileRealName)}"`
    );

    // HTTP 응답의 `Content-Type` 헤더를 설정
    // `Content-Type` 헤더는 브라우저나 클라이언트에게 응답 데이터의 종류를 알려줌
    // 예를 들어 `contentType`이 `"image/png"`이면 브라우저는 이 데이터를 이미지로 인식하고, `"application/pdf"`이면 PDF로 처리
    // 즉, 파일 다운로드나 미디어 전송할 때 데이터 형식을 명시하는 역할
    res.setHeader("Content-type", contentType);

    // 파일을 읽기 위한 스트림(stream)
    // filePath에 있는 파일을 한 번에 메모리에 올리지 않고, 조각(chunk) 단위로 읽어오기 때문에 큰 파일도 효율적으로 처리
    // 결과적으로 stream은 파일 내용을 순차적으로 읽을 수 있는 읽기 스트림 객체
    const stream = fs.createReadStream(filePath);

    // 읽은 파일 스트림을 HTTP 응답(res)으로 바로 전달하는 로직
    // stream.pipe(res)
    // stream에서 읽은 파일 데이터를 바로 클라이언트로 전송
    // pipe는 스트림을 연결(connect)해서 데이터를 흘려보내는 메서드
    // .on("error", (err) => { ... })
    // 파일 읽기/전송 중 에러가 발생하면 이 함수가 실행
    // 에러 로그를 남기고, 클라이언트에게 500 서버 오류와 메시지를 응답
    // 파일 다운로드 처리 + 에러 처리를 동시에 하는 구조
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

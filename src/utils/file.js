import constants from "../config/constants.js";
import status from "http-status";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import promises from "fs/promises";

/**
 * path.resolve() - 절대 경로로 변환
 * path.join 경로를 합쳐서 하나의 문자열로 반환
 * path.extname(file.originalname) → 파일 이름에서 확장자 반환
 *
 * Date.now() → 현재 시간을 밀리초 단위로 반환 (유니크한 값)
 *
 * file.original.replace(/\s+/g, "-") → 원래 파일명(file.original)에서 공백을 -로 치환
 * file.buffer → 업로드된 파일의 바이너리 데이터
 * fs.writeFileSync(path, data) → 동기적으로 파일을 해당 경로에 쓰기
 *
 * Promise.all([...])map 안에서 실행한 모든 비동기 작업이 끝날 때까지 기다렸다가 그 결과들을 배열로 반환
 * Array.isArray() 는 값이 배열인지 확인
 *
 * toLowerCase() → 소문자로 변환 (.PNG → .png)
 * slice(1) → 맨 앞의 점(.) 제거
 * coriginalFilePath → 저장할 경로 + 파일 이름 (public/images/original/cat.png 같은 전체 경로)
 *
 * file.buffer는 업로드된 이미지의 바이너리 데이터(Buffer)
 * sharp(file.buffer) - sharp 라이브러리가 이걸 읽어서 이미지 처리할 준비를 함
 * resize({ width: 100, height: 100, fit: "inside" }) - 이미지를 리사이즈(크기 조정)
 * width: 100, height: 100 → 최대 100x100 크기로 맞춤
 * fit: "inside" → 원본 비율 유지하면서 100x100 박스 안에 맞춤
 * toFile - sharp에서 처리한 결과 이미지를 디스크에 저장하는 메서드 (promise 반환)
 *
 * promises.access(path) - 특정 경로에 있는 파일/디렉토리에 파일이 존재하는지 확인
 * promises.unlink(path) - 지정한 파일을 삭제
 */

// 원본 이미지 저장할 절대경로
const originalPath = path.resolve("public", constants.FILE_PATH.IMAGE.ORIGINAL);

// 썸네일 이미지 저장할 절대경로
const thumbnailPath = path.resolve(
  "public",
  constants.FILE_PATH.IMAGE.THUMBNAIL
);

// 이미지가 아닌 일반파일 절대경로
const etcPath = path.resolve("public", constants.FILE_PATH.ETC);

/**
 * 파일 업로드
 */
const fileUpload = async (inputFiles) => {
  try {
    // 저장할 파일 이름을 새로 생성
    const results = await Promise.all(
      inputFiles.map(async (file) => {
        // 파일이름 = (현재시간 밀리초 단위) - (첨부파일 원본 이름의 공백을 - 로 변환)
        const fileName = `${Date.now()}-${file.originalname.replace(
          /\s+/g,
          "-"
        )}`;

        // 첨부파일 확장자 추출 후 소문자로 변환, . 제거
        const fileType = path.extname(file.originalname).toLowerCase().slice(1);

        // 이미지 파일 변수 초기화
        let imageSize = { imgWidth: 0, imgHeight: 0 };

        // 이미지 파일일 경우
        if (constants.IMAGE_EXTENSIONS.includes(fileType)) {
          // 원본 이미지 절대경로 + 파일 이름
          const originalFilePath = path.join(originalPath, fileName);
          // 썸네일 이미지 절대경로 + 파일 이름
          const thumbnailFilePath = path.join(thumbnailPath, fileName);

          // 원본 이미지 해당 경로에 파일 저장
          fs.writeFileSync(originalFilePath, file.buffer);

          // 이미지를 100px 크기로 줄인 썸네일 파일을 따로 만들어서 thumbnailFilePath 경로에 저장
          await sharp(file.buffer)
            .resize({ width: 100, height: 100, fit: "inside" })
            .toFile(thumbnailFilePath);

          // 이미지의 메타데이터(정보) 읽어와서 가로,, 세로 크기 저장 (DB 저장용)
          const metaData = await sharp(file.buffer).metaData();
          imageSize.imgWidth = metaData.width;
          imageSize.imgHeight = metaData.height;
        } else {
          // 이미지가 아닌 파일일 경우
          // 일반 파일 절대경로 + 파일 이름
          const etcFilePath = path.join(etcPath, fileName);
          // 일반 파일 해당 경로에 파일 저장
          fs.writeFileSync(etcFilePath, file.buffer);
        }

        return {
          attachType: file.attachType,
          fileRealName: file.originalname,
          fileName: fileName,
          fileSize: Math.floor(file.size / 1024), // 소수점 내림처리한 KB 단위
          fileType: file.mimetype,
          imgWidth: imageSize.imgWidth,
          imgHeight: imageSize.imgHeight,
          sortNo: file.sortNo ? file.sortNo : 0,
          useBit: file.useBit ? file.useBit : "Y",
        };
      })
    );

    return results;
  } catch (err) {
    const error = new Error("파일 업로드 중 오류가 발생했습니다.");
    error.status = status.INTERNAL_SERVER_ERROR;
    error.message = err;
    throw error;
  }
};

/**
 * 파일 삭제
 */
const fileDelete = async (fileNames) => {
  // 파일이 없으면 리턴
  if (!Array.isArray(fileNames) || fileNames.length === 0) {
    return;
  }

  try {
    for (const fileName of fileNames) {
      // 첨부파일 확장자 추출 후 소문자로 변환, . 제거
      const fileType = path.extname(fileName).toLowerCase().slice(1);

      // 이미지 파일이면
      if (constants.IMAGE_EXTENSIONS.includes(fileType)) {
        const originalFilePath = path.join(originalPath, fileName); // 원본 이미지 절대경로 + 파일 이름
        const thumbnailFilePath = path.join(thumbnailPath, fileName); // 썸네일 이미지 절대경로 + 파일 이름

        try {
          // 원본 파일 삭제
          await promises.access(originalFilePath); // origianl 경로 확인
          await promises.unlink(originalFilePath); // original 파일 삭제
        } catch (err) {}

        try {
          // 썸네일 파일 삭제
          await promises.access(thumbnailFilePath); // thumbnail 경로 확인
          await promises.unlink(thumbnailFilePath); // thumbnail 파일 삭제
        } catch (err) {}
      } else {
        // 이미지가 아닌 파일일 경우
        const etcFilePath = path.join(etcPath, fileName); // 일반 파일 절대경로 + 파일 이름
        try {
          await promises.access(etcFilePath); // 기타 파일 경로 확인
          await promises.unlink(etcFilePath); // 기타 파일 삭제
        } catch (err) {}
      }
    }
  } catch (err) {}
};

export default { fileUpload, fileDelete };

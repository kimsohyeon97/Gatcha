import constants from "../config/constants.js";
import status from "http-status";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// path.resolve() - 절대 경로로 변환

// 원본 이미지 저장할 절대경로
const originalPath = path.resolve("public", constants.FILE_PATH.IMAGE.ORIGIANL);

// 썸네일 이미지 저장할 절대경로
const thumbnailPath = path.resolve(
  "public",
  constants.FILE_PATH.IMAGE.THUMBNAIL
);

// 이미지가 아닌 일반파일 절대경로
const etcPath = path.resolve("public", constants.FILE_PATH.ETC);

const fileUpload = async (inputFiles) => {
  try {

    // 저장할 파일 이름을 새로 생성
    // Promise.all([...])map 안에서 실행한 모든 비동기 작업이 끝날 때까지 기다렸다가 그 결과들을 배열로 반환
    const results = await Promise.all(
      inputFiles.map(async (file) => {
        
        // 첨부파일 저장 파일명
        // Date.now() → 현재 시간을 밀리초 단위로 반환 (유니크한 값)
        // file.original.replace(/\s+/g, "-") → 원래 파일명(file.original)에서 공백을 -로 치환
        const fileName = `${Date.now()}-${file.originalname.replace(
          /\s+/g,
          "-"
        )}`;

        // 첨부파일 파일타입
        // path.extname(file.originalname) → 파일 이름에서 확장자 반환
        // toLowerCase() → 소문자로 변환 (.PNG → .png)
        // slice(1) → 맨 앞의 점(.) 제거
        const fileType = path.extname(file.originalname).toLowerCase().slice(1);
        
        // 변수 초기화  
        let imageSize = { imgWidth: 0, imgHeight: 0 };

        // 이미지일 경우
        if (constants.IMAGE_EXTENSIONS.includes(fileType)) {
            // path.join 경로를 합쳐서 하나의 문자열로 반환
            const originalFilePath = path.join(originalPath, fileName);
            const thumbnailFilePath = path.join(thumbnailPath, fileName);

            // 원본 파일 저장
            // coriginalFilePath → 저장할 경로 + 파일 이름 (public/images/original/cat.png 같은 전체 경로)
            // file.buffer → 업로드된 파일의 바이너리 데이터
            // fs.writeFileSync(path, data) → 동기적으로 파일을 해당 경로에 쓰기
            fs.writeFileSync(originalFilePath, file.buffer);

            // 이미지 썸네일(미리보기 작은 이미지
            // 원본 비율은 유지하면서 100px 박스 안에 들어감
            await sharp(file.buffer)
                .resize({ width: 100, height: 100, fit: "inside" })
                .toFile(thumbnailFilePath);

            // 메모리에 올라온 이미지 파일을 sharp 객체로 만듦
            const metaData = await sharp(file.buffer).metaData();
            imageSize.imgWidth = metaData.width;
            imageSize.imgHeight = metaData.height;
        } else {
            // 이미지가 아닐 경우
            const etcFilePath = path.join(etcPath, fileName);
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

export default { fileUpload, };
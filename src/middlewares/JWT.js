import fs from "fs";
import jwt from "jsonwebtoken";
import status from "http-status";
import redisClient from "../config/redis.js";
import constants from "../config/constants.js";

const publicKey = fs.readFileSync(`${constants.JWT.PUBLIC_KEY}`);

const verifyJWT = async (req, res, next) => {
  // 헤더에서 토큰 추출
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    return res.status(status.UNAUTHORIZED).json({
      status: "error",
      statusCode: status.UNAUTHORIZED,
      message: "토큰이 없습니다.",
    });
  }

  // JWT 토큰 디코딩
  let decoded;
  try {
    decoded = jwt.verify(accessToken, publicKey, {
      algorithms: [constants.JWT.ALG],
    });
  } catch (err) {
    return res.status(status.UNAUTHORIZED).json({
      status: "error",
      statusCode: status.UNAUTHORIZED,
      message: "유효하지 않은 토큰입니다.",
    });
  }

  if (!decoded || !decoded.id) {
    return res.status(status.UNAUTHORIZED).json({
      status: "error",
      statusCode: status.UNAUTHORIZED,
      message: "유효하지 않은 토큰입니다.",
    });
  }

  // 사용자 정보를 request에 설정
  req.user = decoded;

  try {
    const cacheKey = `${constants.CACHE.LOGIN_ADMIN}${decoded.id}`;
    const storedToken = await redisClient.get(cacheKey);

    if (storedToken === null) {
      return res.status(419).json({
        status: "error",
        statusCode: 419,
        message: "로그아웃된 사용자입니다.",
      });
    }

    // 중복 로그인 감지
    if (storedToken !== accessToken) {
      return res.status(419).json({
        status: "error",
        statusCode: 419,
        message: "다른 브라우저에서 로그인되었습니다.",
      });
    }

    // 세션 타임 갱신
    let duration = constants.CACHE_EXPIRE.DURATION;
    if (decoded.userType === constants.AUTHENTICATION.SUPER_ADMIN) {
      duration = 360000;
    }

    await redisClient.expire(cacheKey, duration);
  } catch (err) {
    return res.status(status.INTERNAL_SERVER_ERROR).json({
      status: "Redis Error",
      statusCode: INTERNAL_SERVER_ERROR,
      message: err.message,
    });
  }

  next();
};

export default verifyJWT;

import status from "http-status";
import boardService from "../../services/board/boardService";
import { stat } from "fs";

/**
 * 게시판 목록 조회
 */
const getBoardList = async (req, res, next) => {
    try {
        // async 함수: 함수 안에서 await를 쓸 수 있도록 선언하는 것
        // Promise: 비동기 작업이 끝나면 결과를 알려주겠다는 약속
        // await: Promise가 끝날 때까지 기다리고, 끝나면 결과값을 반환
        const boards = await boardService.getBoardList();

        res.status(status.OK).json({
            message: "success",
            data: boards,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 게시판 id로 조회
 */
const getBoard = async (req, res, next) => {
    const { boardId } = req.params;

    try {
        const board = await boardService.getBoardById(boardId);

        res.status(status.OK).json({
            message: "success",
            board: board,
        });
    } catch (err) {
        next(err);
    }
};

export { getBoardList, getBoard };
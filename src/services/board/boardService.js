import db from "../../models/index.js";

/**
 * 게시판 id로 조회
 */
const getBoardById = (id) => {
    return db.Board.findByPk(id);
};

/**
 * 게시판 목록 조회
 */
const getBoardList = () => {
    // sequelize 매서드는 항상 promise로 반환
    return db.Board.findAll({
        attributes: ["id", "name", "type"],
    });
};

export default { getBoardById, getBoardList, };
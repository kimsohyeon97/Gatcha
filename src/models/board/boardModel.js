import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class Board extends Model {
  static associate(models) {
    Board.hasMany(models.Article, {
      foreignKey: "board_id",
    });
  }
}

Board.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "게시판 ID",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      comment: "사용자 ID",
    },
    type: {
      type: DataTypes.ENUM("notice", "all", "gallery", "qna"),
      allowNull: false,
      field: "type",
      defaultValue: "all",
      comment: "게시판 타입 (notice:공지, all:전체, gallery:갤러리, qna:문의)",
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "name",
      comment: "게시판 이름",
    },
    description: {
      type: DataTypes.TEXT,
      field: "description",
      comment: "게시판 상세설명",
    },
    authorRole: {
      type: DataTypes.ENUM("admin", "member"),
      allowNull: false,
      field: "auth_role",
      defaultValue: "member",
      comment: "게시물 작성 권한 (admin:관리자, member:회원)",
    },
    articleCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "article_count",
      defaultValue: 0,
      comment: "게시물 갯 수",
    },
    enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "enable",
      defaultValue: true,
      comment: "사용여부",
    },
  },
  {
    sequelize,
    modelName: "Board",
    tableName: "board",
    timestamps: true,
    paranoid: true,
  }
);

export default Board;

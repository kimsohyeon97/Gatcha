import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/databse.js";

class ArticleAttach extends Model {
  static associate(models) {
    ArticleAttach.belongsTo(models.Article, {
      foreignKey: "article_id",
    });
  }
}

ArticleAttach.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "게시물 첨부파일 ID",
    },
    ArticleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "article_id",
      comment: "게시물 ID",
    },
    fileRealName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_real_name",
      comment: "첨부파일 실제 파일명",
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_name",
      comment: "첨부파일 저장 파일명",
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "file_size",
      defaultValue: 0,
      comment: "첨부파일 용량",
    },
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "첨부파일 파일타입",
    },
    imgWidth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "img_height",
      defaultValue: 0,
      comment: "이미지 해상도 높이(이미지 첨부파일 일때 만 사용)",
    },
    imgHeight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "img_height",
      defaultValue: 0,
      comment: "이미지 해상도 높이(이미지 첨부파일 일때 만 사용)",
    },
    download: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "download",
      defaultValue: 0,
      comment: "다운로드 수",
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
    modelName: "ArticleAttach",
    tableName: "article_attach",
    timestamps: true,
    paranoid: true,
  }
);

export default ArticleAttach;

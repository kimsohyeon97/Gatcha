import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/databse.js";

class ArticleLog extends Model {
  static associate(models) {
    ArticleLog.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  }
}

ArticleLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "게시물 로그 ID",
    },
    targetTable: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "target_table",
      comment: "참조 테이블명",
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "target_id",
      comment: "참조테이블 ID",
    },
    actionType: {
      type: DataTypes.ENUM,
      allowNull: false,
      field: "action_type",
      defaultValue: "insert",
      comment: "활동 종류(insert:입력, update:수정, delete:삭제)",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      comment: "사용자 아이디",
    },
    summary: {
      type: DataTypes.TEXT("medium"),
      allowNull: false,
      comment: "변경내역",
    },
    enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "enable",
      defaultValue: true,
      comment: "사용여부",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: "ip_address",
      defaultValue: "127.0.0.1",
      comment: "등록 IP",
    },
  },
  {
    sequelize,
    modelName: "ArticleLog",
    tableName: "article_log",
    timestamps: true,
  }
);

export default ArticleLog;

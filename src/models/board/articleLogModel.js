import { Model, DataTypes } from "sequelize";
import sequelize from "sequelize";

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
    tableName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "table_name",
      comment: "참조테이블명",
    },
    fkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "fk_id",
      comment: "참조테이블 ID",
    },
    stateType: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      field: "state_type",
      defaultValue: "insert",
      comment: "처리상태(insert:입력, update:수정, delete:삭제)",
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
    createdIp: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: "created_ip",
      defaultValue: "127.0.0.1",
      comment: "등록 IP",
    },
  },
  {
    sequelize,
    modelName: "ArticleLog",
    tableName: "article_log",
    timestamps: false,
  }
);

export default ArticleLog;

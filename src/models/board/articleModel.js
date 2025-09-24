import { DataTypes, Model } from "sequelize";

class Article extends Model {
  static associate(models) {
    Article.belongsTo(models.Board, {
      foreignKey: "board_id",
    }),
      Article.belongsTo(models.User, {
        foreignKey: "user_id",
      });
    Article.hasMany(models.ArticleAttach, {
      foreignKey: "article_id",
    });
    Article.hasMany(models.ArticleComment, {
      foreignKey: "article_id",
    });
  }
}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "게시물 ID",
    },
    boardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "board_id",
      comment: "게시판 ID",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      comment: "사용자 ID",
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "제목",
    },
    content: {
      type: DataTypes.TEXT("medium"),
      field: "content",
      comment: "내용",
    },
    hit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "hit",
      defaultValue: 0,
      comment: "조회수",
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "is_private",
      defaultValue: false,
      comment: "공개여부",
    },
    pinnedOrder: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
      comment: "상단 고정 유무",
    },
    attachCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "attach_count",
      defaultValue: 0,
      comment: "첨부 파일 수",
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
    modelName: "Article",
    tableName: "article",
    timestamps: true,
    paranoid: true,
  }
);

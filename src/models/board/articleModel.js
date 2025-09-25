import { DataTypes, Model } from "sequelize";

class Article extends Model {
  static associate(models) {
    Article.belongsTo(models.Board, {
      foreignKey: "board_id",
    }),
      Article.belongsTo(models.User, {
        foreignKey: "user_id",
      });
    Article.hasMany(models.Attach, {
      foreignKey: "article_id",
    });
    Article.hasMany(models.Comment, {
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
      field: "title",
      comment: "제목",
    },
    content: {
      type: DataTypes.TEXT("medium"),
      field: "content",
      comment: "내용",
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "is_private",
      defaultValue: false,
      comment: "비밀글 여부",
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_pinned",
      comment: "상단 고정 유무",
    },
    hit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "hit",
      defaultValue: 0,
      comment: "조회수",
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "like_count",
      comment: "좋아요 수",
    },
    commentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "comment_count",
      comment: "댓글 수",
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

export default Article;

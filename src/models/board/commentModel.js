import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/databse";

class Comment extends Model {
  static associate(models) {
    Comment.belongsTo(models.Article, {
      foreignKey: "article_id",
    });
    User.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  }
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      comment: "게시물 댓글 ID",
    },
    ArticleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "article_id",
      comment: "게시물 ID",
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      comment: "사용자 ID",
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "parent_id",
      comment: "부모 댓글 ID",
    },
    replyToNick: {
      type: DataTypes.STRING,
      field: "replay_to_nick",
      comment: "부모 댓글 닉네임",
    },
    depth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "depth",
      comment: "댓글 깊이",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "content",
      comment: "댓글 내용",
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "is_private",
      defaultValue: false,
      comment: "비밀 댓글 여부",
    },
    enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "enable",
      comment: "사용여부",
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comment",
    timestamps: true,
    paranoid: true,
  }
);

export default Comment;

import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/databse";

class ArticleComment extends Model {
    static associate(models){
        ArticleComment.belongsTo(models.Article, {
            foreignKey: "article_id",
        });
        User.belongsTo(models.User, {
            foreignKey: "user_id",
        });
    }
}

ArticleComment.init(
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
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "content",
            comment: "댓글 내용",
        },
        isPrivate:{
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
        modelName: "ArticleComment",
        tableName: "article_comment",
        timestamps: true,
        paranoid: true,
    }
);

export default ArticleComment;
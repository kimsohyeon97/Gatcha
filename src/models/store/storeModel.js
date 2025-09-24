import { constants } from "../../config/constants.js";
import { Model, Datatypes } from "sequelize";
import sequelize from "../../config/databse.js";

class Store extends Model {
    static associate(models) {
        Store.belongsTo(models.Agent, {
            foreignKey: "agent_id",
        });
        Store.hasMany(models.Banner, {
            foreignKey: "store_id",
        });
    }
}

Store.init(
    {
        id: {
            type: Datatypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            comment: "매장 ID",
        },
        agentId: {
            type: Datatypes.INTEGER,
            allowNull: false,
            field: "agent_id",
            comment: "그룹 ID",
        },
        name:{
            type: Datatypes.STRING(50),
            allowNull: false,
            field: "name",
            comment: "매장명",
        },
        code: {
            type: Datatypes.STRING(10),
            allowNull: false,
            unique: true,
            field: "code",
            comment: "매장코드(그룹코드+숫자4자리)",
        },
        state: {
            type:Datatypes.CHAR(10),
            allowNull: false,
            field: "state",
            defaultValue: "ready",
            comment: "상태(ready:준비, open:영업, off:휴업, close:폐업)",
        },
        ceoName: {
            type: Datatypes.STRING(50),
            allowNull: false,
            field: "ceo_name",
            comment: "대표자 이름",
        },
        zipcode: {
            type: DataTypes.STRING(6),
            field: "zipcode",
            comment: "사업장 주소",
        },
        description: {
            type: Datatypes.STRING(500),
            field: "description",
            comment: "설명",
        },
        openingTime: {
            type: Datatypes.JSON,
            field: "opening_time",
            defaultValue: constants.DEFAULT_STORE_TIME,
            comment: "운영시간",
        },
        mileage: {
            type: Datatypes.INTEGER,
            allowNull: false,
            field: "mileage",
            defaultValue: 0,
            comment: "마일리지",
        },
        enable: {
            type: Datatypes.BOOLEAN,
            allowNull: false,
            field: "enable",
            defaultValue: false,
            comment: "사용여부",
        },
    },
    {
        sequelize,
        modelName: "Store",
        tableName: "store",
        timestamps: true,
        paranoid: true,
    }
);

export default Store;
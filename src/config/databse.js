import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { queryLogger } from "../utils/logger.js";

dotenv.config();

const sequelize = new Sequelize({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: (sql) => queryLogger.info(sql),
    timezone: "+09:00",
    dialectOptions: {
        timezone: "Etc/GMT-9",
        dataStrings: true,
        typeCast: function (field, next) {
            if (field.type === "DATETIME") {
                return field.string();
            }
            return next();
        },
    },
    pool: {
        max: 30,
        min: 5,
        acquire: 30000,
        idle: 10000,
    },
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Unable to connect to the databse:", error);
    }
})();

export default sequelize;
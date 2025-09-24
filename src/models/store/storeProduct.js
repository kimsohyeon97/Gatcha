import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/databse";

class StoreProduct extends Model {
    static associate(models) {
        StoreProduct.belongsTo(models.Store, {
            foreignKey: "store_id",
            onDelete: "CASCADE",
        });
        StoreProduct.belongsTo(models.AgentProduct, {
            foreignKey: "agent_product_id",
        });
        
    }
}
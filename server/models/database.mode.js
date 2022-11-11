import connection from "../config/database";

class DatabaseModel{
    executeQuery(query){
        return new Promise(async(resolve, reject) => {
            connection.query(query, (error, result, data) => {
                (error) ? reject(error) : resolve(result);
            });
        });
    }
}

module.exports = DatabaseModel;
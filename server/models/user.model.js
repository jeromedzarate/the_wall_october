import Mysql            from "mysql";
import Bycrpt           from "bcrypt";

import DatabaseModel    from "./database.mode";
import UserHelper       from "../helpers/user.helper";

class UserModel extends DatabaseModel{
    fetchUserData = async(params) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let fetch_user_query = Mysql.format(`
                SELECT id, first_name, last_name, email, password
                FROM users
                WHERE ${ (params.user_id) ? "id" : "email" } = ?
            `, [(params.user_id) ? params.user_id : params.email]);

            response_data.result = await this.executeQuery(fetch_user_query);
            response_data.status = true;
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to fetch user information.";
        }

        return response_data;
    }

    processSignup = async(params) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            /* Check first if the email is already registered. */
            let get_user_data = await this.fetchUserData({ email: params.email });

            if(get_user_data.result.length){
                if(params.is_signup){
                    response_data.message = "Email is already registered."
                }
                else{
                    let [{ password, id }] = get_user_data.result
                    /* Check if password is match */
                    if(Bycrpt.compareSync(params.password, password)){
                        response_data.status = true;
                        response_data.result = { id, redirect_url: "/wall" };
                    }
                    else{
                        response_data.error = "Encountered an error while validating password.";
                        response_data.message = "Incorrect email or password.";
                    }
                }
            }
            else{
                if(params.is_signup){
                    let userHelper = new UserHelper();
                    let validate_signup_params = await userHelper.validateSignupParameters(params);

                    if(validate_signup_params.status){
                        /* Encrypt the password  */
                        let encrypted_password = Bycrpt.hashSync(params.password, 10);

                        /* Insert user data into the database */
                        let create_user_query = Mysql.format(`
                            INSERT INTO users (first_name, last_name, email, password, created_at, updated_at)
                            VALUES(?, ?, ?, ?, NOW(), NOW())
                        `, [params.first_name, params.last_name, params.email, encrypted_password]);
                        let create_user = await this.executeQuery(create_user_query);

                        if(create_user.affectedRows){
                            response_data.status = true;
                            response_data.result = { id: create_user.insertId, redirect_url: "/wall" };
                        }
                        else{
                            response_data.error = "Encountered an error while saving user data into database;";
                            response_data.message = "Failed to create user.";
                        }

                    }
                    else{
                        response_data = validate_signup_params
                    }
                }
                else{
                    response_data.message = "Email is not yet registered";
                }
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to process signup data";
        }

        return response_data;
    }
}

export default UserModel;
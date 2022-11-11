import { validateFields } from "../helpers/global.helper";
import UserModel from "../models/user.model";

class UserController{
    constructor(){}

    landingPage = async (req, res) => {
        res.render("landing_page");
    }

    processSignup = async (req, res) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let required_fields = ["email", "password"];
            let optional_fields = ["is_signup"];

            if(req.body.is_signup){
                required_fields.push("first_name", "last_name", "confirm_password");
            }

            let check_fields = validateFields(required_fields, optional_fields, req);

            if(check_fields.status){
                let userModel = new UserModel();
                response_data = await userModel.processSignup(check_fields.result);

                if(response_data.status){
                    req.session.user_id = response_data.result.id;
                }
            }
            else{
                response_data = check_fields;
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Encountered an error while processing signup data";
        }

        res.json(response_data);
    }
}

export default(function user(){
    return new UserController();
})();
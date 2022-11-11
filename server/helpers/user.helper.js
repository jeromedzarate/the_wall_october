class UserHelper{
    constructor(){}

    validateSignupParameters = async(params) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let error_fields = [];
            let password_value = "";

            Object.entries(params).forEach(([field_name, field_value]) =>{
                if(["first_name", "last_name"].includes(field_name) && /[0-9]/.test(field_value)){
                    error_fields.push(field_name);
                }

                // if(field_name === "email"){}

                if(field_name === "password"){
                    password_value = field_value;

                    if(field_value.length < 8){
                        error_fields.push(field_name);
                    }
                }

                if(field_name === "confirm_password" && password_value !== field_value){
                    error_fields.push(field_name);
                }
            });

            response_data.status = !error_fields.length;
            response_data.result = (!response_data.status) ? error_fields : [];
            response_data.message = (!response_data.status) ? `Validating parameters failed. Please check the following fields: ${ error_fields.join(",") }` : ""
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Encountered an error while validating signup parameters.";
        }

        return response_data;
    }
}

module.exports = UserHelper;
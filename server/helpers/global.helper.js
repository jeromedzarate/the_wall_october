class GlobalHelper{
    constructor(){}
    
    validateFields = (required_fields, optional_fields = [], req) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            if(!Array.isArray(required_fields) || !Array.isArray(optional_fields)){
                throw Error("Arguments have incorrect data type.");
            }

            let all_fields = required_fields.concat(optional_fields);
            let sanitized_data = {};
            let missing_fields = [];

            all_fields.map(field => {
                let field_value = (req.body[field] !== undefined) ? req.body[field] : "";

                if(!String(field_value).trim() && required_fields.includes(field)){
                    missing_fields.push(field);
                }
                else{
                    sanitized_data[field] = field_value;
                }
            });

            response_data.status = !missing_fields.length;
            response_data.result = (response_data.status) ? sanitized_data : missing_fields;
            response_data.message = (!response_data.status) ? `Missing fields: ${ missing_fields.join(",") }` : "";
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Encountered an error while validating signup parameters";
        }

        return response_data;
    }
}

let globalHelper = new GlobalHelper;

module.exports = { validateFields: globalHelper.validateFields };
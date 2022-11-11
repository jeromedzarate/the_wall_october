$(document).ready(function(){
    $("body")
        .on("click", "#show_signin_btn", showSigninForm)
        .on("click", "#show_signup_btn", showSignupForm)
        .on("submit", "#signup_form, #signin_form", processSignUp)
});

function showSigninForm(){
    $("#signup_container").attr("hidden", true);
    $("#signin_container").removeAttr("hidden");
}

function showSignupForm(){
    $("#signup_container").removeAttr("hidden");
    $("#signin_container").attr("hidden", true);
}

function processSignUp(){
    let signup_form = $(this);

    if(parseInt(signup_form.attr("data-is_processing")) === 0){
        signup_form.attr("data-is_processing", 1);

        $.post(signup_form.attr("action"), signup_form.serialize(), function(signup_response){
            if(signup_response.status){
                window.location.href = signup_response.result.redirect_url;
            }
            else{
                alert(signup_response.message)
            }
        });

        signup_form.attr("data-is_processing", 0)
    }

    return false;
}
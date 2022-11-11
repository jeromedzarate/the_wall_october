$(document).ready(function(){
    $("body")
        .on("submit", "#create_post_form, #create_comment_form", processCreatePost)
        .on("click", ".delete_post_btn", deletePost)
        .on("click", ".create_comment_btn", showCreateCommentForm)
});

function processCreatePost(){
    let create_post_form = $(this);

    if(parseInt(create_post_form.attr("data-is_processing")) === 0){
        create_post_form.attr("data-is_processing", 1);

        $.post(create_post_form.attr("action"), create_post_form.serialize(), function(create_post_response){
            if(create_post_response.status){
                if(create_post_response.is_comment){
                    console.log(create_post_form.parents(".post_container"));
                    create_post_form.parents(".post_container").find(".post_comment_container").append(create_post_response.html);
                }
                else{
                    $("#wall_post_container").prepend(create_post_response.html);
                }
            }
            else{
                alert(create_post_response.message)
            }
        });

        create_post_form.attr("data-is_processing", 0)
    }

    return false;
}

function deletePost(){
    let remove_post_form = $("#remove_post_form");
    let post_id = $(this).parents().attr("data-post_id");

    remove_post_form.find("#post_id").val(post_id);

    if(parseInt(remove_post_form.attr("data-is_processing")) === 0){
        remove_post_form.attr("data-is_processing", 1);

        $.post(remove_post_form.attr("action"), remove_post_form.serialize(), function(remove_post_response){
            if(remove_post_response.status){
                $("#wall_post_container").html(remove_post_response.html);
            }
            else{
                alert(remove_post_response.message)
            }
        });

        remove_post_form.attr("data-is_processing", 0)
    }

    return false;
}


function showCreateCommentForm(){
    let create_comment_form = $("#create_comment_form");
    let post_id = $(this).parents().attr("data-parent_post_id");

    create_comment_form.find("#post_id").val(post_id);
    create_comment_form.removeAttr("hidden");

    $(this).parents(".post_container").append(create_comment_form);
}
import Ejs                  from "ejs";
import Path                 from "path";

import { validateFields }   from "../helpers/global.helper";
import UserModel            from "../models/user.model";
import WallModel            from "../models/wall.model";

class WallController{
    constructor(){}

    wallPage = async (req, res) => {
        if(!req.session.user_id){
            res.redirect("/");
        }


        let userModel = new UserModel();
        let { result: [user_data] } = await userModel.fetchUserData({ user_id: req.session.user_id });

        let wallModel = new WallModel();
        let { result: wall_posts } = await wallModel.fetchPost();
        let post_ids = wall_posts.map(post_data => { return post_data.post_id });
        let post_comments = {};

        if(post_ids.length){
            let { result: [post_comments_details] } = await wallModel.fetchComments(post_ids);
            post_comments = JSON.parse(post_comments_details.post_comments);
        }
        res.render("wall_page", { USER_DATA: user_data || {}, WALL_POSTS: (wall_posts.length) ? wall_posts : [], COMMENTS: post_comments });
    }

    createPost = async (req, res) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let check_fields = validateFields(["user_id", "message"], ["post_id"], req);

            if(check_fields.status){
                let wallModel = new WallModel();
                response_data = await wallModel.createPost(check_fields.result);

                if(response_data.status){
                    response_data.html = await Ejs.renderFile(Path.join(__dirname, "../../views/post_template.ejs"),
                        { user_id: check_fields.result.user_id, posts: response_data.result, comments: [] },
                        {async: true}
                    );
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

    removePost = async(req, res) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let check_fields = validateFields(["user_id", "post_id"], [], req);

            if(check_fields.status){
                let wallModel = new WallModel();
                response_data = await wallModel.removePost(check_fields.result);

                if(response_data.status){
                    response_data.html = await Ejs.renderFile(Path.join(__dirname, "../../views/post_template.ejs"),
                        { 
                            user_id: check_fields.result.user_id,
                            posts: (response_data.result.posts.length) ? response_data.result.posts : [],
                            comments: response_data.result?.comments|| {}
                        },
                        {async: true}
                    );
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

export default(function wall(){
    return new WallController();
})();
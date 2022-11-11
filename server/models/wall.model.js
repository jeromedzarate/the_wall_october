import Mysql            from "mysql";

import DatabaseModel    from "./database.mode";
import UserModel        from "./user.model";
import Constants from "../config/constants";

class WallModel extends DatabaseModel{

    fetchPost = async (post_id = null) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let fetch_post_query = Mysql.format(`
                SELECT users.id, CONCAT_WS(" ", first_name, last_name) AS name,
                    posts.id AS post_id, posts.parent_post_id, posts.message, DATE_FORMAT(posts.created_at, "%b %e, %Y at %T") AS date_posted
                FROM posts
                INNER JOIN users ON users.id = posts.user_id 
                WHERE ${ (!post_id) ? 'posts.parent_post_id IS NULL AND' : ''} posts.is_archived = ?
                ${ (post_id) ? "AND posts.id = ?" : "" }
                ORDER BY posts.created_at DESC;
            `, (post_id) ? [Constants.ARCHIVED_STATUS.active, post_id] : [Constants.ARCHIVED_STATUS.active]);

            response_data.result = await this.executeQuery(fetch_post_query);
            response_data.status = true;
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to fetch post information.";
        }

        return response_data; 
    } 

    createPost = async(params) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let userModel = new UserModel();
            let fetch_user_data = await userModel.fetchUserData({ user_id: params.user_id });

            if(fetch_user_data.result.length){
                let create_post_query = Mysql.format(`
                    INSERT INTO posts (user_id, message, parent_post_id, is_archived, created_at, updated_at)
                    VALUES (?, ?, ?, ?, NOW(), NOW())
                `, [params.user_id, params.message, (params.post_id) ? params.post_id : null, Constants.ARCHIVED_STATUS.active]);
                let create_post = await this.executeQuery(create_post_query);

                if(create_post.affectedRows){
                    let { result: post_details } = await this.fetchPost(create_post.insertId);

                    response_data.status = true;
                    response_data.is_comment = !!params.post_id
                    response_data.result = post_details;
                }
                else{
                    response_data.message = "Failed to create Post."
                }
            }
            else{
                response_data.message = "User does not exists."
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to process post data.";
        }

        return response_data;
    }

    removePost = async(params) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let { result: post_details } = await this.fetchPost(params.post_id);

            if(post_details.length){
                if(post_details[0].id === parseInt(params.user_id)){
                    let remove_post_query = Mysql.format(`
                        UPDATE posts SET is_archived = ?, updated_at = NOW()
                        WHERE id = ?
                    `, [Constants.ARCHIVED_STATUS.archived, params.post_id]);
                    let remove_post = await this.executeQuery(remove_post_query);

                    if(remove_post.affectedRows){
                        /* Fetch the remaining posts */
                        let { result: post_details } = await this.fetchPost();
                        
                        let post_ids = post_details.map(post_data => { return post_data.post_id });
                        let post_comments = [];
                
                        if(post_ids.length){
                            let { result: [post_comments_details] } = await this.fetchComments(post_ids);
                            post_comments = JSON.parse(post_comments_details.post_comments);
                        }

                        response_data.result = { posts: post_details, comments: post_comments };
                        response_data.status = true;
                    }
                    else{
                        response_data.message = "Failed to remove post."
                    }
                }
                else{
                    response_data.message = "You're not allowed to remove this post."
                }
            }
            else{
                response_data.message = "Post does not exists."
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to remove post.";
        }

        return response_data;
    }

    fetchComments = async(post_ids) => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let fetch_post_comments_query = Mysql.format(`
                SELECT JSON_OBJECTAGG(parent_post_id, comments) AS post_comments
                FROM(
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', ANY_VALUE(users.id),
                            'name', CONCAT_WS(" ", ANY_VALUE(first_name), ANY_VALUE(last_name)),
                            'post_id', ANY_VALUE(posts.id),
                            'message', ANY_VALUE(posts.message),
                            'date_posted', DATE_FORMAT(ANY_VALUE(posts.created_at), "%b %e, %Y at %T")
                            )
                    ) AS comments, posts.parent_post_id
                    FROM posts
                    INNER JOIN users ON users.id = posts.user_id 
                    WHERE posts.is_archived = ? AND posts.parent_post_id IN (?)
                    GROUP BY parent_post_id
                ) AS comments;
            `, (post_ids) ? [Constants.ARCHIVED_STATUS.active, post_ids] : [Constants.ARCHIVED_STATUS.active]);

            response_data.result = await this.executeQuery(fetch_post_comments_query);
            response_data.status = true;
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to fetch post information.";
        }

        return response_data; 
    }
}

export default WallModel;
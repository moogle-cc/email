import React from 'react';
import moment from 'moment';
import "./commentList.css";

const CommentList = ({commentArray}) => {
    
    // let comment_html = document.getElementById("comments_html");
    return (
        <div className="commentList">
            <h3 className="emailUesrname">Your Comments</h3>
            <ul>
            {
                commentArray ?
                commentArray.map((comment, index) => (
                    <li style={{backgroundColor: index%2!==0 ? "white" : "", padding:" 1em 0.5rem"}}>
                        <div><strong>{comment.commenter_name} @ {moment(comment.commented_at).calendar()}</strong></div>
                        <div dangerouslySetInnerHTML={{ __html: comment.html_part }} />
                    </li>
                )) 
                : null
            }
            </ul>
        </div>
    )
}

export default CommentList;
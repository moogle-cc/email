import axios from 'axios';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import "./commentList.css";

const CommentList = ({currentEmailId, COMMENT_POST_URL}) => {
    let [commentArray, setCommentArray] = useState([]);
    useEffect(() => {
        if(currentEmailId)
            getComments(currentEmailId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    })
    const getComments = async (currentEmailId) => {
        let idToken = JSON.parse(localStorage.userDetails).id_token;
        await axios({
            url: `${COMMENT_POST_URL}?email_id=${currentEmailId}`,
            headers: {'Authorization': idToken},
          })
          .then(async values => {
            let comments = values.data.comments;
            comments = comments.map((comment) => JSON.parse(comment))
            comments.sort((a, b) => (a.commented_at < b.commented_at) ? 1 : -1)
            if(comments !== commentArray)
                await setCommentArray(comments);  
          })
    }
    // let comment_html = document.getElementById("comments_html");
    return (
        <div className="commentList">
            <h3 className="emailUesrname">Your Comments</h3>
            <ul>
            {
                commentArray ?
                commentArray.map((comment, index) => (
                    <li style={{backgroundColor: index%2===0 ? "#f5f5f5" : "", margin: "1rem 0", padding:"0.5rem"}}>
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
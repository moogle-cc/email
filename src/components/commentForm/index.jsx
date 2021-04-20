import React, { useEffect, useState } from 'react';
import MarkdownView from 'react-showdown';
import axios from 'axios';
import "./commentForm.css"

const CommentForm = ({currentEmailId, COMMENT_POST_URL, getComments}) => {
    const [commentData, setCommentData] = useState({
        'thread_identifier': "",
        'update_type': "NEW",
        'commenter_name': "",
        'commenter_id': "",
        'commented_at': "",
        'html_part': "",
        'text_part': "",
    });
    useEffect(() => {
        let idToken = JSON.parse(localStorage.userDetails).id_token;
        let userDetails = JSON.parse(atob(idToken.split('.')[1]));
        setCommentData({...commentData, commenter_name: userDetails["cognito:username"], commenter_id: userDetails.email,thread_identifier: currentEmailId});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentEmailId]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const handleChange =async (e) => {
        const {name, value} = e.target;
        await setCommentData({...commentData, [name]: value});
    }
    const handleSubmit = async(e) => {
        await e.preventDefault();
        let commented_at = new Date().getTime();
        let idToken = JSON.parse(localStorage.userDetails).id_token;
        const html_part = await document.getElementById("comment-markdown-view").innerHTML;
        await axios({
            url: `${COMMENT_POST_URL}`,
            headers: {'Authorization': idToken},
            method: "POST",
            data: {...commentData, commented_at, html_part}
          })
          .then(async (response) => {
            console.log(response);
          }).catch((error) => {
            console.log(error)
          })
          await getComments(currentEmailId);
          await setCommentData({...commentData,text_part: "", html_part:"", commented_at: undefined })
    }
    return (
        <form className="commentForm">
            <div className="field">
                <label className="label">Comment Here  <i className="infoButton" onClick={(e) => {e.preventDefault(); setIsModalVisible(true)}} class="fa fa-info-circle" aria-hidden="true"></i></label>
                <div className="control">
                    <textarea  maxLength="250" className="textArea" name="text_part" value={commentData.text_part} onChange={handleChange} placeholder="Example: This email needs to be re-sent to HR"></textarea>
                </div>
            </div>
            <button className="submitBtn"  onClick={handleSubmit}><i class="fa fa-paper-plane" aria-hidden="true"></i></button>  
            <MarkdownView id="comment-markdown-view" markdown={commentData.text_part || "You can see your comment preview here"}/>     
            <div className={isModalVisible ? "modal is-active" : "modal"}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Markdown Cheatsheet</p>
                        <button className="delete" onClick={(e)=> {e.preventDefault(); setIsModalVisible(false)}} aria-label="close"></button>
                    </header>
                    <section className="modal-card-body">
                        <ul className="pl-5">
                            <li>&#8226; **Bold** : <strong>Bold</strong></li>
                            <li>&#8226; *Italics*: <em>Italics</em></li>
                            <li>&#8226; [Link Text](https://moogle.cc): <a href="https://moogle.cc">Link Text</a></li>
                            <li>&#8226; We don't yet support emojis</li>
                            <li>&#8226; We except only the first 250 characters</li>
                        </ul>
                    </section>
                </div>
            </div>   
        </form>
    )
}

export default CommentForm;
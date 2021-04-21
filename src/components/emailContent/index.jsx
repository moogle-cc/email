import React, { useEffect, useState } from 'react';
import CommentForm from '../commentForm';
import CommentList from "../commentList"
import axios from 'axios';
import moment from 'moment';
import "./emailContent.css";

const EmailContent = ({emailList, COMMENT_POST_URL}) => {
    const [commentArray, setCommentArray] = useState([]);
    useEffect(() => {
        if(emailList.currentEmailId)
            getComments(emailList.currentEmailId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emailList.currentEmail]);
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
          });
    }
    const iframeSrc = ()=>{
        if(emailList.emailContent){
            const blob = new Blob([emailList.emailContent], { type: 'text/html' });
            return URL.createObjectURL(blob);
        }
        return undefined;
    };
    const attachments = ()=>{
        if(emailList.currentEmail){
            console.log(`looking for attachments @ emailContent.attachments ${Object.keys(emailList.currentEmail.emailContent)}`);
            return emailList.currentEmail.emailContent.attachments;
        } 
        return undefined;
    };
    const handlShowComments = () => {
        let data = document.getElementById("comment-section");
        let iframedata = document.getElementById("frame");
        if(data.classList.contains('isInvisible')) {
            data.classList.remove('isInvisible');
            iframedata.classList.remove("largeFrame");
            iframedata.classList.add("smallFrame");
            document.getElementsByClassName("commentIcon")[0].classList.add("showingComments")
        }
        else {
            data.classList.add('isInvisible');
            iframedata.classList.remove("smallFrame");
            iframedata.classList.add("largeFrame");
            document.getElementsByClassName("commentIcon")[0].classList.remove("showingComments")
        }
    }
    const handleShowAttachments = (e) => {
        e.preventDefault()
        let attachments = document.getElementsByClassName("attachmentsContainer")[0];
        if(attachments && attachments.classList.contains("dontDisplay")) attachments.classList.remove("dontDisplay");
        else if(attachments) attachments.classList.add("dontDisplay");
    }
    return(
        <div id="email-content" style={{width: "50%"}}className="emailContent">
            {console.log((emailList.currentEmail))}
            <div class="emailHeader flex">
                <img src="https://moogle.cc/media/moogle-comment-share.png" alt="email"/>
                <h3 class="flex  align-center" style={{width: "86%"}}> 
                    <span> {emailList.currentEmail.emailContent.subject}</span>
                    <span className="normalFont" style={{marginLeft: "auto"}}>{moment(emailList.currentEmail.emailContent.date).format("DD/MM/YYYY")}</span>
                </h3>
                
                <div className="icons">
                    <div className="attachmentIcon" onClick={handleShowAttachments}><i class="fa fa-paperclip fa-2x" aria-hidden="true"></i></div>
                    <div className="commentIcon" onClick={handlShowComments}>
                        <i class="fa fa-comments fa-3x" aria-hidden="true"></i>
                        <span>{commentArray.length}</span>
                    </div>
                </div>
            </div>
            <div className="emailMetaData normalFont"> 
                <div style={{maxWidth: "80%"}}>Send to: {emailList.currentEmail.emailContent.to.value.map(sent => `${sent.address}`).join(", ")}</div>
                <div style={{marginLeft: "auto"}}>Size: {emailList.currentEmail.Size} bytes</div>
            </div>
            {
                !iframeSrc() ? <span className="has-text-weight-light">{ emailList.statusMsg }</span> 
                :
                <div className="iframeContainer"> 
                    <div className="dontDisplay attachmentsContainer">
                        {
                            attachments() && attachments().length > 0 ? <h6 style={{fontFamily: "Poppins", fontWeight: "600"}}>Attachments</h6>: <h6 style={{fontFamily: "Poppins", fontWeight: "600"}}>No Attachments</h6>
                        }
                        <ul className="menu">
                            {
                            attachments() && attachments().length>0 ?
                            attachments().map((attachment, idx) => (
                                <li  style={{'cursor': 'pointer'}} key={`attachment-idx-`+idx} id={`attachment-idx-`+idx} className='button'>
                                    <a href={`${attachment.contentLocation}`} download>{attachment.filename}</a>
                                </li>
                            ))
                            : null
                            }
                        </ul>
                    </div>
                    <iframe  className="largeFrame" id="frame" title="1" frameBorder="0" src={iframeSrc()}></iframe>
                </div>
            } 
            <div className="isInvisible" id="comment-section">
                <CommentForm currentEmailId={emailList.currentEmailId} COMMENT_POST_URL={COMMENT_POST_URL} getComments={getComments}/>
                <CommentList commentArray={commentArray} />
            </div>
        </div>
    )
}

export default EmailContent;
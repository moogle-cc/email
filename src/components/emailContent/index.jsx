import React, { useEffect } from 'react';
import CommentForm from '../commentForm';
import CommentList from "../commentList"
import "./emailContent.css";

const EmailContent = ({emailList, COMMENT_POST_URL}) => {
    useEffect(() => {}, [emailList.currentEmail]);

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
        }
        else {
            data.classList.add('isInvisible');
            iframedata.classList.remove("smallFrame");
            iframedata.classList.add("largeFrame");
        }
    }
    return(
        <div id="email-content" style={{width: "50%"}}className="emailContent">
            <div class="emailHeader flex">
                <img src="https://moogle.cc/media/moogle-comment-share.png" alt="email"/>
                <h1 class="flex justify-center align-center"> <span> Jobs </span></h1>
                <div className="commentIcon" onClick={handlShowComments}><i class="fa fa-comments fa-3x" aria-hidden="true"></i></div>
            </div>
            {
                !iframeSrc() ? <span className="has-text-weight-light">{ emailList.statusMsg }</span> 
                :
                <div >
                    {
                        attachments() && attachments().length > 0 ? <h6 style={{fontFamily: "Poppins", fontWeight: "600"}}>Attachments</h6>: null
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
                    <iframe  className="largeFrame" id="frame" title="1" frameBorder="0" src={iframeSrc()}></iframe>
                    
                </div>
            } 
            <div className="isInvisible" id="comment-section">
                <CommentForm currentEmailId={emailList.currentEmailId} COMMENT_POST_URL={COMMENT_POST_URL}/>
                <CommentList currentEmailId={emailList.currentEmailId} COMMENT_POST_URL={COMMENT_POST_URL}/>
            </div>
            
        </div>
    )
}

export default EmailContent;
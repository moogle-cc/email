import React, { useEffect } from 'react';
import "./emailContent.css";

const EmailContent = ({emailList}) => {
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
    return(
        <div style={{width: "50%"}} id="email-content" className="emailContent">
            <div class="emailHeader flex">
                <img src="https://moogle.cc/media/moogle-comment-share.png" alt="email"/>
                <h1 class="flex justify-center align-center"> <span> Jobs </span></h1>
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
                <iframe  title="1" frameBorder="0"style={{overflow:'hidden',"overflowX":'hidden',"overflowY":'hidden',height:"95vh",width:"100%"}} src={iframeSrc()}></iframe>
                </div>
            }   
        </div>
    )
}

export default EmailContent;
import React, { useEffect } from 'react';

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
        <div className="" id="email-content">
            <h5 className="has-text-weight-light">Email Preview</h5>
            {
                !iframeSrc() ? <span className="has-text-weight-light">{ emailList.statusMsg }</span> 
                :
                <div >
                {
                    attachments() && attachments().length > 0 ? <h6 className="has-text-weight-light" v-if="attachments.length > 0">Attachments</h6>: null
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
                <iframe  frameBorder="0" style={{overflow:'hidden',"overflowX":'hidden',"overflowY":'hidden',height:"100vh",width:"100%"}} height="100vh" width="100vw" src={iframeSrc()}></iframe>
                </div>
            }   
        </div>
    )
}

export default EmailContent;
import {useEffect, useState} from 'react';
import moment from 'moment';
import './emailList.css';
import {emailWasRead, markEmailReadStatus} from '../../utils.js';
 
const EmailList = ({emailList, buckets, fqdn, setEmailList}) => {
  const [emailReadStatus, setEmailReadStatus] = useState(localStorage.emailReadStatus ? JSON.parse(localStorage.emailReadStatus) : {read: new Set(), unread: new Set()});
  useEffect(() => {
    clearSelectedEmail();
  }, [emailList.emailSet]);

  useEffect(() => {
    localStorage.setItem('emailReadStatus', JSON.stringify(emailReadStatus));
  }, [emailReadStatus]);

  const showEmail=(emlId)=>{
    let tempcurrentEmail = emailList.emailSet.find((e) => e.Key === emlId);
    let tempcurrentEmailId = undefined;
    if(tempcurrentEmail) tempcurrentEmailId = emlId.substring(fqdn.length + 1);
    let tempemailContent = `We could not download the contents of this email ${emlId}.<br> This usually means the email isn't properly formatted. Your email admin should be able to help.`;
    if(tempcurrentEmail && tempcurrentEmail.emailContent){
      tempemailContent = tempcurrentEmail.emailContent.text;
      if(tempcurrentEmail.emailContent.html) tempemailContent = tempcurrentEmail.emailContent.html;
      else if(tempcurrentEmail.emailContent.textAsHtml) tempemailContent = tempcurrentEmail.emailContent.textAsHtml;
    }
    if(emailList.currentEmail === tempcurrentEmail){
      setEmailList({...emailList, emailContent: undefined, currentEmail: undefined, currentEmailId: undefined})
    }
    else if(tempcurrentEmailId) setEmailList({...emailList, emailContent: tempemailContent, currentEmail: tempcurrentEmail, currentEmailId: tempcurrentEmailId});
    else setEmailList({...emailList, emailContent: tempemailContent, currentEmail: tempcurrentEmail});
    let tempReadStatus = JSON.parse(JSON.stringify(emailReadStatus));
    markEmailReadStatus({Key: emlId, readStatus: true}, tempReadStatus);
    setEmailReadStatus(tempReadStatus);
  };

  const splitName = (name) => {
    const isContainsName = name.includes(' ');
    if(isContainsName) {
      const tempName = name.split('<')[0];
      return tempName.substring(0 , 19)
    }else {
      const tempName = name.split('@')[0];
      return tempName.substring(0 , 19);
    }
  }
  
  const selectEmail = (idx) => {
    if(idx){
      const noOfEmails = document.querySelectorAll('[id]');
      const selectedEmail = document.getElementById(idx);
      noOfEmails.forEach((data) => {
        if(data.classList.contains('selectedEmail') && data !== selectedEmail) data.classList.remove('selectedEmail')
      });
      if(!selectedEmail.classList.contains("selectedEmail")){
        document.querySelector('[id="'+idx+'"]').classList.add('selectedEmail');
      }else{
        document.querySelector('[id="'+idx+'"]').classList.remove('selectedEmail');
      }
      return true;
    }
  }
  const clearSelectedEmail = ()  => {
    const noOfEmails = document.querySelectorAll('[id]');
    noOfEmails.forEach((data) => {
      if(data.classList.contains('selectedEmail')) data.classList.remove('selectedEmail')
    });
  }
  let selectedBucket = document.getElementsByClassName("selectedBucket")[0];
  let selectedBucketId = selectedBucket ? selectedBucket.id : 0;
  return (
    <div class="emailListContainer" style={{"width": emailList.currentEmail ? "50%" : "100%"}}>
          <div class="emailHeader flex">
              <img src="https://moogle.cc/media/moogle-comment-share.png" alt="email"/>
              <h1 class="flex justify-center align-center"> <span style={{textTransform: "capitalize"}}> {buckets ? buckets[selectedBucketId].name : "All"} </span></h1>
          </div>
          <ul class="emailLists" >
              {
                emailList.emailSet ?
                emailList.emailSet.map((email, idx)=> (
                  <li style={{'cursor': 'pointer'}} key={`email-idx-${idx}`} id={email.Key} onClick={async (e) =>{e.preventDefault(); selectEmail(email.Key); await showEmail(email.Key)}}>
                    {
                      email.emailContent ? 
                        <div className= "email flex ">
                          <img src="https://telegra.ph/file/01c9dae93673d009e5dde.jpg" alt="telephone"/>
                          <h3 className={emailWasRead(email, emailReadStatus)? "normalFont emailUsername": "emailUsername"}>{ splitName(email.emailContent.from.text) }</h3>
                          <p className={emailWasRead(email, emailReadStatus)? "normalFont emailTextPreview": "emailTextPreview"}>{ email.emailContent.subject ? `${email.emailContent.subject.slice(0, 60)}...` : "(no subject)"}</p>
                          <div className={emailWasRead(email, emailReadStatus)? "smallFont emailDatePreview": "emailDatePreview"}>{moment(email.emailContent.date).format('DD/MM/YYYY hh:mm:ss')}</div>
                        </div>
                      : null
                    }
                    
                  </li>
                ))
                : <span>{emailList.statusMsg}</span>
              }  
          </ul>
      </div>
    )
}

export default EmailList;

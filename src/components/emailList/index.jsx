import React, {useEffect} from 'react';

const EmailList = ({emailList, buckets, fqdn, setEmailList}) => {
    useEffect(() => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emailList.emailSet]);

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
      if(emailList.currentEmail === tempcurrentEmail)setEmailList({...emailList, emailContent: undefined, currentEmail: undefined, currentEmailId: undefined})
      else if(tempcurrentEmailId) setEmailList({...emailList, emailContent: tempemailContent, currentEmail: tempcurrentEmail, currentEmailId: tempcurrentEmailId});
      else setEmailList({...emailList, emailContent: tempemailContent, currentEmail: tempcurrentEmail});
      let emailReadStatus = JSON.parse(localStorage.emailReadStatus);
      let emailReadStatusIndex = emailReadStatus.findIndex(readEmail => readEmail.Key === emlId)
      emailReadStatus[emailReadStatusIndex].readStatus = true;
      localStorage.setItem("emailReadStatus", JSON.stringify(emailReadStatus));
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
      if(buckets){
        const noOfEmails = document.querySelectorAll('[idx]');
        noOfEmails.forEach((data) => {
          if(data.classList.contains('selectedEmail')) data.classList.remove('selectedEmail')
          document.querySelector('[id="'+idx+'"]').classList.add('selectedEmail');
        });
        return true;
      }
    }
    let selectedBucket = document.getElementsByClassName("selectedBucket")[0];
    let selectedBucketId = selectedBucket ? selectedBucket.id : 0;
    return (
      <div class="emailListContainer" style={{"width": emailList.currentEmail ? "50%" : "100%"}}>
            <div class="emailHeader flex">
                <img src="https://moogle.cc/media/moogle-comment-share.png" alt="email"/>
                <h1 class="flex justify-center align-center"> <span style={{textTransform: "capitalize"}}> {buckets ? buckets[selectedBucketId].name : "All"} </span></h1>
            </div>
            <ul class="emailLists" style={{overflowY: "scroll", maxHeight: "95vh"}}>
                {
                  emailList.emailSet ?
                  emailList.emailSet.map((email, idx)=> (
                    <li style={{'cursor': 'pointer'}} key={`email-idx-${idx}`} id={email.Key} onClick={(e) =>{e.preventDefault(); selectEmail(email.Key); showEmail(email.Key)}}>
                      {
                        email.emailContent ? 
                          <div className= "email flex ">
                            <img src="https://telegra.ph/file/01c9dae93673d009e5dde.jpg" alt="telephone"/>
                            <h3 className={JSON.parse(localStorage.emailReadStatus).find(readEmail => readEmail.Key === email.Key && readEmail.readStatus)? "normalFont emailUesrname": "emailUesrname"}>{ splitName(email.emailContent.from.text) }</h3>
                            <p className={JSON.parse(localStorage.emailReadStatus).find(readEmail => readEmail.Key === email.Key && readEmail.readStatus)? "normalFont emailTextPreview": "emailTextPreview"}>{ email.emailContent.subject ? `${email.emailContent.subject.slice(0, 60)}...` : "(no subject)"}</p>
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
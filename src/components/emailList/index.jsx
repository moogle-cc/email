import React, {useEffect} from 'react';
import '../../New.css';
const EmailList = ({emailList, fqdn, setEmailList}) => {
    useEffect(() => {
      if(emailList.emailSet)
        showEmail(emailList.emailSet[0].Key);
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
      if(tempcurrentEmailId) setEmailList({...emailList, emailContent: tempemailContent, currentEmail: tempcurrentEmail, currentEmailId: tempcurrentEmailId});
      else setEmailList({...emailList, emailContent: tempemailContent, currentEmail: tempcurrentEmail});
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
      const noOfEmails = document.querySelectorAll('[id]');
      noOfEmails.forEach((data) => {
        if(data.classList.contains('selectedEmail')) data.classList.remove('selectedEmail')
        document.querySelector('[id="'+idx+'"]').classList.add('selectedEmail');
      })
      console.log(noOfEmails.length)
      // document.querySelector('[id="'+idx+'"]').classList.add('selectedEmail');
      return true;
    }

    return (
      <div class="emailListContainer">
            <div class="emailHeader flex">
                <img src="https://moogle.cc/media/moogle-comment-share.png" alt="email"/>
                <h1 class="flex justify-center align-center"> <span> Jobs </span></h1>
            </div>
            <ul class="emailLists">
              <div style={{overflowY: "scroll", maxHeight: "95vh"}}>
                {
                  emailList.emailSet ?
                  emailList.emailSet.map((email, idx)=> (
                    <li style={{'cursor': 'pointer'}} key={`email-idx-${idx}`} id={idx} onClick={() =>{selectEmail(idx); showEmail(email.Key)}}>
                      {
                        email.emailContent ? 
                          <span >
                            <div className="email flex">
                              <img src="https://telegra.ph/file/01c9dae93673d009e5dde.jpg" alt="telephone"/>
                              <h3 className="emailUesrname">{ splitName(email.emailContent.from.text) }</h3>
                              <p className="emailTextPreview">{ email.emailContent.subject || "(no subject)"}</p>
                            </div>
                          </span>
                        : null
                      }
                      
                    </li>
                  ))
                  : null
                }
              </div>
              
            </ul>
        </div>
            
    )
}

export default EmailList;
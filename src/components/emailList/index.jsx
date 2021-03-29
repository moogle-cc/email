import React, {useEffect} from 'react';

const EmailList = ({emailList, friendlyDate, fqdn, setEmailList}) => {
    useEffect(() => {
      if(emailList.emailSet)
        showEmail(emailList.emailSet[0].Key);
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

    return (
        <aside className="menu primary-background">
            <p className="menu-label" style={{fontFamily: "Poppins", fontWeight: "600"}}>
              Emails
            </p>
            <ul className="menu-list">
              {
                emailList.emailSet ?
                emailList.emailSet.map((email, idx)=> (
                  <li style={{'cursor': 'pointer'}} key={`email-idx-${idx}`} id={idx} onClick={() => showEmail(email.Key)} className="is-size-6">
                    {
                      email.emailContent ? 
                      <a >
                        { email.emailContent.subject || "(no subject)"}
                        {
                          email.emailContent.headers['x-ses-spam-verdict'] && email.emailContent.headers['x-ses-spam-verdict'] !== 'PASS' ?
                          <div className="icon-text" >
                            <span className="icon has-text-warning">
                              <i className="fas fa-exclamation-triangle"></i>
                            </span>
                            <span className="icon is-size-7">&nbsp;Spam</span>
                          </div> : null
                        }
                        {
                          email.emailContent.headers['x-ses-virus-verdict'] && email.emailContent.headers['x-ses-virus-verdict'] !== 'PASS' ?
                          <div className="icon-text" >
                            <span className="icon has-text-danger">
                              <i className="fas fa-ban"></i>
                            </span>
                            <span className="icon is-size-7">&nbsp;Virus!!</span>
                          </div> : null
                        } 
                        <p className="is-size-7"> (to { email.emailContent.to ? email.emailContent.to.text : '[undefined]'} from {email.emailContent.from.text} | { friendlyDate(email.emailContent.date)})</p>
                      </a>
                      : null
                    }
                    
                  </li>
                ))
                : null
              }
            </ul>
          </aside>
    )
}

export default EmailList;
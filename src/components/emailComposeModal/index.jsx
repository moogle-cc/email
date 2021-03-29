import React, {useState} from 'react';

const EmailComposeModal = ({textEmailContent, setEmailComposeModalIsVisible, showEmailComposeScreen, deviceIsMobile, htmlEmailContent, iframeComposedEmail,ADDRESS_DELIM, sendEmailDetails,  setSendEmailDetails, ses, emailComposeModalIsVisible}) => {
    const bccEmail = undefined;
    const [emailSendStatus, setEmailSendStatus] = useState(undefined);
    const [emailSendStatusMessage, setEmailSendStatusMessage]= useState(undefined);

    const sendEmail= async (event) => {
        if(sendEmailDetails.toEmail && sendEmailDetails.sender){
          var params = {
            Destination: { /* required */
              ToAddresses: sendEmailDetails.toEmail && sendEmailDetails.toEmail.split(ADDRESS_DELIM).length > 0 ? sendEmailDetails.toEmail.split(ADDRESS_DELIM) : [
                sendEmailDetails.toEmail,
                /* more items */
              ],
              CcAddresses: sendEmailDetails.ccEmail && sendEmailDetails.ccEmail.split(ADDRESS_DELIM).length > 0 ? sendEmailDetails.ccEmail.split(ADDRESS_DELIM) : [
                sendEmailDetails.ccEmail,
                /* more items */
              ],
              BccAddresses: bccEmail && bccEmail.split(ADDRESS_DELIM).length > 0 ? bccEmail.split(ADDRESS_DELIM) : [
                bccEmail,
                /* more items */
              ],
            },
            Message: { /* required */
              Body: { /* required */
                Html: {
                  Data: htmlEmailContent ?? "<br>", /* required */
                  Charset: 'UTF-8'
                },
                Text: {
                  Data: textEmailContent ?? "\n", /* required */
                  Charset: 'UTF-8'
                }
              },
              Subject: { /* required */
                Data: `${sendEmailDetails.emailSubject ?? "(no subject)"}`, /* required */
                Charset: 'UTF-8'
              }
            },
            Source: sendEmailDetails.sender, /* required */
          };
          setEmailSendStatus('success')
          setEmailSendStatusMessage('Sending...');
          
          await ses.sendEmail(params).promise()
          .then(r => {
            setEmailSendStatus('success'); 
            setEmailSendStatusMessage('Mail sent!');
          })
          .catch(e => {
            console.log(e);
            let tempEmailSendStatus = 'failed';
            let tempEmailSendStatusMessage = 'Mail could not be sent';
            if(e.message.indexOf('not authorized') > -1) tempEmailSendStatusMessage += ". Check your AWS permissions.";
            else tempEmailSendStatusMessage += '<br>' + e.message;
            setEmailSendStatus(tempEmailSendStatus);
            setEmailSendStatusMessage(tempEmailSendStatusMessage);
          })
          .finally(() => {
            setEmailComposeModalIsVisible(true);
          })
        } else {
          let tempEmailSendStatus = 'failed';
          let tempEmailSendStatusMessage = `${!sendEmailDetails.toEmail? (!sendEmailDetails.fromEmail ? "TO: and FROM:":"TO:") : (!sendEmailDetails.fromEmail ? "FROM:":"")} Missing`;
          setEmailSendStatus(tempEmailSendStatus);
          setEmailSendStatusMessage(tempEmailSendStatusMessage);
        }
      }

    const handleChange = (e) => {
        const {name, value} = e.target;
        setSendEmailDetails({...sendEmailDetails, [name]: value})
    }
    return (
        <div id="emailComposeModal" className={emailComposeModalIsVisible ? 'is-active modal':'modal'}>
            <div className="modal-background" style={{"opacity":"75%"}} onClick={(e)=> {e.preventDefault(); setEmailComposeModalIsVisible (false)}}></div>
            <div className="modal-card" style={deviceIsMobile ? {'width': '90vw'} :null}>
            <header className="modal-card-head">
                <p className="modal-card-title is-medium">New Email: Frontpage</p>
                <button disabled={!sendEmailDetails.toEmail || !sendEmailDetails.sender} className="button is-normal is-primary" onClick={(e) => {e.preventDefault(); sendEmail()}}>Send&nbsp;&nbsp;<i className="far fa-paper-plane"></i></button>
                <p className={emailSendStatus === 'success'? 'has-text-primary' : 'has-text-danger'}><sub> {emailSendStatusMessage}</sub></p>
            </header>
            <section className="modal-card-body">
                <div className="content is-normal">
                <div className="container">
                    <div className="field">
                    <div className="control has-icons-left">
                        <input className="input" type="email" placeholder="TO: email1; email2;" name="toEmail" onChange={handleChange} />
                        <sub>(Separate multiple TO: emails with semi-colons;)</sub>
                        <span className="icon is-small is-left">
                        <i className="fas fa-envelope"></i>
                        </span>
                    </div>
                    </div>
                    <div className="field">
                    <div className="control has-icons-left">
                        <input className="input" type="email" placeholder="CC: : email3; email4;" name="ccEmail" onChange={handleChange} />
                        <sub>(Separate multiple CC: emails with semi-colons;)</sub>
                        <span className="icon is-small is-left">
                        <i className="fas fa-envelope"></i>
                        </span>
                    </div>
                    </div>
                    <div className="field">
                    <div className="control has-icons-left">
                        <input className="input" type="email" placeholder="FROM: email" name="sender" onChange={handleChange} />
                        <sub>(Enter a valid FROM email)</sub>
                        <span className="icon is-small is-left">
                        <i className="fas fa-envelope"></i>
                        </span>
                    </div>
                    </div>
                    <div className="field">
                    <div className="control">
                        <input className="input" type="text" placeholder="Subject..." name="emailSubject" onChange={handleChange} />
                        <sub>(Your email subject)</sub>
                    </div>
                    </div>
                </div>
                <div className="field">
                    <div className="control">
                    <embed height="100vh" width="100vw" src={iframeComposedEmail} onClick={(e) => {e.preventDefault(); showEmailComposeScreen()}} style={{overflow:'hidden',overflowX:'hidden',overflowY:'hidden',height:'100vh',width:'100%'}} >
                    </embed>
                    </div>
                </div>
                </div>
            </section>
            <footer className="modal-card-foot is-block-mobile">
                <button className="button is-normal is-info is-outlined" onClick={(e) => {e.preventDefault(); setEmailComposeModalIsVisible( false)}}>Cancel</button>
                <button className="button is-normal is-primary is-light" onClick={(e) => {e.preventDefault(); showEmailComposeScreen()}}><i className="far fa-edit"></i>&nbsp;&nbsp;Write</button>
                <p className="has-text-primary"><sub> (You can change FRONTPAGE values later)</sub></p>
            </footer>
            </div>
        </div>
    )
}

export default EmailComposeModal;
import React, {useState, useEffect, useRef} from 'react';
import JoditEditor from "jodit-react";
import { EMAIL_ADDRESS_DELIM } from '../../constants';

const EmailComposeModal = ({setEmailComposeModalIsVisible,  deviceIsMobile, emailList, ADDRESS_DELIM, ses, HOST, emailComposeModalIsVisible}) => {
    const [sendEmailDetails, setSendEmailDetails] = useState({
      toEmail: undefined,
      ccEmail: undefined,
      sender: localStorage.userDetails ? JSON.parse(atob(JSON.parse(localStorage.userDetails).id_token.split('.')[1])).email : undefined,
      emailSubject: undefined,
    });
    const [htmlEmailContent, setHtmlEmailContent]= useState(undefined);
    const [emailSendStatus, setEmailSendStatus] = useState(undefined);
    const [emailSendStatusMessage, setEmailSendStatusMessage]= useState(undefined);

    useEffect(() => {
      if(emailList.currentEmail){
        clearEmailDestinations();
        setEmailDestinations();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emailList.currentEmail])

    const setEmailDestinations= async () =>{
      if(emailList.currentEmail && emailList.currentEmail.emailContent){
        let tempEmailSubject = emailList.currentEmail.emailContent.subject || "(no subject)";
        let tempToEmail = makeTo();
        let tempCcEmail = makeCc();
        let tempFromEmail = makeFrom()[0];
        if(tempToEmail.indexOf(tempFromEmail) > -1) tempToEmail.splice(tempToEmail.indexOf(tempFromEmail), 1);
        if(tempCcEmail.indexOf(tempFromEmail) > -1) tempCcEmail.splice(tempCcEmail.indexOf(tempFromEmail), 1);
        let duplicates = tempToEmail.filter((email) => tempCcEmail.indexOf(email) > -1);
        duplicates.map(d => tempCcEmail.splice(tempCcEmail.indexOf(d), 1));
        tempToEmail = tempToEmail.length > 0 ? tempToEmail.join(ADDRESS_DELIM) : undefined;
        tempCcEmail = tempCcEmail.length > 0 ? tempCcEmail.join(ADDRESS_DELIM) : undefined;
        let tempSender = getSender();
        await setSendEmailDetails({sender: tempSender, ccEmail: tempCcEmail, fromEmail: tempFromEmail, emailSubject: tempEmailSubject, toEmail: tempToEmail})
      }
    };
    const clearEmailDestinations= ()=>{
      setSendEmailDetails({sender: undefined, ccEmail: undefined, fromEmail: undefined, emailSubject: undefined, toEmail: undefined})
    };

    const makeTo = () =>{
      let toList = makeAddressList(`to`);
      let from = getSender(`from`);
      if(toList && from){
        if(toList.indexOf(from) === -1){
          toList.push(from);
        }
      }
      return toList;
    };

    const makeCc = () =>{
      let ccList = makeAddressList(`cc`);
      let from = getSender(`from`);
      if(ccList && from){
        if(ccList.indexOf(from) === -1){
          ccList.push(from);
        }
      }
      return ccList;
    };

    const makeFrom = () => {
      return [...makeAddressList(`to`), ...makeAddressList(`cc`)]
      .filter(email => email.indexOf(`${EMAIL_ADDRESS_DELIM}${HOST}`) > -1 || email.indexOf(`@ramachandr.in`) > -1);
    };
    const getSender=()=>{
      let from = makeAddressList(`from`);
      return from && from.length === 1 ? from[0] : undefined;
    };

    const makeAddressList = (type) => {
      let ec = emailList.currentEmail.emailContent;
      let key = type.toLowerCase();
      if([`to`, `cc`, `from`].includes(key) && 
      ec[key] &&
      ec[key].value){
        return ec[key].value.reduce((accum, v) => {
          accum.push(v.address);
          return accum;
        }, []);
      }
      return [];
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setSendEmailDetails({...sendEmailDetails, [name]: value})
    }

    const editor = useRef(null)
    
    const config = {
      readonly: false, // all options from https://xdsoft.net/jodit/doc/
      height: '50vh',
      width: '100%',
      allowResizeX: false,
      allowResizeY: false,
      showCharsCounter: false,
      showWordsCounter: false,
    }
    const sendEmail = (e) => {
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
              BccAddresses: sendEmailDetails.bccEmail && sendEmailDetails.bccEmail.split(ADDRESS_DELIM).length > 0 ? sendEmailDetails.bccEmail.split(ADDRESS_DELIM) : [
                sendEmailDetails.bccEmail,
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
                  Data: document.getElementsByClassName("editor")[0].innerText ?? "\n", /* required */
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
          console.log(params)
          setEmailSendStatus('success')
          setEmailSendStatusMessage('Sending...');
          // await ses.sendEmail(params).promise()
          // .then(r => {
          //   setEmailSendStatus('success'); 
          //   setEmailSendStatusMessage('Mail sent!');
          // })
          // .catch(e => {
          //   console.log(e);
          //   let tempEmailSendStatus = 'failed';
          //   let tempEmailSendStatusMessage = 'Mail could not be sent';
          //   if(e.message.indexOf('not authorized') > -1) tempEmailSendStatusMessage += ". Check your AWS permissions.";
          //   else tempEmailSendStatusMessage += '<br>' + e.message;
          //   setEmailSendStatus(tempEmailSendStatus);
          //   setEmailSendStatusMessage(tempEmailSendStatusMessage);
          // })
          // .finally(() => {
          //   setEmailComposeModalIsVisible(true);
          // })
        } else {
          let tempEmailSendStatus = 'failed';
          let tempEmailSendStatusMessage = `${!sendEmailDetails.toEmail? (!sendEmailDetails.fromEmail ? "TO: and FROM:":"TO:") : (!sendEmailDetails.fromEmail ? "FROM:":"")} Missing`;
          setEmailSendStatus(tempEmailSendStatus);
          setEmailSendStatusMessage(tempEmailSendStatusMessage);
        }
    }
    return (
        <div id="emailComposeModal" className={emailComposeModalIsVisible ? 'is-active modal':'modal'}>
            <div className="modal-background" style={{"opacity":"75%"}} ></div>
            <div className="modal-card" style={deviceIsMobile ? {'width': '90vw'} :{width: '90%'}}>
            <header className="modal-card-head">
                <p className="modal-card-title is-medium">New Email: Frontpage</p>
                <p className={emailSendStatus === 'success'? 'has-text-primary' : 'has-text-danger'}><sub> {emailSendStatusMessage}</sub></p>
            </header>
            <section className="modal-card-body">
                <div className="content is-normal">
                  <div className="container flex justify-between sendEmailMetadataContainer">
                    <div className="field">
                      <div className="control has-icons-left">
                          <input className="input" type="email" placeholder="TO: email1; email2;" value={sendEmailDetails.toEmail} name="toEmail" onChange={handleChange} />
                          <sub>(Separate multiple TO: emails with semi-colons;)</sub>
                          <span className="icon is-small is-left">
                            <i className="fa fa-envelope"></i>
                          </span>
                      </div>
                    </div>
                    <div className="field">
                      <div className="control has-icons-left">
                          <input className="input" type="email" placeholder="CC: : email3; email4;" value={sendEmailDetails.ccEmail} name="ccEmail" onChange={handleChange} />
                          <sub>(Separate multiple CC: emails with semi-colons;)</sub>
                          <span className="icon is-small is-left">
                            <i className="fa fa-envelope"></i>
                          </span>
                      </div>
                    </div>
                    <div className="field">
                      <div className="control has-icons-left">
                          <input className="input" type="email" readOnly placeholder="FROM: email" value={sendEmailDetails.sender} name="sender" />
                          <sub>(Enter a valid FROM email)</sub>
                          <span className="icon is-small is-left">
                            <i className="fa fa-envelope"></i>
                          </span>
                      </div>
                    </div>
                  </div>
                  <div className="container mb-2">
                    <div className="field">
                      <div className="control">
                          <input className="input" type="text" placeholder="Subject..." value={sendEmailDetails.emailSubject} name="emailSubject" onChange={handleChange} />
                          <sub>(Your email subject)</sub>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <div className="control editor">
                      <JoditEditor
                        ref={editor}
                        value={htmlEmailContent}
                        config={config}
                        tabIndex={1} // tabIndex of textarea
                        onBlur={newContent => setHtmlEmailContent(newContent)} // preferred to use only this option to update the content for performance reasons
                        onChange={newContent => {}}
                      />
                    </div>
                  </div>
                </div> 
            </section>
            <footer className="modal-card-foot is-block-mobile">
                <button className="button is-normal is-info is-outlined" onClick={(e) => {e.preventDefault(); setEmailComposeModalIsVisible(false)}}>Cancel</button>
                <p className="has-text-primary"><sub> (You can change FRONTPAGE values later)</sub></p>
                <button onClick={sendEmail} style={{marginLeft: "auto"}} disabled={!sendEmailDetails.toEmail || !sendEmailDetails.sender} className="button is-normal is-primary" >Send&nbsp;&nbsp;<i class="fa fa-paper-plane"></i></button>
                
            </footer>
            </div>
        </div>
    )
}

export default EmailComposeModal;
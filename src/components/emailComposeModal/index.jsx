import React, {useState, useEffect} from 'react';
import Stackedit from 'stackedit-js';

const EMAIL_ADDRESS_DELIM = "@";

const EmailComposeModal = ({setEmailComposeModalIsVisible,  deviceIsMobile, emailList, ADDRESS_DELIM, ses, HOST, emailComposeModalIsVisible}) => {
    const [sendEmailDetails, setSendEmailDetails] = useState({
      toEmail: undefined,
      ccEmail: undefined,
      fromEmail: undefined,
      sender: undefined,
      emailSubject: undefined,
      bccEmail: undefined
    });
    const [textEmailContent, setTextEmailContent]=  useState(undefined);
    const [iframeComposedEmail, setIframeComposedEmail] = useState(undefined);
    const [htmlEmailContent, setHtmlEmailContent]= useState(undefined);
    const [emailSendStatus, setEmailSendStatus] = useState(undefined);
    const [emailSendStatusMessage, setEmailSendStatusMessage]= useState(undefined);

    useEffect(() => {
      if(emailComposeModalIsVisible)
        showEmailComposeScreen(emailComposeModalIsVisible);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[emailComposeModalIsVisible])

    useEffect(() => {
      if(emailList.currentEmail){
        clearEmailDestinations();
        setEmailDestinations();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emailList.currentEmail])

    useEffect(() => {
      if(htmlEmailContent){
        const htmlBlob = new Blob([htmlEmailContent], { type: 'text/html' });
        setIframeComposedEmail(URL.createObjectURL(htmlBlob));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[htmlEmailContent]);

    const showEmailComposeScreen= (clear) =>{
      const stackedit = new Stackedit({
      url: 'https://stackedit.io/app'
      });
      let startingText = emailList.currentEmail ? 
              (emailList.currentEmail.emailContent ? 
              (emailList.currentEmail.emailContent.text?`\n---------\n${emailList.currentEmail.emailContent.text}`:`<hr>${emailList.currentEmail.emailContent.html}`) 
              : "Compose your email using markdown.") 
              : "Compose your email using markdown.";
      setEmailDestinations();
        if(clear){
            startingText = "";
            clearEmailDestinations();
        }
        // Open the iframe
        stackedit.openFile({
        name: 'Filename'+Date.now(), // with an optional filename
        content: {
            text: startingText
        }
        });

        // Listen to StackEdit events and apply the changes to the textarea.
        stackedit.on('fileChange', (file) => {
        setHtmlEmailContent(file.content.html);
        setTextEmailContent(file.content.text)
        });

        stackedit.on('close', (file) => {
          setEmailComposeModalIsVisible(true);
        });
    };

    const setEmailDestinations=() =>{
      if(emailList.currentEmail){
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
        setSendEmailDetails({sender: tempSender, ccEmail: tempCcEmail, fromEmail: tempFromEmail, emailSubject: tempEmailSubject, toEmail: tempToEmail})
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
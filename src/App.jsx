import React, {useEffect, useState} from 'react';
import Stackedit from 'stackedit-js';
import axios from 'axios';
import moment from 'moment';
import AWS from 'aws-sdk';

const ADDRESS_DELIM = ",";
const EMAIL_ADDRESS_DELIM = "@";
const ORIGIN = (new URL(document.location)).origin;
const HOST = (new URL(document.location)).host;
const PATHNAME = (new URL(document.location)).pathname.replace(/\/+$/, '');
const API_GW_URL = 'https://api.zeer0.com/v001';
const EMAIL_CONTENT_URL = `${API_GW_URL}/moogle/email`;
const EMAILS_LIST_URL = `${API_GW_URL}/moogle/email/list`;
const DEFAULT_FQDN = HOST.startsWith('localhost') ? 'moogle.cc' : HOST;
const LOGIN_REDIRECT_URL = `${ORIGIN}${PATHNAME}`;
const LOGOUT_REDIRECT_URL = `${ORIGIN}${PATHNAME}`;
const COGNITO_URL = 'https://moogle.auth.ap-south-1.amazoncognito.com/';
const CLIENT_ID = '365ebnulu59p2fkp1m6dl0v6gd';
const RESPONSE_TYPE = 'token';
const SCOPE = 'email+openid';
const COGNITO_LOGIN_URL = `${COGNITO_URL}/login?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&redirect_uri=${LOGIN_REDIRECT_URL}`;
const COGNITO_LOGOUT_URL = `${COGNITO_URL}/logout?client_id=${CLIENT_ID}&logout_uri=${LOGOUT_REDIRECT_URL}`;

const App = (props) => {
  const fqdn= DEFAULT_FQDN;
  // const [baseUrl, setBasUrl]= useState(`${ORIGIN}${PATHNAME}`);
  const [statusMsg, setStatusMsg]= useState('Email contents will appear here');
  const [emailContent, setEmailContent]= useState(undefined);
  const [emailSet, setEmailSet]= useState(undefined);
  const [authDetails, setAuth]= useState(undefined);
  const loginUrl = COGNITO_LOGIN_URL;
  const logoutUrl=COGNITO_LOGOUT_URL;
  const [currentEmail, setCurrentEmail]= useState(undefined);
  const [currentEmailId, setcurrentEmailId]= useState(undefined);
  const [htmlEmailContent, setHtmlEmailContent]= useState(undefined);
  const [textEmailContent, setTextEmailContent]=  useState(undefined);
  const [emailComposeModalIsVisible, setEmailComposeModalIsVisible] = useState(undefined);
  const [toEmail, setToEmail] = useState(undefined);
  const [ccEmail, setCcEmail] = useState(undefined);
  const [bccEmail, setBccEmail] = useState(undefined);
  const [productLicenseKey, setProductLicenseKey] = useState(undefined);
  const [fromEmail, setFromEmail] = useState(undefined);
  const [sender, setSender] = useState(undefined);
  const [emailSubject, setEmailSubject] = useState(undefined);
  const [iframeComposedEmail, setIframeComposedEmail] = useState(undefined);
  const [emailSendStatus, setEmailSendStatus] = useState(undefined);
  const deviceIsMobile=undefined;
  const [emailSendStatusMessage, setEmailSendStatusMessage]= useState(undefined);
  const [ses, setSes]= useState(undefined);
  const [secretAccessKey, setSecretAccessKey]= useState(undefined);
  const [accessKeyId, setAccessKeyId]= useState(undefined);
  const [region, setRegion]= useState(undefined);
  const [awsModalIsVisible, setAwsModalIsVisible]= useState(undefined);
  const [sesRegions,setSesRegions]= useState(undefined);
  const [dataMustBeSavedLocally,setDataMustBeSavedLocally]= useState(undefined);
  const [shareableLinkMsg, setShareableLinkMsg]= useState(undefined);

  useEffect(() => {
    setAuthDetails();
    if(!authTokenIsValid()) {
      redirectToLogin();
    }
    let tempSesRegions = {"regions":[{"id":"us-east-1","name":"US East","location":"N. Virginia","optIn":false,"visible":true},{"id":"us-east-2","name":"US East","location":"Ohio","optIn":false,"visible":true},{"id":"us-west-1","name":"US West","location":"N. California","optIn":false},{"id":"us-west-2","name":"US West","location":"Oregon","optIn":false,"visible":true},{"id":"af-south-1","name":"Africa","location":"Cape Town","optIn":true},{"id":"ap-east-1","name":"Asia Pacific","location":"Hong Kong","optIn":true},{"id":"ap-south-1","name":"Asia Pacific","location":"Mumbai","optIn":false,"visible":true},{"id":"ap-northeast-2","name":"Asia Pacific","location":"Seoul","optIn":false,"visible":true},{"id":"ap-southeast-1","name":"Asia Pacific","location":"Singapore","optIn":false,"visible":true},{"id":"ap-southeast-2","name":"Asia Pacific","location":"Sydney","optIn":false},{"id":"ap-northeast-1","name":"Asia Pacific","location":"Tokyo","optIn":false,"visible":true},{"id":"ca-central-1","name":"Canada","location":"Central","optIn":false},{"id":"eu-central-1","name":"Europe","location":"Frankfurt","optIn":false,"visible":true},{"id":"eu-west-1","name":"Europe","location":"Ireland","optIn":false,"visible":true},{"id":"eu-west-2","name":"Europe","location":"London","optIn":false,"visible":true},{"id":"eu-south-1","name":"Europe","location":"Milan","optIn":true},{"id":"eu-west-3","name":"Europe","location":"Paris","optIn":false},{"id":"eu-north-1","name":"Europe","location":"Stockholm","optIn":false},{"id":"me-south-1","name":"Middle East","location":"Bahrain","optIn":true},{"id":"sa-east-1","name":"South America","location":"São Paulo","optIn":false,"visible":true}]};
    readLocalData();
    setSesRegions(tempSesRegions);
  }, []);

  useEffect(() => {
      showEmail(emailSet[0].Key);
  }, [emailSet]);

  useEffect(() => {
    clearEmailDestinations();
    setEmailDestinations();
  }, [currentEmail]);

  useEffect(() => {
    const htmlBlob = new Blob([htmlEmailContent], { type: 'text/html' });
    setIframeComposedEmail(URL.createObjectURL(htmlBlob));
  },[htmlEmailContent]);

  useEffect(() => {
    if(authDetails)
      getEmails();
    // else  
    //   console.log(authDetails)
    //   redirectToLogin();
  }, [authDetails]);

  useEffect(() => {
    getSESObject(true);
    updateLocalData();
  }, [accessKeyId, secretAccessKey, region]);

  const shareableUrl = () => {
    return `${ORIGIN}${PATHNAME}/get.html?emailId=${currentEmailId}`;
  };
  const iframeSrc = ()=>{
    if(emailContent){
      const blob = new Blob([emailContent], { type: 'text/html' });
      return URL.createObjectURL(blob);
    }
    return undefined;
  };
  const attachments = ()=>{
    if(currentEmail){
      console.log(`looking for attachments @ emailContent.attachments ${Object.keys(currentEmail.emailContent)}`);
      return currentEmail.emailContent.attachments;
    } 
    return undefined;
  };
  const copyToClipboard = () => {
    var copyText = document.getElementById("shareable-link");
    copyText.type = 'text';
    copyText.select();
    document.execCommand("copy");
    copyText.type = 'hidden';
    setShareableLinkMsg("Copied email url. Now, bookmark or share the url with others.");
  };
  const makeAddressList = (type) => {
    let ec = currentEmail.emailContent;
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
  const friendlyDate=(d)=>{
    return moment(d).fromNow();
  };
  const awsCredentialsAreAvailable=()=>{
    return dataMustBeSavedLocally ? localStorage.accessKeyId && localStorage.secretAccessKey && localStorage.region && localStorage.productLicenseKey: accessKeyId && secretAccessKey && region && productLicenseKey;
  }
  const getSESObject=(refresh) =>{
    if(accessKeyId && secretAccessKey && region !== ""){
      if(!ses || refresh){
        let tempSes = new AWS.SES({
          apiVersion: '2010-12-01',
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
          region: region
        });
        setSes(tempSes);
        getEmails();
      }
    } else {
      setSes(undefined);
    }
  };
  const updateLocalData=()=>{
    localStorage.accessKeyId = dataMustBeSavedLocally ? (accessKeyId ? accessKeyId : '') : '';
    localStorage.secretAccessKey = dataMustBeSavedLocally ? (secretAccessKey ? secretAccessKey : '') : '';
    localStorage.region = dataMustBeSavedLocally ? (region ? region : '') : '';
    localStorage.productLicenseKey = dataMustBeSavedLocally ? (productLicenseKey ? productLicenseKey : '') : '';
  };
  const readLocalData=()=>{
    let tempAccessKeyId = localStorage.accessKeyId ? localStorage.accessKeyId : undefined;
    let tempSecretAccessKey = localStorage.secretAccessKey ? localStorage.secretAccessKey : undefined;
    let tempRegion = localStorage.region ? localStorage.region : "";
    let tempProductLicenseKey = localStorage.productLicenseKey ? localStorage.productLicenseKey : "";
    setAccessKeyId(tempAccessKeyId);
    setSecretAccessKey(tempSecretAccessKey);
    setRegion(tempRegion);
    setProductLicenseKey(tempProductLicenseKey);
    if(accessKeyId || secretAccessKey || region) {
      setDataMustBeSavedLocally(true);
    }
  };
  const setAuthDetails=async ()=>{
    // await setAuth(null);
    let hash = (new URL(document.location)).hash;
    let loc = hash ? document.location.href.replace(/#/, '?') : document.location;
    let params = (new URL(loc)).searchParams;
    if(params.get('id_token') && params.get('access_token') && params.get('expires_in') && tokenIsValid(params.get('id_token'))){
      setAuth({
        id_token: params.get('id_token'),
        access_token: params.get('access_token'),
      });   
      console.log(authDetails)
    }else{console.log("not done")}
  };
  const tokenIsValid=(idToken)=>{
    try{
      let x = JSON.parse(atob(idToken.split('.')[1]));
      return Date.now() < x.exp * 1000;//converting exp to msec
    } catch(e){
      setStatusMsg(`Error: ${e}`)
    }
    return false;
  };
  const authTokenIsValid=()=>{
    return authDetails && tokenIsValid(authDetails.id_token);
  };
  const redirectToLogin=() =>{
    window.location.href = loginUrl;
  };
  const logout=()=> {
    window.location.href = logoutUrl;
  };
  const loginLogoutAction=()=>{
    //if auth details are not available, user should be able to login
    if(!authTokenIsValid()) redirectToLogin();
    //if auth details are available, user should be able to log out
    if(authTokenIsValid()) logout();
  };
  const showEmail=(emlId)=>{
    let tempcurrentEmail = emailSet.find((e) => e.Key === emlId);
    let tempcurrentEmailId = undefined;
    if(tempcurrentEmail) tempcurrentEmailId = emlId.substring(fqdn.length + 1);
    let tempemailContent = `We could not download the contents of this email ${emlId}.<br> This usually means the email isn't properly formatted. Your email admin should be able to help.`;
    if(tempcurrentEmail && tempcurrentEmail.emailContent){
      tempemailContent = tempcurrentEmail.emailContent.text;
      if(tempcurrentEmail.emailContent.html) tempemailContent = tempcurrentEmail.emailContent.html;
      else if(tempcurrentEmail.emailContent.textAsHtml) tempemailContent = tempcurrentEmail.emailContent.textAsHtml;
    }
    setCurrentEmail(tempcurrentEmail);
    setEmailContent(tempemailContent);
    if(tempcurrentEmailId) setcurrentEmailId(tempcurrentEmailId);
  };
  const getEmail = async (emlId) => {
    if(authTokenIsValid() && fqdn && emlId){
      let x = emlId.substring(fqdn.length + 1);
      return await axios({
        url: `${EMAIL_CONTENT_URL}?domain=${fqdn}&id=${x}`,
        headers: {'Authorization': authDetails.id_token}
      })
      .then( (response) => {
        return response.data;
      })
      .catch(e => {
        return undefined;
      });
    }
  };
  const getEmails= async ()=> {
    setEmailContent(undefined);
    setStatusMsg('Retrieving...');
    if(authTokenIsValid() && fqdn){
      setEmailSet(undefined);
      await axios({
        url: `${EMAILS_LIST_URL}?domain=${fqdn}&folderpath=/email`,
        headers: {'Authorization': authDetails.id_token},
      })
      .then(async (response) => {
        if(response.data.Contents.length > 0){
          return await Promise.all(response.data.Contents.map(async (email) => {
            email.emailContent = await getEmail(email.Key);
            return email;
          }));
        }
        setStatusMsg("Hooray! You haven't received any emails today. Lucky you!")
      })
      .then(values => {
        let tempEmailSet = values.sort((a, b) => a.Key.localeCompare(b.Key));
        setEmailSet(tempEmailSet);
      });
    } else {
      setStatusMsg('Please login again...');
      redirectToLogin();
    }
  };
  const replyAll=async () =>{
    setStatusMsg('Composing Reply...');
    if(authTokenIsValid() && fqdn){
      if(currentEmail && currentEmail.emailContent){
       showEmailComposeScreen();
      }
    }
  };
  const clearEmailDestinations= ()=>{
    setSender(undefined);
    setToEmail(undefined); 
    setCcEmail(undefined); 
    setFromEmail(undefined); 
    setEmailSubject(undefined);
  };
  const setEmailDestinations=() =>{
    if(currentEmail){
      let tempEmailSubject = currentEmail.emailContent.subject || "(no subject)";
      let tepmpToEmail = makeTo();
      let tempCcEmail = makeCc();
      let tempFromEmail = makeFrom()[0];
      if(tepmpToEmail.indexOf(tempFromEmail) > -1) tepmpToEmail.splice(tepmpToEmail.indexOf(tempFromEmail), 1);
      if(tempCcEmail.indexOf(tempFromEmail) > -1) tempCcEmail.splice(tempCcEmail.indexOf(tempFromEmail), 1);
      let duplicates = tepmpToEmail.filter((email) => tempCcEmail.indexOf(email) > -1);
      duplicates.map(d => tempCcEmail.splice(tempCcEmail.indexOf(d), 1));
      tepmpToEmail = tepmpToEmail.length > 0 ? tepmpToEmail.join(ADDRESS_DELIM) : undefined;
      tempCcEmail = tempCcEmail.length > 0 ? tempCcEmail.join(ADDRESS_DELIM) : undefined;
      let tempSender = getSender();
      setSender(tempSender);
      setCcEmail(tempCcEmail);
      setFromEmail(tempFromEmail);
      setEmailSubject(tempEmailSubject);
      setToEmail(tepmpToEmail);
    }
  };
  const showEmailComposeScreen= (clear) =>{
    const stackedit = new Stackedit({
      url: 'https://stackedit.io/app'
    });
    let startingText = currentEmail ? 
            (currentEmail.emailContent ? 
            (currentEmail.emailContent.text?`\n---------\n${currentEmail.emailContent.text}`:`<hr>${currentEmail.emailContent.html}`) 
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
  const sendEmail= async (event) => {
    if(toEmail && sender){
      var params = {
        Destination: { /* required */
          ToAddresses: toEmail && toEmail.split(ADDRESS_DELIM).length > 0 ? toEmail.split(ADDRESS_DELIM) : [
            toEmail,
            /* more items */
          ],
          CcAddresses: ccEmail && ccEmail.split(ADDRESS_DELIM).length > 0 ? ccEmail.split(ADDRESS_DELIM) : [
            ccEmail,
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
            Data: `${emailSubject ?? "(no subject)"}`, /* required */
            Charset: 'UTF-8'
          }
        },
        Source: sender, /* required */
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
      let tempEmailSendStatusMessage = `${!toEmail? (!fromEmail ? "TO: and FROM:":"TO:") : (!fromEmail ? "FROM:":"")} Missing`;
      setEmailSendStatus(tempEmailSendStatus);
      setEmailSendStatusMessage(tempEmailSendStatusMessage);
    }
  }
 
  return (
    <div className="App">
      <form id="email-contents">
      <nav className="container navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item is-small title" href="/"><img width="112" height="28" src="../images/zeer0.png" alt="Zeer0" /></a>
          <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" onClick={() => setAwsModalIsVisible(true)}>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start is-hidden">
          </div>
          <div className="navbar-end">
            {
              authTokenIsValid() ?
              <div className="navbar-item is-hoverable">
                
                <a className="navbar-item"  onClick={() => getEmails()}>
                  Refresh Email List
                </a>
                <a className="navbar-item" onClick={()=>showEmailComposeScreen(true)}>
                  <p><i className="far fa-edit"></i> Compose </p>
                </a>
              </div> 
              
              :null
            }
            </div>
          </div>
          <div className="navbar-item">
            <button className="button is-normal is-primary" onClick={() => setAwsModalIsVisible(true)}>{!awsCredentialsAreAvailable() ? "Add AWS Credentials" : "Change AWS Credentials"}</button>
          </div>
        {/* </div> */}
      </nav>
      <div className="columns">
        <div className="column is-one-quarter">
          {/* <!-- email list--> */}
          <aside className="menu">
            <p className="menu-label">
              Emails
            </p>
            <ul className="menu-list">
              {
                emailSet ?
                emailSet.map((email, idx)=> (
                  <li style={{'cursor': 'pointer'}} key={`email-idx-${idx}`} id={idx} onClicl={() => showEmail(email.Key)} className="is-size-6">
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
        </div>
        <div className="column is-half">
          {/* <!-- email content--> */}
          <div className="" id="email-content">
            <h5 className="has-text-weight-light">Email Preview</h5>
            {
              iframeSrc() ? <span className="has-text-weight-light">{ statusMsg }</span> 
              :
              <div >
                {
                  attachments() && attachments().length > 0 ? <h6 className="has-text-weight-light" v-if="attachments.length > 0">Attachments</h6>: null
                }
                <ul className="menu">
                  {
                    attachments() ?
                    attachments().map((attachment, idx) => (
                      <li  style={{'cursor': 'pointer'}} key={`attachment-idx-`+idx} id={`attachment-idx-`+idx} className='button'>
                        <a href="`${attachment.contentLocation}`" download>{attachment.filename}</a>
                      </li>
                    ))
                    : null
                  }
                </ul>
                <iframe frameBorder="0" style={{overflow:'hidden',"overflowX":'hidden',"overflowY":'hidden',height:"100vh",width:"100%"}} height="100vh" width="100vw" src={iframeSrc()}></iframe>
              </div>
            }   
          </div>
        </div>
        <div className="column is-one-quarter is-size-5">
          {/* <!-- email actions--> */}
          <a className="button" href="#" onClick={(e) => {e.preventDefault(); setEmailComposeModalIsVisible(true)}}>Reply All</a>
          <input type="hidden" id="shareable-link" value={shareableUrl()} />
          <a className="button" href="#" onClick={(e) => {e.preventDefault(); copyToClipboard()}}><span className="icon"><i className="fas fa-share-alt"></i></span><span>Share This Email</span></a>
          <p>
            <sub>{shareableLinkMsg ? <span className="is-size-7" >({shareableLinkMsg()})</span> : null}</sub>
          </p>
        </div>
      </div>
      <div className="modal" id="awsCredentialsModal" className={awsModalIsVisible ? 'is-active':''}>
        <div className="modal-background" style={{"opacity":"75%"}} onClick={(e) => {e.preventDefault();setAwsModalIsVisible( false)}}></div>
        <div className="modal-card" style={deviceIsMobile ? {'width': '90vw'} : null}>
          <header className="modal-card-head">
            <p className="modal-card-title is-medium">Your AWS Credentials</p>
            <button className="modal-close is-medium" aria-label="close" onClick={(e) => {e.preventDefault(); setAwsModalIsVisible( false)}}></button>
          </header>
          <section className="modal-card-body">
            <div className="content is-medium">
              <div className="container">
                <div className="field is-block">
                  <div className="control">
                    <input className="input" type="password" placeholder="AWS Access Key Id " name="accessKeyId" onChange={(e)=> {e.preventDefault(); setAccessKeyId( e.target.value)}} />
                    {accessKeyId ? <sub >***{accessKeyId.substring(accessKeyId.length - 5)}</sub> : null}
                  </div>
                </div>
                <div className="field is-block">
                  <div className="control">
                    <input className="input" type="password" placeholder="AWS Secret Access" name="secretAccessKey" onChange={(e) => {e.preventDefault(); setSecretAccessKey( e.target.value)}} />
                    {secretAccessKey ? <sub >***{secretAccessKey.substring(secretAccessKey.length - 5)}</sub> : null}
                  </div>
                </div>
                <div className="field is-block">
                  <div className="control">
                    {
                      sesRegions ? 
                      <div className="select is-primary" >
                        <select name="region" onChage={(e) => {setRegion(e.target.value)}}>
                          <option disabled value="">Select AWS region</option>
                          {
                            sesRegions.regions.map((sesRegion) => 
                              {
                                if(sesRegion.visible)
                                  return (<option selected={sesRegion.id === region ? true :false} value={sesRegion.id}>{sesRegion.name} - {sesRegion.location}</option>)
                                else return null;
                              }
                            )}
                        </select>
                      </div> 
                      : null
                    }
                  </div>
                </div>
                <div className="is-block">
                  <label className="checkbox">
                    <input type="checkbox" name="dataMustBeSavedLocally" onChange={(e) => {setDataMustBeSavedLocally(e.target.value)}} /> Remember key, secret, and region
                  </label>
                </div>
              </div>
            </div>
          </section>
          <footer className="modal-card-foot is-block-mobile">
            <button id="btnSetDemoDetails" className="button is-primary is-info is-block is-outlined" onClick={(e) => {e.preventDefault(); setAwsModalIsVisible( false)}}> <span className="icon"><i className="fas fa-layer-group"></i></span><span>Close</span></button>
          </footer>
        </div>
      </div>
      <div className="modal" id="emailComposeModal" className={emailComposeModalIsVisible ? 'is-active':''}>
        <div className="modal-background" style={{"opacity":"75%"}} onClick={(e)=> {e.preventDefault(); setEmailComposeModalIsVisible (false)}}></div>
        <div className="modal-card" style={deviceIsMobile ? {'width': '90vw'} :null}>
          <header className="modal-card-head">
            <p className="modal-card-title is-medium">New Email: Frontpage</p>
            <button disabled={!toEmail || !sender} className="button is-normal is-primary" onClick={(e) => {e.preventDefault(); sendEmail()}}>Send&nbsp;&nbsp;<i className="far fa-paper-plane"></i></button>
            <p className={emailSendStatus === 'success'? 'has-text-primary' : 'has-text-danger'}><sub> {emailSendStatusMessage}</sub></p>
          </header>
          <section className="modal-card-body">
            <div className="content is-normal">
              <div className="container">
                <div className="field">
                  <div className="control has-icons-left">
                    <input className="input" type="email" placeholder="TO: email1; email2;" name="toEmail" onChange={(e) => setToEmail(e.target.value)} />
                    <sub>(Separate multiple TO: emails with semi-colons;)</sub>
                    <span className="icon is-small is-left">
                      <i className="fas fa-envelope"></i>
                    </span>
                  </div>
                </div>
                <div className="field">
                  <div className="control has-icons-left">
                    <input className="input" type="email" placeholder="CC: : email3; email4;" name="ccEmail" onChange={(e) => setCcEmail(e.target.value)} />
                    <sub>(Separate multiple CC: emails with semi-colons;)</sub>
                    <span className="icon is-small is-left">
                      <i className="fas fa-envelope"></i>
                    </span>
                  </div>
                </div>
                <div className="field">
                  <div className="control has-icons-left">
                    <input className="input" type="email" placeholder="FROM: email" name="sender" onChange={(e) => setSender(e.target.value)} />
                    <sub>(Enter a valid FROM email)</sub>
                    <span className="icon is-small is-left">
                      <i className="fas fa-envelope"></i>
                    </span>
                  </div>
                </div>
                <div className="field">
                  <div className="control">
                    <input className="input" type="text" placeholder="Subject..." name="emailSubject" onChange={(e) => setEmailSubject(e.target.value)} />
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
    </form>
    </div>
  )
}

export default App;

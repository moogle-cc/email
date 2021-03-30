import React, {useEffect, useState} from 'react';
import Stackedit from 'stackedit-js';
import axios from 'axios';
import moment from 'moment';
import AWS from 'aws-sdk';
import Navbar from './components/navbar';
import EmailList from './components/emailList';
import EmailContent from './components/emailContent';
import AwsCredentialModal from './components/awsCredentialModal';
import EmailComposeModal from './components/emailComposeModal';
import './App.css';
import worker_script from './worker';

const ADDRESS_DELIM = ",";
const EMAIL_ADDRESS_DELIM = "@";
const ORIGIN = (new URL(document.location)).origin;
const HOST = (new URL(document.location)).host;
const PATHNAME = (new URL(document.location)).pathname.replace(/\/+$/, '');
const API_GW_URL = 'https://api.zeer0.com/v001';
const EMAIL_CONTENT_URL = `${API_GW_URL}/moogle/email`;
const EMAILS_LIST_URL = `${API_GW_URL}/moogle/email/list`;
const DEFAULT_FQDN = HOST;
const LOGIN_REDIRECT_URL = `${ORIGIN}${PATHNAME}`;
// const LOGOUT_REDIRECT_URL = `${ORIGIN}${PATHNAME}`;
const COGNITO_URL = 'https://moogle.auth.ap-south-1.amazoncognito.com/';
const CLIENT_ID = '365ebnulu59p2fkp1m6dl0v6gd';
const RESPONSE_TYPE = 'token';
const SCOPE = 'email+openid';
const COGNITO_LOGIN_URL = `${COGNITO_URL}/login?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&redirect_uri=${LOGIN_REDIRECT_URL}`;
// const COGNITO_LOGOUT_URL = `${COGNITO_URL}/logout?client_id=${CLIENT_ID}&logout_uri=${LOGOUT_REDIRECT_URL}`;

const App = (props) => {
  const fqdn= DEFAULT_FQDN;
  const loginUrl = COGNITO_LOGIN_URL;
  // const logoutUrl=COGNITO_LOGOUT_URL;
  // const baseUrl = `${ORIGIN}${PATHNAME}`;
  const deviceIsMobile=undefined;

  const [emailComposeModalIsVisible, setEmailComposeModalIsVisible] = useState(undefined);
  const [iframeComposedEmail, setIframeComposedEmail] = useState(undefined);
  const [authDetails, setAuthDetails]= useState(localStorage.userDetails ? JSON.parse(localStorage.userDetails) : undefined);
  const [htmlEmailContent, setHtmlEmailContent]= useState(undefined);
  const [ses, setSes]= useState(undefined);
  const [awsModalIsVisible, setAwsModalIsVisible]= useState(undefined);
  const [sesRegions,setSesRegions]= useState(undefined);
  const [dataMustBeSavedLocally,setDataMustBeSavedLocally]= useState(undefined);
  const [shareableLinkMsg, setShareableLinkMsg]= useState(undefined);
  const [textEmailContent, setTextEmailContent]=  useState(undefined);

  const [emailList, setEmailList] = useState({
    emailContent: undefined,
    emailSet: undefined,
    statusMsg: 'Email contents will appear here',
    currentEmail: undefined,
    currentEmailId: undefined,
  });

  const [sendEmailDetails, setSendEmailDetails] = useState({
    toEmail: undefined,
    ccEmail: undefined,
    fromEmail: undefined,
    sender: undefined,
    emailSubject: undefined
  });

  const [keys, setKeys] = useState({
    productLicenseKey: undefined,
    secretAccessKey: undefined,
    accessKeyId: undefined,
    region: undefined,
  });
  var myWorker = new Worker(worker_script);
  
  
  useEffect(() => {
    setInterval(() => {
      myWorker.postMessage({fqdn, authDetails, EMAILS_LIST_URL})
    }, 100000);
    myWorker.onmessage = (m) => {
      if(emailList.emailSet && emailList.emailSet[0].Key !== m.data){
        alert("new Email Please Refreash");
      }
    };
    if(localStorage.getItem("userDetails") && !authDetails){
      let details = JSON.parse(localStorage.userDetails);
      const tem = async(details) => {
        await setAuthDetails(details);
      }
      tem(details).then(() => {
        if(!authTokenIsValid()) redirectToLogin();
      });
    } else {
      setAuthCredentials();
    }

    let tempSesRegions = {"regions":[{"id":"us-east-1","name":"US East","location":"N. Virginia","optIn":false,"visible":true},{"id":"us-east-2","name":"US East","location":"Ohio","optIn":false,"visible":true},{"id":"us-west-1","name":"US West","location":"N. California","optIn":false},{"id":"us-west-2","name":"US West","location":"Oregon","optIn":false,"visible":true},{"id":"af-south-1","name":"Africa","location":"Cape Town","optIn":true},{"id":"ap-east-1","name":"Asia Pacific","location":"Hong Kong","optIn":true},{"id":"ap-south-1","name":"Asia Pacific","location":"Mumbai","optIn":false,"visible":true},{"id":"ap-northeast-2","name":"Asia Pacific","location":"Seoul","optIn":false,"visible":true},{"id":"ap-southeast-1","name":"Asia Pacific","location":"Singapore","optIn":false,"visible":true},{"id":"ap-southeast-2","name":"Asia Pacific","location":"Sydney","optIn":false},{"id":"ap-northeast-1","name":"Asia Pacific","location":"Tokyo","optIn":false,"visible":true},{"id":"ca-central-1","name":"Canada","location":"Central","optIn":false},{"id":"eu-central-1","name":"Europe","location":"Frankfurt","optIn":false,"visible":true},{"id":"eu-west-1","name":"Europe","location":"Ireland","optIn":false,"visible":true},{"id":"eu-west-2","name":"Europe","location":"London","optIn":false,"visible":true},{"id":"eu-south-1","name":"Europe","location":"Milan","optIn":true},{"id":"eu-west-3","name":"Europe","location":"Paris","optIn":false},{"id":"eu-north-1","name":"Europe","location":"Stockholm","optIn":false},{"id":"me-south-1","name":"Middle East","location":"Bahrain","optIn":true},{"id":"sa-east-1","name":"South America","location":"São Paulo","optIn":false,"visible":true}]};
    readLocalData();
    setSesRegions(tempSesRegions);
  }, []);
  
  useEffect(() => {
    if(emailList.currentEmail){
      clearEmailDestinations();
      setEmailDestinations();
    }
  }, [emailList])
  
  useEffect(() => {
    if(htmlEmailContent){
      const htmlBlob = new Blob([htmlEmailContent], { type: 'text/html' });
      setIframeComposedEmail(URL.createObjectURL(htmlBlob));
    }
  },[htmlEmailContent]);

  useEffect(() => {
    if(authDetails){
      getEmails();
    } 
  }, [ authDetails ]);

  useEffect(() => {
    getSESObject(true);
    updateLocalData();
  }, [keys]); 

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
  const getEmail = async (emlId) => {
    if(authTokenIsValid() && fqdn && emlId){
      let x = emlId.substring(fqdn.length + 1);
      return await axios({
        url: `${EMAIL_CONTENT_URL}?id=${x}`,
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

  const getEmails= async ()=> {
    await setEmailList({...emailList, emailContent: undefined, statusMsg: 'Retrieving...'});
    if(authTokenIsValid() && fqdn){
      // await setEmailList({...emailList, emailSet: undefined});
      await axios({
        url: `${EMAILS_LIST_URL}?folderpath=/email`,
        headers: {'Authorization': authDetails.id_token},
      })
      .then(async (response) => {
        if(response.data.Contents.length > 0){
          return await Promise.all(response.data.Contents.map(async (email) => {
            email.emailContent = await getEmail(email.Key);
            return email;
          }));
        }
      })
      .then(async values => {
        let tempEmailSet = values.sort((a, b) => a.Key.localeCompare(b.Key));
        setEmailList({...emailList, emailSet: tempEmailSet, statusMsg: "Hooray! You haven't received any emails today. Lucky you!"})
      });
    } else {
      setEmailList({...emailList, statusMsg:'Please login again...' })
      redirectToLogin();
    }
  };
  const setAuthCredentials=async()=>{
    let hash = (new URL(document.location)).hash;
    let loc = hash ? document.location.href.replace(/#/, '?') : document.location;
    let params = (new URL(loc)).searchParams;
    if(params.get('id_token') && params.get('access_token') && params.get('expires_in') && tokenIsValid(params.get('id_token'))){
      let temp = {
        id_token: params.get('id_token'),
        access_token: params.get('access_token'),
      };
      localStorage.setItem("userDetails" ,JSON.stringify(temp));
      setAuthDetails(temp)
    }else{ 
      localStorage.removeItem("userDetails") 
      redirectToLogin();
    }
  };

  const tokenIsValid=(idToken)=>{
    try{
      let x = JSON.parse(atob(idToken.split('.')[1]));
      return Date.now() < x.exp * 1000;//converting exp to msec
    } catch(e){
      setEmailList({...emailList, statusMsg: `Error: ${e}`});
    }
    return false;
  };
  const shareableUrl = () => {
    return `${ORIGIN}${PATHNAME}/get.html?emailId=${emailList.currentEmailId}`;
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
  
  const friendlyDate=(d)=>{
    return moment(d).fromNow();
  };

  const awsCredentialsAreAvailable=()=>{
    return dataMustBeSavedLocally ? localStorage.accessKeyId && localStorage.secretAccessKey && localStorage.region && localStorage.productLicenseKey: keys.accessKeyId && keys.secretAccessKey && keys.region && keys.productLicenseKey;
  }
  
  const getSESObject=(refresh) =>{
    if(keys.accessKeyId && keys.secretAccessKey && keys.region !== ""){
      if(!ses || refresh){
        let tempSes = new AWS.SES({
          apiVersion: '2010-12-01',
          accessKeyId: keys.accessKeyId,
          secretAccessKey: keys.secretAccessKey,
          region: keys.region
        });
        setSes(tempSes);
        getEmails();
      }
    } else {
      setSes(undefined);
    }
  };
  const updateLocalData=()=>{
    localStorage.accessKeyId = dataMustBeSavedLocally ? (keys.accessKeyId ? keys.accessKeyId : '') : '';
    localStorage.secretAccessKey = dataMustBeSavedLocally ? (keys.secretAccessKey ? keys.secretAccessKey : '') : '';
    localStorage.region = dataMustBeSavedLocally ? (keys.region ? keys.region : '') : '';
    localStorage.productLicenseKey = dataMustBeSavedLocally ? (keys.productLicenseKey ? keys.productLicenseKey : '') : '';
  };
  const readLocalData=()=>{
    let tempAccessKeyId = localStorage.accessKeyId ? localStorage.accessKeyId : undefined;
    let tempSecretAccessKey = localStorage.secretAccessKey ? localStorage.secretAccessKey : undefined;
    let tempRegion = localStorage.region ? localStorage.region : "";
    let tempProductLicenseKey = localStorage.productLicenseKey ? localStorage.productLicenseKey : "";
    setKeys({accessKeyId: tempAccessKeyId, productLicenseKey: tempProductLicenseKey, secretAccessKey: tempSecretAccessKey, region: tempRegion})
    if(keys.accessKeyId || keys.secretAccessKey || keys.region) {
      setDataMustBeSavedLocally(true);
    }
  };
  
  const authTokenIsValid=()=>{
    return authDetails && tokenIsValid(authDetails.id_token);
  };
  const redirectToLogin=() =>{
    window.location.href = loginUrl;
  };
  
  

  // const replyAll=async () =>{
  //   setEmailList({...emailList, statusMsg: 'Composing Reply...'})
  //   if(authTokenIsValid() && fqdn){
  //     if(currentEmail && currentEmail.emailContent){
  //      showEmailComposeScreen();
  //     }
  //   }
  // };
  // const loginLogoutAction=()=>{
  //   //if auth details are not available, user should be able to login
  //   if(!authTokenIsValid()) redirectToLogin();
  //   //if auth details are available, user should be able to log out
  //   if(authTokenIsValid()) logout();
  // };
  // const logout=()=> {
  //   window.location.href = logoutUrl;
  // };
 
  return (
    <div className="App">
      <form id="email-contents">
      <Navbar getEmails={getEmails} showEmailComposeScreen={showEmailComposeScreen} authTokenIsValid={authTokenIsValid} 
        setAwsModalIsVisible={setAwsModalIsVisible} awsCredentialsAreAvailable={awsCredentialsAreAvailable} />
      <div className="columns">
        <div className="column is-one-quarter">
          <EmailList emailList={emailList} friendlyDate={friendlyDate} fqdn={fqdn} setEmailList={setEmailList}/>
        </div>
        <div className="column is-half">
          <EmailContent emailList={emailList} />
        </div>
        <div className="column is-one-quarter is-size-5 primary-background">
          {/* <!-- email actions--> */}
          <button className="button secondary-icon-style navbar-item" onClick={(e) => {e.preventDefault(); setEmailComposeModalIsVisible(true)}}>Reply All</button>
          <input type="hidden" id="shareable-link" value={shareableUrl()} />
          <button className="button secondary-icon-style navbar-item" onClick={(e) => {e.preventDefault(); copyToClipboard()}}><span className="icon"><i className="fas fa-share-alt"></i></span><span>Share This Email</span></button>
          <p>
            <sub>{shareableLinkMsg ? <span className="is-size-7" >({shareableLinkMsg})</span> : null}</sub>
          </p>
        </div>
      </div>
      <AwsCredentialModal awsModalIsVisible={awsModalIsVisible} setAwsModalIsVisible={setAwsModalIsVisible} 
        deviceIsMobile={deviceIsMobile} keys={keys} setKeys={setKeys} sesRegions={sesRegions} 
        setDataMustBeSavedLocally={setDataMustBeSavedLocally} />

      <EmailComposeModal textEmailContent={textEmailContent} setEmailComposeModalIsVisible={setEmailComposeModalIsVisible} 
        showEmailComposeScreen={showEmailComposeScreen} deviceIsMobile={deviceIsMobile} htmlEmailContent={htmlEmailContent} 
        iframeComposedEmail={iframeComposedEmail} ADDRESS_DELIM={ADDRESS_DELIM} sendEmailDetails={sendEmailDetails} 
        setSendEmailDetails={setSendEmailDetails} ses={ses} emailComposeModalIsVisible={emailComposeModalIsVisible}/>
    </form>
    </div>
  )
}

export default App;

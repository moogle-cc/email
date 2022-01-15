import React, {useEffect, useState} from 'react';

import axios from 'axios';
// import moment from 'moment';
import AWS from 'aws-sdk';
import Navbar from './components/navbar';
import EmailList from './components/emailList';
import EmailContent from './components/emailContent';
// import AwsCredentialModal from './components/awsCredentialModal';
import EmailComposeModal from './components/emailComposeModal';
import worker from 'workerize-loader!./worker'; // eslint-disable-line import/no-webpack-loader-syntax
import './App.css';
import SideBar from './components/sidebar';
import {DEFAULT_FQDN, COGNITO_LOGIN_URL, EMAILS_LIST_URL, NEW_EMAIL_CHECKOUT_TIME, 
  COMMENT_POST_URL, EMAIL_CONTENT_URL, EMAIL_FOLDERPATH_QP_STRING} from './constants';
import {initializeEmailReadStatus, markEmailReadStatus, uniqueify, getNewestEmails} from './utils.js';

const App = (props) => {
  const fqdn= DEFAULT_FQDN;
  const loginUrl = COGNITO_LOGIN_URL;
  // const logoutUrl=COGNITO_LOGOUT_URL;
  // const baseUrl = `${ORIGIN}${PATHNAME}`;
  const [emailComposeModalIsVisible, setEmailComposeModalIsVisible] = useState(undefined);
  const [authDetails, setAuthDetails]= useState(localStorage.userDetails ? JSON.parse(localStorage.userDetails) : undefined);
  const [ses, setSes]= useState(undefined);
  // const [awsModalIsVisible, setAwsModalIsVisible]= useState(undefined);
  // const [sesRegions,setSesRegions]= useState(undefined);
  const [dataMustBeSavedLocally,setDataMustBeSavedLocally]= useState(undefined);
  const [buckets, setBuckets] = useState(undefined);
  const [isReply, setIsReply] = useState(false);
  // const [shareableLinkMsg, setShareableLinkMsg]= useState(undefined);

  const [emailList, setEmailList] = useState({
    emailContent: undefined,
    emailSet: undefined,
    statusMsg: 'Email contents will appear here',
    currentEmail: undefined,
    currentEmailId: undefined,
  });

  const [keys, setKeys] = useState({
    productLicenseKey: undefined,
    secretAccessKey: undefined,
    accessKeyId: undefined,
    region: undefined,
  });

  const [emailReadStatus, setEmailReadStatus] = useState(initializeEmailReadStatus());
  const [nextToken, setNextToken] = useState(undefined);
  const [newEmailWasFoundFlag, setNewEmailWasFoundFlag] = useState(false);
  const [newestEmails, setNewestEmails] = useState(undefined);
  const myWorker = worker();
  myWorker.addEventListener('message', async (e) => {
    if(e.data.NEW_EMAIL_WAS_FOUND){
      setNewEmailWasFoundFlag(true);
      console.log(`Checking if newest emails array was sent`);
      if(e.data.LATEST_EMAILS_LIST){
        //let x = getNewestEmails(emailList.emailSet, e.data.LATEST_EMAILS_LIST);
        //console.log(`Newest emails set length = ${x ? x.length : "------100------"}`);
        //setNewestEmails(x);
        console.log(`Newest emails set = ${JSON.stringify(e.data.LATEST_EMAILS_LIST)}`);
        setNewestEmails(e.data.LATEST_EMAILS_LIST);
      }
    }
  });
  useEffect(() => {
    let el = document.getElementsByClassName("newEmailHighlighter")[0];
    if(el) {
      el.classList.remove('newEmail');
      if(newEmailWasFoundFlag) {
        el.classList.add('newEmail');
      }
    }
  }, [newEmailWasFoundFlag]);
  useEffect(() => {
    if(newestEmails){
      console.log(`Here are the new emails @ ${JSON.stringify(newestEmails)}`);
    }
  }, [newestEmails]);
  useEffect(() => {
    let interval = setInterval(async () => {
      if(buckets[0].emailSet)
        myWorker.fetchList({fqdn, authDetails, EMAILS_LIST_URL, emailSet: buckets[0].emailSet, EMAIL_FOLDERPATH_QP_STRING});
    }, NEW_EMAIL_CHECKOUT_TIME);
    return () => {clearInterval(interval)};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buckets]);

  useEffect(() => {
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

    // let tempSesRegions = {"regions":[{"id":"us-east-1","name":"US East","location":"N. Virginia","optIn":false,"visible":true},{"id":"us-east-2","name":"US East","location":"Ohio","optIn":false,"visible":true},{"id":"us-west-1","name":"US West","location":"N. California","optIn":false},{"id":"us-west-2","name":"US West","location":"Oregon","optIn":false,"visible":true},{"id":"af-south-1","name":"Africa","location":"Cape Town","optIn":true},{"id":"ap-east-1","name":"Asia Pacific","location":"Hong Kong","optIn":true},{"id":"ap-south-1","name":"Asia Pacific","location":"Mumbai","optIn":false,"visible":true},{"id":"ap-northeast-2","name":"Asia Pacific","location":"Seoul","optIn":false,"visible":true},{"id":"ap-southeast-1","name":"Asia Pacific","location":"Singapore","optIn":false,"visible":true},{"id":"ap-southeast-2","name":"Asia Pacific","location":"Sydney","optIn":false},{"id":"ap-northeast-1","name":"Asia Pacific","location":"Tokyo","optIn":false,"visible":true},{"id":"ca-central-1","name":"Canada","location":"Central","optIn":false},{"id":"eu-central-1","name":"Europe","location":"Frankfurt","optIn":false,"visible":true},{"id":"eu-west-1","name":"Europe","location":"Ireland","optIn":false,"visible":true},{"id":"eu-west-2","name":"Europe","location":"London","optIn":false,"visible":true},{"id":"eu-south-1","name":"Europe","location":"Milan","optIn":true},{"id":"eu-west-3","name":"Europe","location":"Paris","optIn":false},{"id":"eu-north-1","name":"Europe","location":"Stockholm","optIn":false},{"id":"me-south-1","name":"Middle East","location":"Bahrain","optIn":true},{"id":"sa-east-1","name":"South America","location":"São Paulo","optIn":false,"visible":true}]};
    readLocalData();
    // setSesRegions(tempSesRegions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if(authDetails){
      getEmails("latest");
    } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ authDetails ]);

  useEffect(() => {
    getSESObject(true);
    updateLocalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys]); 

  useEffect(() => {
    localStorage.setItem("emailReadStatus", JSON.stringify(emailReadStatus));
  }, [emailReadStatus]);

  useEffect(() => {
    if(localStorage.getItem("nextToken") !== null) localStorage.removeItem("nextToken");
    if(nextToken) localStorage.setItem("nextToken", nextToken);
  }, [nextToken]);

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

  const downloadEmailBodyForSet = async set => {
    if(set){
      return Promise.all(
        set.map(async (email) => {
          email.emailContent = await getEmail(email.Key);
          return email;
        }));
    }
  }

  const getEmails = async (period = "latest")=> {
    // await setEmailList({emailSet: undefined,currentEmail: undefined,currentEmailId: undefined, emailContent: undefined, statusMsg: 'Retrieving...'});
    if(authTokenIsValid() && fqdn){
      // await setEmailList({...emailList, emailSet: undefined});
      let url = `${EMAILS_LIST_URL}?domain=${fqdn}&${EMAIL_FOLDERPATH_QP_STRING}`; 
      if(period === "load_more" && nextToken) url = `${url}&next-token=${encodeURIComponent(nextToken)}`;
      await axios({
        url: url,
        headers: {'Authorization': authDetails.id_token},
      })
      .then(async (response) => {
        if(response.data.NextToken) setNextToken(response.data.NextToken);
        if(response.data.Contents.length > 0){
          return await downloadEmailBodyForSet(response.data.Contents);
        }
      })
      .then(async values => {
        if(emailList && emailList.emailSet) values.unshift(...emailList.emailSet);
        values = uniqueify(values);
        let tempEmailSet = values.sort((a, b) => a.Key.localeCompare(b.Key));
        let tempBuckets = makeBuckets(tempEmailSet);
        await setBuckets(tempBuckets);
        assignReadUnread(tempEmailSet);
        await setEmailList({...emailList, emailSet: tempBuckets[0].emailSet,statusMsg: "Hooray! You haven't received any emails today. Lucky you!"});
      })
      .then(() => {
        if(period === "latest") setNewEmailWasFoundFlag(false);
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
      }
      localStorage.setItem("userDetails" ,JSON.stringify(temp));
      setAuthDetails(temp);
      let href = window.location.href;
      let newUrl = href.substring(0, href.indexOf('#'));
      window.history.replaceState({}, '', newUrl);
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
        getEmails("latest");
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
  let getOrCreateBucketByName = (buckets, bucketName) => {
    let bucket = buckets.find(bucket => bucket.name === bucketName.toLowerCase());
    if(!bucket) buckets.push({name: bucketName.toLowerCase(), emailSet: []});
    return buckets.find(bucket => bucket.name === bucketName.toLowerCase());
  };
  const getSenderEmail = (email) => email.emailContent.from.value[0].address.toLowerCase();
  const emailAddressBelongsToThisDomain = (emailAddress) => emailAddress && emailAddress.split("@")[1] === DEFAULT_FQDN;
  const getIndexOfBucket = (buckets, name) => buckets.findIndex((b) => b.name.toLowerCase() === name.toLowerCase());
  const moveBucketWithNameToFront = (buckets, name) => {
    let index = getIndexOfBucket(buckets, name);
    if(index > -1) {
      let bucket = buckets.splice(index, 1);
      buckets.unshift(...bucket);
    }
  };
  const moveBucketWithNameToBack = (buckets, name) => {
    let index = getIndexOfBucket(buckets, name);
    if(index > -1) {
      let bucket = buckets.splice(index, 1);
      buckets.push(...bucket);
    }
  };
  const sortBuckets = (buckets) => {
    buckets.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
    moveBucketWithNameToFront(buckets, 'all');
    moveBucketWithNameToBack(buckets, 'sent');
    moveBucketWithNameToBack(buckets, 'spam');
    return buckets;
  }
  const makeBuckets = (emailSet) => {
    let buckets = [];
    getOrCreateBucketByName(buckets, "all");
    getOrCreateBucketByName(buckets, "spam");
    getOrCreateBucketByName(buckets, "sent");
    emailSet.forEach((email) => {
      if(email && email.emailContent){
        let emailSentToCc = [];
        if(email.emailContent.to && email.emailContent.to.value) emailSentToCc.push(...email.emailContent.to.value);
        if(email.emailContent.cc && email.emailContent.cc.value) emailSentToCc.push(...email.emailContent.cc.value);
        let senderEmail = getSenderEmail(email).toLowerCase();
        if(emailAddressBelongsToThisDomain(senderEmail)) getOrCreateBucketByName(buckets, "sent").emailSet.push(email);
        emailSentToCc.forEach(sentTo => {
          if(emailAddressBelongsToThisDomain(sentTo.address)){
            if(emailIsSpamOrVirus(email)) getOrCreateBucketByName(buckets, "spam").emailSet.push(email);
            else {
              let name = sentTo.address.split("@")[0];
              let newBucket = name.toLowerCase();
              getOrCreateBucketByName(buckets, newBucket).emailSet.push(email);
              getOrCreateBucketByName(buckets, "all").emailSet.push(email);
            }
          }
        });
      }
    });
      
    return sortBuckets(buckets);
  }
  const emailIsSpamOrVirus = (email) => email.emailContent.headers["x-ses-spam-verdict"] !== "PASS" || email.emailContent.headers["x-ses-virus-verdict"] !== "PASS";
  const assignReadUnread = (emailSet) => {
    let tempEmailReadStatus = JSON.parse(JSON.stringify(emailReadStatus));
    emailSet.forEach(email => {
      markEmailReadStatus(email, tempEmailReadStatus);
    });
    setEmailReadStatus(tempEmailReadStatus);
  }
  // const shareableUrl = () => {
  //   return `${ORIGIN}${PATHNAME}/get.html?emailId=${emailList.currentEmailId}`;
  // };
 
  // const copyToClipboard = () => {
  //   var copyText = document.getElementById("shareable-link");
  //   copyText.type = 'text';
  //   copyText.select();
  //   document.execCommand("copy");
  //   copyText.type = 'hidden';
  //   setShareableLinkMsg("Copied email url. Now, bookmark or share the url with others.");
  // };
  
  // const friendlyDate=(d)=>{
  //   return moment(d).fromNow();
  // };

  // const awsCredentialsAreAvailable=()=>{
  //   return dataMustBeSavedLocally ? localStorage.accessKeyId && localStorage.secretAccessKey && localStorage.region && localStorage.productLicenseKey: keys.accessKeyId && keys.secretAccessKey && keys.region && keys.productLicenseKey;
  // }

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
    
    <div className="mainEmailContainer" style={{height: "100vh"}}>
      <SideBar buckets={buckets} setIsReply={setIsReply} setEmailList={setEmailList} setEmailComposeModalIsVisible={setEmailComposeModalIsVisible}/>
      <div class="emailContainer">
        <Navbar getEmails={getEmails} authTokenIsValid={authTokenIsValid}  />
        <div style={{display: "flex"}}>
          <EmailList emailList={emailList} fqdn={fqdn} setEmailList={setEmailList}/>
          {
            emailList.currentEmail ? 
                <EmailContent setIsReply={setIsReply} emailList={emailList} COMMENT_POST_URL={COMMENT_POST_URL} 
                  setEmailComposeModalIsVisible={setEmailComposeModalIsVisible}/> 
            : null
          }
        </div>
      </div>
      
      {/* 
          {/* <!-- email actions--> *
          <input type="hidden" id="shareable-link" value={shareableUrl()} />
          <a role="button" href="/" className="button secondary-icon-style navbar-item" onClick={(e) => {e.preventDefault(); copyToClipboard()}}><span className="icon"><i className="fas fa-share-alt"></i></span><span>Share This Email</span></a>
          <p>
            <sub>{shareableLinkMsg ? <span className="is-size-7" >({shareableLinkMsg})</span> : null}</sub>
          </p>
      */}
      {/* <AwsCredentialModal awsModalIsVisible={awsModalIsVisible} setAwsModalIsVisible={setAwsModalIsVisible} 
         keys={keys} setKeys={setKeys} sesRegions={sesRegions} setDataMustBeSavedLocally={setDataMustBeSavedLocally} /> */}

      <EmailComposeModal setEmailComposeModalIsVisible={setEmailComposeModalIsVisible} emailList={emailList}
        isReply={isReply} ses={ses} emailComposeModalIsVisible={emailComposeModalIsVisible}/>
    </div>
  )
}

export default App;

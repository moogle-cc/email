import React, { useEffect } from 'react';
import "./sidebar.css"

const SideBar = ({buckets, setEmailList}) => {
    
    useEffect(() => {
        if(buckets)
            document.getElementById(0).classList.add('selectedBucket')
    }, [buckets])
    const  showBucketEmail = (index) => {
        let buckets = JSON.parse(localStorage.buckets);
        setEmailList({
            emailContent: undefined,
            emailSet: buckets[index].emailSet,
            statusMsg: 'Retreiving...',
            currentEmail: undefined,
            currentEmailId: undefined,
        })
    }
    const selectBucket = (idx) => {
        const noOfBuckets = document.querySelectorAll('[id]');
        noOfBuckets.forEach((data) => {
          if(data.classList.contains('selectedBucket')) data.classList.remove('selectedBucket');
          document.querySelector('[id="'+idx+'"]').classList.add('selectedBucket');
        });
        // document.querySelector('[id="'+idx+'"]').classList.add('selectedBucket');
        return true;
      }
    return(
        <div className="left-panel">
            <div className="moogle-logo">
                <img src="https://moogle.cc/media/moogle-logo.png" alt="moogle"/>
            </div>
            <div className="bucketContainer">
                <h1 className="bucketHeader">BUCKETS</h1>
            </div>
            <ul className="bucketList" style={{overflowY: "scroll", maxHeight: "65vh"}}>
                {
                    buckets ? 
                    buckets.map((bucket,idx) => (
                        <li style={{'cursor': 'pointer'}} key={`email-idx-${idx}`} id={idx} onClick={(e) =>{e.preventDefault(); selectBucket(idx); showBucketEmail(idx)}}>
                        {idx === buckets.length-1 ? <hr style={{backgroundColor: "rgba(0,0,0,0.4)", margin: "0.5em 0"}}/> : null}
                        {
                            <div className="bucket flex">
                                <img src="https://telegra.ph/file/01c9dae93673d009e5dde.jpg" alt="telephone"/>
                                <h3 className="bucketName">{ bucket.name }</h3>
                            </div>
                        }
                        </li>
                    ))
                    :null
                }                
            </ul>
            <button className="editorBtn">
                <i className="fa fa-pencil"></i>
            </button>
        </div>
    )
}

export default SideBar;
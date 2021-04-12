import React, {useEffect, useState} from 'react';
import './New.css';

const NewDesign = (props) => {
    function Email() {
        return (
            <div class="email flex">
                <img src="https://telegra.ph/file/01c9dae93673d009e5dde.jpg" />
                <h2 class="emailUesrname">interns@jobs.com</h2>
                <p class="emailTextPreview"> we're making sure that you won't miss the stadium this match season. We see your feve about crikcet ... </p>
            </div>
        )
    }
    return(
      <div className="mainEmailContainer">
        <div className="left-panel">
            <div className="moogle-logo">
                <img src="https://moogle.cc/media/moogle-logo.png" alt="moogle" />
            </div>
            <div class="bucketContainer">
                <h1 class="bucketHeader">BUCKETS</h1>
            </div>
            <button class="editorBtn">
                <i class="fa fa-pencil"></i>
            </button>
        </div>
        <div class="emailContainer">
            <div class="emailContainerHeader flex justify-between">
                <input type="text" class="emailSearch" placeholder="&#xF002;  Search" />
                <div class="headerRightElements flex">
                    <div class="refreshBtn element flex justify-center align-center"> <span>&#xf021;</span> </div>
                    <div class="userAvatar element flex justify-center align-center"> <span> A </span> </div>
                </div>
            </div>
            <div class="emailListContainer">
                <div class="emailHeader flex">
                    <img src="https://moogle.cc/media/moogle-comment-share.png" />
                    <h1 class="flex justify-center align-center"> <span> Jobs </span></h1>
                </div>
                <div class="emailLists">
                    <Email />
                    <Email />
                    <Email />
                    <Email />
                    <Email />
                    <Email />
                    <Email />
                    <Email />
                </div>
            </div>
        </div>
      </div>
        )
}

export default NewDesign;
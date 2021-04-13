import React from 'react';

const SideBar = () => {
    return(
        <div className="left-panel">
            <div className="moogle-logo">
                <img src="https://moogle.cc/media/moogle-logo.png" alt="moogle"/>
            </div>
            <div className="bucketContainer">
                <h1 className="bucketHeader">BUCKETS</h1>
            </div>
            <button className="editorBtn">
                <i className="fa fa-pencil"></i>
            </button>
        </div>
    )
}

export default SideBar;
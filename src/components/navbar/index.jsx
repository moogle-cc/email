import React from 'react'; 

const Navbar = ({getEmails, showEmailComposeScreen, authTokenIsValid, setAwsModalIsVisible, awsCredentialsAreAvailable}) => {

    return  (
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
            <button className="button is-normal is-primary" onClick={(e) => {e.preventDefault(); setAwsModalIsVisible(true)}}>{!awsCredentialsAreAvailable() ? "Add AWS Credentials" : "Change AWS Credentials"}</button>
          </div>
        {/* </div> */}
      </nav>
    )
}

export default Navbar;
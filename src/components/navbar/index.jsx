import React from 'react'; 

const Navbar = ({getEmails, setEmailComposeModalIsVisible, authTokenIsValid, setAwsModalIsVisible, awsCredentialsAreAvailable}) => {

    return  (
        <nav className="container navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a  href="/"><img className="navbar-item is-small title" width="112" height="28" src="assets/moogle-logo.png" alt="Moogle" /></a>
          <button  className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" onClick={(e) =>{e.preventDefault(); setAwsModalIsVisible(true)}}>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start is-hidden">
          </div>
          <div className="navbar-end">
            {
              authTokenIsValid() ?
              <div className="navbar-item">
                
                <a role="button" href="/" className="navbar-item button secondary-icon-style"  onClick={(e) =>{e.preventDefault(); getEmails()}}>
                <span className="icon"><i className="fas fa-sync "></i> </span> <span>Refresh Email List </span>
                </a>
                <a role="button" href="/" className="navbar-item button secondary-icon-style" onClick={(e)=> {e.preventDefault(); setEmailComposeModalIsVisible(true)}}>
                  <span className="icon"><i className="far fa-edit "></i> </span> <span>Compose </span>
                </a>
              </div> 
              
              :null
            }
            
            <div className="navbar-item">
              <a role="button" href="/" className="navbar-item button secondary-icon-style" onClick={(e) => {e.preventDefault(); setAwsModalIsVisible(true)}}>{!awsCredentialsAreAvailable() ? "Add AWS Credentials" : "Change AWS Credentials"}</a>
            </div>
          </div>
        </div>
        {/* </div> */}
      </nav>
    )
}

export default Navbar;
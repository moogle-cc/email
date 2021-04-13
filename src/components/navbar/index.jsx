import React from 'react'; 

const Navbar = ({getEmails, setEmailComposeModalIsVisible, authTokenIsValid, setAwsModalIsVisible, awsCredentialsAreAvailable}) => {

    return  (
      <div>
        {
          authTokenIsValid() ?
          <div class="emailContainerHeader flex justify-between">
            <input type="text" class="emailSearch" placeholder="&#xF002;  Search" />
            <div class="headerRightElements flex">
                <div class="refreshBtn element flex justify-center align-center" onClick={(e) =>{e.preventDefault(); getEmails()}}> <span>&#xf021;</span> </div>
                <div class="userAvatar element flex justify-center align-center"> <span> A </span> </div>
            </div>
          </div>
          :null
        }
      </div>
      
        
    )
}

export default Navbar;
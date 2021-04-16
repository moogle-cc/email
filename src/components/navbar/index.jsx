import React from 'react'; 

const Navbar = ({getEmails, authTokenIsValid}) => {
    const getUsername = () => {
      if(localStorage.userDetails){
        let id_token = JSON.parse(localStorage.userDetails).id_token;
        let name = JSON.parse(atob(id_token.split('.')[1])).email[0].toUpperCase()
        return name;
      }
      return null;
    }
    return  (
      <div>
        {
          authTokenIsValid() ?
          <div class="emailContainerHeader flex justify-between">
            <input type="text" class="emailSearch" placeholder="&#xF002;  Search" />
            <div class="headerRightElements flex">
                <div class="refreshBtn element flex justify-center align-center" onClick={(e) =>{e.preventDefault(); getEmails()}}> <span>&#xf021;</span> </div>
                <div class="userAvatar element flex justify-center align-center"> <span> {getUsername()} </span> </div>
            </div>
          </div>
          :null
        }
      </div>
      
        
    )
}

export default Navbar;
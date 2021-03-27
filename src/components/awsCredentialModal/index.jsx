import React from 'react';

const AwsCredentialModal = ({awsModalIsVisible, setAwsModalIsVisible, deviceIsMobile, keys, setKeys, sesRegions, setDataMustBeSavedLocally}) => {
  const handleChange =(e) => {
    e.preventDefault();
    const {name, value} = e.target;
    setKeys({...setKeys, [name]: value})
  }

    return (
        <div id="awsCredentialsModal" className={awsModalIsVisible ? 'is-active modal':'modal'}>
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
                    <input className="input" type="password" placeholder="AWS Access Key Id " value={keys.accessKeyId} name="accessKeyId" onChange={(e)=> handleChange} />
                    {keys.accessKeyId ? <sub >***{keys.accessKeyId.substring(keys.accessKeyId.length - 5)}</sub> : null}
                  </div>
                </div>
                <div className="field is-block">
                  <div className="control">
                    <input className="input" type="password" placeholder="AWS Secret Access" value={keys.secretAccessKey} name="secretAccessKey" onChange={handleChange} />
                    {keys.secretAccessKey ? <sub >***{keys.secretAccessKey.substring(keys.secretAccessKey.length - 5)}</sub> : null}
                  </div>
                </div>
                <div className="field is-block">
                  <div className="control">
                    {
                      sesRegions ? 
                      <div className="select is-primary" >
                        <select name="region" onChage={handleChange}>
                          <option disabled value="">Select AWS region</option>
                          {
                            sesRegions.regions.map((sesRegion) => 
                              {
                                if(sesRegion.visible)
                                  return (<option selected={sesRegion.id === keys.region ? true :false} value={sesRegion.id}>{sesRegion.name} - {sesRegion.location}</option>)
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
    )
}

export default AwsCredentialModal;
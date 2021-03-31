const workercode = () => {
  this.onmessage = async function(e) {
    let {fqdn, authDetails, EMAILS_LIST_URL} = e.data;
    await fetch(`${EMAILS_LIST_URL}?domain=${fqdn}&folderpath=/email`,{
      headers: {'Authorization':authDetails.id_token},
    }).then((response)=> response.json())
    .then(async (response) => {
      if(response.Contents.length > 0){
          this.postMessage(response.Contents[0].Key)
        };
    })
  }
};

let code = workercode.toString();
code = code.substring(code.indexOf("{")+1, code.lastIndexOf("}"));

const blob = new Blob([code], {type: "application/javascript"});
const worker_script = URL.createObjectURL(blob);

export default worker_script;

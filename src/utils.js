export function getEmailIdFromKey (emlId) {
  return emlId.split('/').pop();
}

export function listIncludesKey(list, emlId) {
  return list.includes(emlId);
}

export function addKeyToList(list, emlId) {
  if(!listIncludesKey(list, getEmailIdFromKey(emlId))){
    list.push(getEmailIdFromKey(emlId));
  }
}

export function removeKeyFromList(list, emlId) {
  if(listIncludesKey(list, getEmailIdFromKey(emlId))){
    list.splice(list.indexOf(getEmailIdFromKey(emlId)), 1);
  }
}

export function  markEmailReadStatus (email, emailReadStatus) {
  let emlId = getEmailIdFromKey(email.Key);
  if(email.readStatus) {
    addKeyToList(emailReadStatus.readList, emlId);
    removeKeyFromList(emailReadStatus.unreadList, emlId);
  }
  if(email.readStatus === false){
    addKeyToList(emailReadStatus.unreadList, emlId);
    removeKeyFromList(emailReadStatus.readList, emlId);
  }
  if(!listIncludesKey(emailReadStatus.readList, emlId)) {
    addKeyToList(emailReadStatus.unreadList, emlId);
  }
}

export function emailWasRead (email, emailReadStatus){
    return listIncludesKey(emailReadStatus.readList, getEmailIdFromKey(email.Key));
}

export function initializeEmailReadStatus() {
  let x = JSON.parse(localStorage.getItem("emailReadStatus"));
  if(!x) {
    x = {readList: [], unreadList: []};
  } else {
    if(x.read && typeof x.read === 'object'){
      x.readList = Object.keys(x.read).map(emlKey => getEmailIdFromKey(emlKey));
      delete x.read;
    }
    if(x.unread && typeof x.unread === 'object'){
      x.unreadList = Object.keys(x.unread).map(emlKey => getEmailIdFromKey(emlKey));
      delete x.unread;
    }
  }
  return x;
}
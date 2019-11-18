function Alert(message, title, callback) {
  navigator.notification.alert(message, callback, title);
}

function Confirm(message, title, callbackOk, callbackCancel) {
  callbackCancel=callbackCancel||function(){};
  navigator.notification.confirm(message, function(buttonIndex){
    if(buttonIndex==1){
      callbackOk();
    } else{
      callbackCancel();
    }
  }, title);
}

export {Alert, Confirm};

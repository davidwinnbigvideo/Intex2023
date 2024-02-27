// Authors: Spencer, Mark, David, Aiki
// This is the scripts for login




// create variables to grab the values from id
const popupOverlay = document.getElementById('popup-overlay');
const popupContent = document.getElementById('popup-content');
const closeButton = document.getElementById('close-button');

// this function pop up the sign up form when admin click add user button
function openPopup() {
    popupOverlay.classList.toggle('open');
    popupContent.classList.toggle('open');
}

// this function close sign up form when admin cancel to create user
function closePopup() {
    popupOverlay.classList.toggle('open');
    popupContent.classList.toggle('open')
  }  

// this function check if the user input exactly matched password with confirm password.
// If the user made a mistake for their password, show a hidden message
// When user finished their requirement field, it submit the form information
function createAccount()
{            
    let sPassword;
    let sConfPassword;
    sPassword = document.getElementById("password").value
    sConfPassword = document.getElementById("confirmpass").value
    
    if (sPassword !== sConfPassword || sPassword == "")
    {
        document.getElementById("hideMessage").style.display = "block"
        document.getElementById("confirmpass").focus();
    }
    else
    {
        
        var form = document.getElementById("signUpPopForm");

        // Submit the form
        form.submit();
        result();
    }
    
}

//this function allow user to see the hidden password and put them back as dots
function showPassword()
{
    var x = document.getElementById("inputPass");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

// result function is to show hidden message when user couldn't login to the account to tell username or password is wrong
// clear form and focus on username input
function result() {
    setTimeout(function() {
        document.getElementById('notFound').style.display = 'block';
        document.getElementById('logform').reset()
        document.getElementById('inputName').focus()
    }, 600);
}
//Authors: Spencer, Mark, David, Aiki
// edit profile scripts




// this funtion let the user to change user information, and check if the password is matched with password confirmation
// if the password matches, submit the form to update information
function editAccount()
{            
    let sPassword;
    let sConfPassword;
    sPassword = document.getElementById("password").value
    sConfPassword = document.getElementById("confirmpass").value

    if (sPassword !== sConfPassword)
    {
        document.getElementById("hideMessage").style.display = "block"
        document.getElementById("password").focus();
    }
    else
    {
        alert("You successfully updated the account")
        var form = document.getElementById("editProfileForm");

        // Submit the form
        form.submit();
    }
    
}


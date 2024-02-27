//Authors: Spencer, Mark, David, Aiki
// Landing page scripts



// this function direct user to login page
function loginRedirect() {
    window.location.href = '/login'
}

// this function direct user to original page by logging out
function loginoutRedirect() {
    window.location.href = '/'
}

//Makes the page scroll down smoothly
function smoothScroll(event, targetId) {
    event.preventDefault();

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const offset = targetElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: offset,
            behavior: 'smooth' // This enables smooth scrolling
        });
    }
}

    let timeLeft = 20;
    var timer = document.getElementById('resendOtp')
    var timeId = setInterval(countdown, 1000);

    function countdown() {
        if (timeLeft == -1) {
            clearTimeout(timeId);
            working();
        } else {
            timer.innerHTML = timeLeft + 'seconds remaining';
            timeLeft--
        }
    }

    function working() {
        timer.style.display = 'none'
        var showresendotp = document.getElementById('resendButton')
        showresendotp.style.display = 'block'
    }

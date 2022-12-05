(function() {
    'use strict';    
    function updateClock() {
        var time = new Date();
        var hour = time.getHours();
        var minute = time.getMinutes();
        var ampm = hour > 12 ? "pm" : "am";
        hour = hour > 12 ? hour - 12 : hour;
        minute = minute > 9 ? minute : "0" + minute;
    
        var year = time.getFullYear();
        var month = time.getMonth();
        var datestr = ["Sunday", "Monday", "Tuesday", 
        "Wednesday", "Thursday", "Friday", 
        "Saturday"][time.getDay()] +  ", " +
                         ["January", "February", "March", 
                         "April", "May", "June", "July", "August", 
                          "September", "October", "November", "December"][month] + " " 
                          + time.getDate() + ", " + year;
    
        document.getElementById('clock').innerHTML = '<div class="time">' + hour + ':' + minute + ' <span class="small">' + ampm + '</span></div><div class="date">' + datestr + '</div>'
    }
    // draw clock
    updateClock();

    // Update clock every second
    setInterval(updateClock, 1000);

     // Set a random background
     var n = Math.floor(Math.random() * 30 + 1);
     if (n > 29) n = 29;
     document.querySelector('.bg').style.backgroundImage = 
     "url('images/background/bg" + n + ".jpg')";

})();




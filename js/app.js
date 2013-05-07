// Trivial app, but it's always good to be strict
"use strict";

// All DOM stuff should wait until we have a DOM
// NOT doing this may improve performance, but it would be a premature
// optimization at this stage with such a trivial app and no performance issues
window.onload = function () {
    calculateDates();
}



function loadTeams(teams) {
    // console.log(teams);
};

function loadGames(games) {
    // console.log(games);
};



// Date math is HARD - I would never do. this in real life
// See this great talk for reasons why it's silly to actually use this code
// http://youtu.be/OhjOXrFHL7o
function calculateDates() {

    // Length of each month in days - hardcoded 29 days in Feb 2012 since it was a leap year
    // I don't need all of them, but it makes the code mode readable.
    var monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    for (var i = 0; i < monthNames.length; i++) {
        // Changing the length of months to be zero-indexed could be confusing, I think this is more readable
        for (var j = 0; j < monthLengths[i]; j++) {
            console.log(j + 1, getOrdinal(j + 1), monthNames[i]);
        };
    };
}



// Technically I wrote this before the test, so it should count as a library
// But it's a common algorithm, and I wrote it out long form instead of the golf'd shortened way.
function getOrdinal(number) {
    // Using the explicit method instead of implicit conversion because this is a test
    var end = number.toString().slice(-1);

    if (number > 3 && number < 21) {
        return "th";
    } else if (end == 1) {
        return "st";
    } else if (end == 2) {
        return "nd";
    } else if (end == 3) {
        return "rd";
    } else {
        return "th";
    }
}

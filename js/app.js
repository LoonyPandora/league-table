// Trivial app, but it's always good to be strict
"use strict";

// All DOM stuff should wait until we have a DOM
// NOT doing this may improve performance, but it would be a premature
// optimization at this stage with such a trivial app and no performance issues
window.onload = function () {
    var ISODates = createDateRange();

    // May as well use the fast modern tools we have available if we don't support old browsers
    Object.keys(games).forEach(function(key) {

        console.log(games[key]);

        // The goals are a string instead of a numeric for some reason.
        // Probably as a hidden gotcha in this test, but maybe not.


        // This is super fugly munging data. Refactor it ASAP
        if (!teams[games[key].homeTeamId].goalsFor)      teams[games[key].homeTeamId].goalsFor     = 0;
        if (!teams[games[key].homeTeamId].goalsAgainst)  teams[games[key].homeTeamId].goalsAgainst = 0;
        if (!teams[games[key].awayTeamId].goalsFor)      teams[games[key].awayTeamId].goalsFor     = 0;
        if (!teams[games[key].awayTeamId].goalsAgainst)  teams[games[key].awayTeamId].goalsAgainst = 0;
        
        
        teams[games[key].homeTeamId].goalsFor     += parseInt(games[key].homeGoals, 10);
        teams[games[key].awayTeamId].goalsFor     += parseInt(games[key].awayGoals, 10);

        teams[games[key].awayTeamId].goalsAgainst += parseInt(games[key].homeGoals, 10);
        teams[games[key].homeTeamId].goalsAgainst += parseInt(games[key].awayGoals, 10);


        // ISODates[convertToISO8601(games[key].date)].push(games[key]);
    });

    console.log(teams, getSortedTable(teams));

}


var table = [
    { id: "1", team: "United", played: "", wins: "", draws: "", losses: "", goalsFor: "20", goalsAgainst: "", goalDifference: "19", points: "99"},
    { id: "2", team: "City", played: "", wins: "", draws: "", losses: "", goalsFor: "25", goalsAgainst: "", goalDifference: "20", points: "98"},
    { id: "3", team: "Chelsea", played: "", wins: "", draws: "", losses: "", goalsFor: "10", goalsAgainst: "", goalDifference: "18", points: "90"}
];



var teams = {};
var games;
function loadTeams(t) {
    for (var i = 0; i < t.length; i++) {
        teams[ t[i].id ] = t[i];
    };
};

function loadGames(g) {
    games = g;
};



function getSortedTable(table) {
    var sortedTable = [];
    Object.keys(table).forEach(function(key) {
        sortedTable.push(table[key]);
    });

    sortedTable.sort(function (a, b) {
        if (a.points < b.points) return  1;
        if (a.points > b.points) return  -1;

        if (a.goalDifference < b.goalDifference) return  1;
        if (a.goalDifference > b.goalDifference) return  -1;

        if (a.goalsFor < b.goalsFor) return  1;
        if (a.goalsFor > b.goalsFor) return  -1;

        return 0;
    });

    // console.log(table)

    return sortedTable;
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



// Date math is HARD - I would never do. this in real life
// See this great talk for reasons why it's silly to actually use this code
// http://youtu.be/OhjOXrFHL7o

// Gives us a nice list of ISO dates for 2011 and 2012
// It's a larger range than we need, but the code is simpler and more readable this way.
function createDateRange() {
    var years = [2011, 2012];
    var monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    var ISODates = {};
    // Nested loops aren't cool...
    for (var i = 0; i < years.length; i++) {
        for (var j = 0; j < monthLengths.length; j++) {
            for (var x = 0; x < monthLengths[j]; x++) {
                ISODates[years[i] + "-" + pad(j + 1) + "-" + pad(x + 1)] = [];
            };
            
        };
    };

    return ISODates;
}


function convertToISO8601(date) {
    // A bit hairy. Clean this up
    var ISODate = date.split("/").reverse();
    ISODate[0] = 20 + ISODate[0];
    ISODate[1] = pad(ISODate[1]);
    ISODate[2] = pad(ISODate[2]);

    return ISODate.join("-");
}


// Pads single digits to 2 digits long with leading zeros
function pad(number) {
    var str = "" + number;
    while (str.length < 2) {
        str = "0" + str;
    }
    return str;
};


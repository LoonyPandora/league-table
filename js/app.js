// Trivial app, but it's always good to be strict
"use strict";

// All DOM stuff should wait until we have a DOM
// NOT doing this may improve performance, but it would be a premature
// optimization at this stage with such a trivial app and no performance issues
window.onload = function () {
    var ISODates = createDateRange();

    // May as well use the fast modern tools we have available if we don't support old browsers
    Object.keys(games).forEach(function(date) {
        Object.keys(games[date]).forEach(function(fixture) {
            var game = games[date][fixture];

            var homeTeam = teams[game.homeTeamId];
            var awayTeam = teams[game.awayTeamId];

            homeTeam.played++;
            homeTeam.goalsFor += game.homeGoals;
            homeTeam.goalsAgainst += game.awayGoals;
            homeTeam.goalDifference += (game.homeGoals - game.awayGoals);

            awayTeam.played++;
            awayTeam.goalsFor += game.awayGoals;
            awayTeam.goalsAgainst += game.homeGoals;
            awayTeam.goalDifference += (game.awayGoals - game.homeGoals);

            if (game.homeGoals - game.awayGoals > 0) {
                // Home Win
                homeTeam.wins++;
                homeTeam.points += 3;
                awayTeam.losses++;
            } else if (game.homeGoals - game.awayGoals === 0) {
                // Draw
                homeTeam.draws++;
                homeTeam.points += 1;
                awayTeam.draws++;
                awayTeam.points += 1;
            } else if (game.homeGoals - game.awayGoals < 0) {
                // Away Win
                homeTeam.losses++;
                awayTeam.wins++;
                awayTeam.points += 3;
            }
        });
    });

    console.log(teams, getSortedTable(teams));

}


var teams = {};
var games = {};
function loadTeams(t) {
    Object.keys(t).forEach(function(key) {
        teams[ t[key].id ] = {
            id:             t[key].id,
            name:           t[key].name,
            played:         0,
            wins:           0,
            draws:          0,
            losses:         0,
            goalsFor:       0,
            goalsAgainst:   0,
            goalDifference: 0,
            points:         0
        };
    });
};

function loadGames(g) {
    Object.keys(g).forEach(function(key) {
        var ISODate = convertToISO8601(g[key].date);

        if (!games[ISODate]) { games[ISODate] = []; }

        // The goals are a string instead of a numeric for some reason.
        // Probably as a potential gotcha in this test..
        games[ISODate].push({
            date:       ISODate,
            homeTeamId: g[key].homeTeamId,
            awayTeamId: g[key].awayTeamId,
            homeGoals:  parseInt(g[key].homeGoals, 10),
            awayGoals:  parseInt(g[key].awayGoals, 10)
        });
    });
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

    return sortedTable;
}







// Technically I wrote this before the test, so it should count as a library
// But it's a common algorithm, and I wrote it out long form instead of the golf'd shortened way.
function getOrdinal(number) {
    // Using the explicit method instead of implicit conversion because this is a test
    var end = number.toString().slice(-1);

    if (number > 3 && number < 21) {
        return "th";
    } else if (end === 1) {
        return "st";
    } else if (end === 2) {
        return "nd";
    } else if (end === 3) {
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


// A bit hairy. Clean this up
function convertToISO8601(date) {
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


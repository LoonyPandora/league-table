// Trivial app, but it's always good to be strict
"use strict";

// All DOM stuff should wait until we have a DOM
// NOT doing this may improve performance, but it would be a premature
// optimization at this stage with such a trivial app and no performance issues
window.onload = function () {
    var ISODates = createDateRange();

    var tablesByDate = playGames();

    Object.keys(tablesByDate).forEach(function (table) {
        updateHTML(tablesByDate[table]);
    })
}



// Global vars to put the JSONP stuff into
var teams = {};
var games = {};

// Called by the JSONP
function loadTeams(teamList) {
    teamList.forEach(function(team) {
        teams[team.id] = {
            id:              team.id,
            name:            team.name,
            played:          0,
            wins:            0,
            draws:           0,
            losses:          0,
            goalsFor:        0,
            goalsAgainst:    0,
            goalDifference:  0,
            points:          0
        };
    });
};

// Called by the JSONP
function loadGames(gameList) {
    gameList.forEach(function(game) {
        var ISODate = convertToISO8601(game.date);

        if (!games[ISODate]) { games[ISODate] = []; }

        // The goals are a string instead of a numeric for some reason.
        // Probably as a potential gotcha in this test..
        games[ISODate].push({
            date:       ISODate,
            homeTeamId: game.homeTeamId,
            awayTeamId: game.awayTeamId,
            homeGoals:  parseInt(game.homeGoals, 10),
            awayGoals:  parseInt(game.awayGoals, 10)
        });
    });
};



// Generates the main data structure containing results / teams / league tables etc
function playGames() {
    var tablesByDate = {};

    // May as well use the fast modern tools we have available if we don't support old browsers
    Object.keys(games).forEach(function(date, index, dates) {
        games[date].forEach(function(game) {
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
            } else {
                // Richmond Arithmetic versus Nottingham Marjorie - Match postponed due to bent pitch
            }
        });

        // This is the table after all the games on a given date
        tablesByDate[date] = sortLeagueTable(teams);

        // Now calculate the movement of teams between matchdays
        tablesByDate[date].forEach(function(team, position) {
            team.position = position;

            // Gets the position from the previous matchday table
            if (dates[index-1]) {
                tablesByDate[dates[index-1]].forEach(function(lastTeam) {
                    if (team.id === lastTeam.id) {
                        // LOWER position numbers are higher up the table
                        // That's why the logic seems reversed.
                        // It makes sense when working with the HTML

                        if (team.position < lastTeam.position) {
                            team.movement = "up";
                        } else if (team.position > lastTeam.position) {
                            team.movement = "down";
                        } else {
                            team.movement = "";
                        }
                    }
                });
            }
        });
    });
    
    return tablesByDate;
}



// Given a table array, generates the tbody portion of the HTML table.
// Normally I'd use a templating library like mustache
function updateHTML(table) {
    var output = "";
    table.forEach(function(team) {
        output += "<tr>";
        output += "<td>" + team.name + "</td>";
        output += "<td>" + team.played + "</td>";
        output += "<td>" + team.wins + "</td>";
        output += "<td>" + team.draws + "</td>";
        output += "<td>" + team.losses + "</td>";
        output += "<td>" + team.goalsFor + "</td>";
        output += "<td>" + team.goalsAgainst + "</td>";
        output += "<td>" + team.goalDifference + "</td>";
        output += "<td>" + team.points + "</td>";
        output += "</tr>\n";
    });

    $("table > tbody").innerHTML = output;
}





function sortLeagueTable(teams) {
    var sortedTable = [];

    // REALLY ugly way to clone an object. Normally would use a library that's cleaner...
    var clonedTable = JSON.parse(JSON.stringify(teams));

    Object.keys(clonedTable).forEach(function(key) {
        sortedTable.push(clonedTable[key]);
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
// 2012 is a leap year, but 2011 isn't. We don't include Feb 2011 in our calculations
// So this doesn't matter. A non-trivial application would have to take this into account
function createDateRange() {
    var years = [2011, 2012];
    var monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    var ISODates = [];
    // Native forEach loops are cool
    years.forEach(function(year) {
        monthLengths.forEach(function(monthLength, monthNumber) {
            for (var monthDay = 0; monthDay < monthLength; monthDay++) {
                // All the month related stuff is zero indexed. Have to add 1 for display to humans
                ISODates.push(year + "-" + pad(monthNumber + 1) + "-" + pad(monthDay + 1))
            };
        });
    });

    // We only need August 12th, 2011 - May 13th, 2012
    return ISODates.slice(224,500);
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
}



// gives a nice jQuery-like way of selecting things
function $(expr) {
    return document.querySelectorAll(expr)[0];
}


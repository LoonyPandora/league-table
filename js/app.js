// Trivial app, but it's always good to be strict
"use strict";

// All DOM stuff should wait until we have a DOM
window.onload = function () {
    
    
    bootstrap();

    $("button").onclick = startAnimation;
}

// Sets up the table in it's initial state
function bootstrap() {
    var initialTable = [];
    for (var i = 1; i < 21; i++) {
        initialTable.push(teams[i]);
    };

    // Sort the table alphabetically
    // That's how it's always sorted on the first day of the season
    initialTable.sort(function(a,b){
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    })

    updateHTML(initialTable);
}


function startAnimation() {
    // Make sure we can't set it running twice!
    this.disabled = true;
    this.innerText = "Animation Running"

    var allDates = createDateRange();

    var tablesByDate = playGames();
    var gameDates = Object.keys(tablesByDate);

    // We update the header every day, but not every day has a match on it
    var i = 0;
    var interval = setInterval(function() {
        var j = gameDates.indexOf( allDates[i] );
        if (j !== -1) {
            // Today's date is a match day, so update the table
            updateHTML( tablesByDate[gameDates[j]] );
        } else {
            // Fade out the positional marker since it's not a match day
            // and the movement is irrelevant
            var elems = $(".up, .down");
            for (var x = 0; x < elems.length; x++) {
                if (elems[x].className.match(/up/)) {
                    elems[x].className = "animated fadeOutUpColor";
                } else {
                    elems[x].className = "animated fadeOutDownColor";
                }
                
            };
        }

        $("h1").innerText = allDates[i];
        i++;

        // 276 days from start to end of the season
        if (i === 276) clearInterval(interval);
    }, 250);
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

        if (!games[game.date]) { games[game.date] = []; }
        
        // The goals are a string instead of a numeric for some reason.
        // Probably as a potential gotcha in this test..
        games[game.date].push({
            date:       game.date,
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
        var classList = "";
        if (team.movement == "up") {
            classList = "animated fadeInUp up";
        } else if (team.movement == "down") {
            classList = "animated fadeInDown down";
        }

        output += '<tr class="' + classList + '">';
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

// Gives us a nice list of dates for 2011 and 2012
// 2012 is a leap year, but 2011 isn't. We don't include Feb 2011 in our calculations
// So this doesn't matter. A non-trivial application would have to take this into account
function createDateRange() {
    var years = [11, 12];
    var monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    var dates = [];
    // Native forEach loops are cool
    years.forEach(function(year) {
        monthLengths.forEach(function(monthLength, monthNumber) {
            for (var monthDay = 0; monthDay < monthLength; monthDay++) {
                // All the month related stuff is zero indexed. Have to add 1 for display to humans
                dates.push( pad(monthDay + 1) + "/" + pad(monthNumber + 1) + "/" + year)
            };
        });
    });

    // We only need August 12th, 2011 - May 13th, 2012
    return dates.slice(224,500);
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
    if (document.querySelectorAll(expr).length === 1) {
        return document.querySelectorAll(expr)[0];
    } else {
        return document.querySelectorAll(expr);
    }
    
}


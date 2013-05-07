// Trivial app, but it's always good to be strict
"use strict";

// All DOM stuff should wait until we have a DOM
// NOT doing this may improve performance, but it would be a premature
// optimization at this stage with such a trivial app and no performance issues
window.onload = function () {

}



function loadTeams(teams) {
    console.log(teams);
};

function loadGames(games) {
    console.log(games);
};

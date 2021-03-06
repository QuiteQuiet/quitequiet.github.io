var hasBeenUsed = [];
toId = function(thing) {
	return thing.replace(/[^A-Za-z0-9]/g,'').toLowerCase();
};
legalToUse = function(poke, team) {
	var passes = true;
	var hasMega = false;
	var isMega = false;
	for (var i = 0; i < team.length; i++) {
		if (Pokedex[poke]['num'] === Pokedex[team[i]]['num'])
			passes = false;
		if (Pokedex[team[i]]['name'].indexOf('-Mega') >= 0)
			hasMega = true;
	}
	if (Pokedex[poke]['name'].indexOf('-Mega') >= 0) isMega = true;
	if (hasMega && isMega) passes = false;
	return passes;
};
crossOut = function(button) {
	var name = button.innerHTML;
	var used = document.getElementById('use-container');
	for (var i = 0; i < used.children.length; i++) {
		if (used.children[i].textContent === name) {
			used.children[i].innerHTML = '<strike class="dead">' + name + '</strike>';
			break;
		}
	}
	button.className = 'team-dead';
	button.disabled = true;
};
acceptableWeakness = function(team) {
	if (team.length === 0) return false;
	var comp = {};
	for (var t in Types)
		comp[t] = {'weak':0,'res':0};
	for (var i = 0; i < team.length; i++) {
		var poke = team[i];
		var types = Pokedex[poke]['types'];

		if (types.length > 1) {
			for (var t in Types) {
				var eff = Types[types[0]][t] * Types[types[1]][t];
				if (eff > 1)
					comp[t]['weak']++;
				if (eff < 1)
					comp[t]['res']++;
			}
		} else {
			for (var t in Types) {
				if (Types[types[0]][t] > 1)
					comp[t]['weak']++;
				if (Types[types[0]][t] < 1)
					comp[t]['res']++;
			}
		}
	}
	for (var m in comp) {
		if (comp[m]['weak'] >= 3)
			return false;
		if (comp[m]['weak'] >= 2 && comp[m]['res'] <= 1)
			return false;
	}
	return true;
};
getPokemon = function(tier) {
	var canPick = Object.keys(Tiers[tier]);
	for (var i = 0; i < hasBeenUsed.length; i++) {
		var index = canPick.indexOf(hasBeenUsed[i]);
		if (index >= 0)
			canPick.splice(index, 1);
	}
	return canPick[canPick.length * Math.random() << 0];
};
refillTeam = function(button, tier) {
	var curTeam = [];
	var hasMega = false;
	var lookAt = button.previousElementSibling;

	while (lookAt) {
		if (!lookAt.disabled) {
			var poke = toId(lookAt.textContent);
			if (Pokedex[poke]['name'].indexOf('-Mega') >= 0) hasMega = true;
			curTeam.push(poke);
			lookAt.disabled = true;
		}
		lookAt = lookAt.previousElementSibling;
	}
	while (curTeam.length < 6) {
		var poke = toId(getPokemon(tier));
		if (!legalToUse(poke, curTeam)) continue;
		curTeam.push(poke);
	}
	button.disabled = true;
	document.getElementById('output').innerHTML += makeOutput(curTeam);
};
makeOutput = function(team) {
	// Log the picked pokemon as well as
	// make the output pretty
	var result = '<p id="team-list">New team: ';
	var used = document.getElementById('use-container');
	for (var i = 0; i < team.length; i++) {
		result += '<button class="team-alive" onclick="crossOut(this);">' + Pokedex[team[i]]['name'] + '</button>';
		if (i < 5) result += ' / ';
		// Show used Pokemon
		var inList = false;
		for (var j = 0; j < used.children.length; j++)
			if (used.children[j].textContent === Pokedex[team[i]]['name'])
				inList = true;
		if (!inList) used.innerHTML += '<p id="used">' + Pokedex[team[i]]['name'] + '</p>';
		// Save which pokemon have been used
		hasBeenUsed.push(Pokedex[team[i]]['name']);
	}
	result += '<button id="refill" onclick="refillTeam(this, document.getElementById(\'tiers\').value);">Refill team</button></p>';
	return result;
};
get = function(amount, tier) {
	if (amount < 6) {
		var picks = [];
		for (var i = 0; i < amount; i++) {
			var mon = getPokemon(tier);
			picks.push(toId(mon));
			hasBeenUsed.push(mon);
		}
		return picks;
	} else {
		var team = [];
		var hasMega = false;
		var attempts = 0;
		// Make a team
		while (team.length < 6 || !acceptableWeakness(team)) {
			var poke = toId(getPokemon(tier));

			if (!legalToUse(poke, team)) continue;

			team.push(poke);
			// Only test team weakness for the first 100 attempts
			// After that, just fill the team and hope it isn't super-weak
			// to something common.
			if (attempts <= 100) {
				if (!acceptableWeakness(team))
					team.splice(team.indexOf(poke), 1); // Remove the Pokemon again
				attempts++;
			} else {
				if (team.length == 6)
					break;
			}

		}
		return team;
	}
};
getNew = function(tier) {
	team = get(6, tier);
	document.getElementById('output').innerHTML += makeOutput(team);
	document.getElementById('new-team').disabled = true;
};
getOne = function(tier) {
	document.getElementById('output').innerHTML += '<p>New Pokemon: ' + getPokemon(tier) + '</p>';
};

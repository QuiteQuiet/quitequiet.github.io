toId = function(thing) {
	return thing.replace(/[^A-Za-z0-9]/g,'').toLowerCase();
}
getPokemon = function(tier) {
	var canPick = Object.keys(Tiers[tier]);
	return canPick[canPick.length * Math.random() << 0];
};

acceptableWeakness = function(team) {
	if (team.length === 0) return false;
	var comp = {};
	for (var t in Types)
		comp[t] = {'weak':0,'res':0};
	for (i = 0; i < team.length; i++) {
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

get = function(amount, tier) {
	var result = '';
	if (amount == 1) {
		result = '<p>New Pokemon: ' + getPokemon(tier) + '</p>';
	} else {
		var team = [];
		var hasMega = false;
		var attempts = 0;
		result = '<p>New team: '
		// make a team
		while (team.length < 6 || !acceptableWeakness(team)) {
			var passes = true;
			var isMega = false;
			var poke = toId(getPokemon(tier));

			for (i = 0; i < team.length; i++)
				if (Pokedex[poke]['num'] === Pokedex[team[i]]['num'])
					passes = false;
			if (Pokedex[poke]['species'].indexOf('-Mega') >= 0) isMega = true;
			if (hasMega && isMega) passes = false;

			if (!passes) continue;

			team.push(poke);
			if (!acceptableWeakness(team))
				team.splice(team.indexOf(poke), 1); // Remove the Pokemon again
			if (isMega && team.indexOf(poke) >= 0)
				hasMega = true;
			attempts++;

			// If the generation isn't done in 100 tries, just fill the
			// rest of the team and exit. It would probably be a bad team
			// anyway...
			if (attempts > 100)
				while (team.length < 6)
					team.push(toId(getPokemon(tier)));
		}
		// Make the output pretty
		for (i = 0; i < team.length; i++) {
			result += Pokedex[team[i]]['species']
			if (i < 5) result += ' / ';
		}
		result += '</p>';
	}
	to = document.getElementById('output');
	to.innerHTML += result;
};
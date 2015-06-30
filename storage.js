// Anything storage related goes here
clearEverything = function() {
	document.getElementById('use-container').innerHTML = '<h4>Pokemon used:</h4>';
	document.getElementById('output').innerHTML = '';
	localStorage.removeItem('ps_nuzlocke_data');
	hasBeenUsed = [];
	document.getElementById('new-team').disabled = false;
};
window.onload = function() {
	var data = localStorage.getItem('ps_nuzlocke_data');
	if (data === null)
		return;
	data = JSON.parse(data);
	var team = '<p>Current Pokemon: ';
	var used = '';
	for (var i = 0; i < data['dead'].length; i++) {
		used += '<p id="used"><strike class="dead">' + data['dead'][i] + '</strike></p>';
		hasBeenUsed.push(data['dead'][i]);
	}
	for (i = 0; i < data['team'].length; i++) {
		team += '<button class="team-alive" onclick="crossOut(this);">';
		team += data['team'][i] + '</button>';
		team += (i < (data['team'].length - 1) ? ' / ' : ' <button id="refill" onclick="refillTeam(this, document.getElementById(\'tiers\').value);">Refill team</button></p>');
		used += '<p id="used">' + data['team'][i] + '</p>';
		hasBeenUsed.push(data['team'][i]);
	}
	document.getElementById('output').innerHTML += team;
	document.getElementById('use-container').innerHTML += used;
};
window.onbeforeunload = function() {
	var pokemonList = document.getElementById('use-container').children;
	if (!pokemonList.length)
		return;
	var storeData = {'team':[],'dead':[]};
	// Loop through everything and get the Pokemon, but
	// skip element 0 as it will always? be a <h4> tag with
	// no relevant information.
	for (var i = 1; i < pokemonList.length; i++) {
		var item = pokemonList[i];
		storeData[(item.children.length > 0 ? 'dead' : 'team')].push(item.textContent);
	}
	if (storeData['team'].length > 0)
		localStorage.setItem('ps_nuzlocke_data', JSON.stringify(storeData));
	else
		localStorage.removeItem('ps_nuzlocke_data');
};
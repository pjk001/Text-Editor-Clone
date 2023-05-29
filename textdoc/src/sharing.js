export function makeWriter(roles, user){
	if(roles[user] == "owner"){return false;}
	roles[user] = "writer";
	return true;
}

export function makeReader(roles, user){
	if(roles[user] == "owner"){return false;}
	roles[user] = "reader";
	return true;
}

export function removeAccess(roles, user){
	if(roles[user] == "owner"){return false;}
	if(!(user in roles)){return false;}
	delete roles[user];
	return true;
}

export function changeOwner(roles, user){
	const owner = Object.keys(roles).find(key => roles[key] === "owner");
	delete roles[owner];
	roles[user] = "owner";
	return true;
}
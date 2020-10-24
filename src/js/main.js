// Containers
const overviewContainer = document.querySelector("#overviewContainer");
const graphContainer = document.querySelector("#graphContainer");
const matrixContainer = document.querySelector("#matrixContainer");
const detailViewContainer = document.querySelector("#detailViewContainer");
const radarChartContainer = document.querySelector("#radarChartContainer");
const violinPlotContainer = document.querySelector("#violinPlotContainerD3");
const dotMatrix1Container = document.querySelector("#dotMatrix1ContainerD3");
const dotMatrix2Container = document.querySelector("#dotMatrix2ContainerD3");
const quantitativePCPContainer = document.querySelector("#quantitativePCPContainer");
const differentialPCPContainer = document.querySelector("#differentialPCPContainer");
const filterModal = document.querySelector("#filterModal");
const helpModal = document.querySelector("#helpModal");

// Icons
const iconMode = document.querySelector("#iconMode");
const iconYear = document.querySelector("#iconYear");

// Toolbar Buttons
const toolbarButtonUser = document.querySelector("#toolbarButtonUser");
const toolbarButtonMode = document.querySelector("#toolbarButtonMode");
const toolbarButtonFilter = document.querySelector("#toolbarButtonFilter");
const toolbarButtonYear = document.querySelector("#toolbarButtonYear");
const toolbarButtonHelp = document.querySelector("#toolbarButtonHelp");

// Checkboxes
const isOriginal = document.querySelector("#isOriginal");
const isInfluential = document.querySelector("#isInfluential");

// Radio buttons
const showFollowers = document.querySelector("#showFollowers");
const showFriends = document.querySelector("#showFriends");

// Selections
const violinPlotSelect = document.querySelector("#violinPlotSelect");
const yearSelect = document.querySelector("#yearSelect");

// Global Variables
let overviewMode = "graph";
let view = "overview";
let year = "2018";

// socket for connecting to the server
let socket = io.connect("http://localhost:4000");
//let socket = io.connect("http://169.254.37.46:4000");

// selected users
let user1 = 12014302;
let user2 = 17268874;

// node link filters
let getFollowedByFilter = true;
let isFollowingFilter = false;

// filter constraints
let currentConstraints = {
	value: {
		followers: [0, 0],
		friends: [0, 0],
		tweets: [0, 0],
		likes: [0, 0],
	},
	difference: {
		followers: [0, 0],
		friends: [0, 0],
		tweets: [0, 0],
		likes: [0, 0],
	},
}

let originalConstraints = {
	value: {
		followers: [0, 0],
		friends: [0, 0],
		tweets: [0, 0],
		likes: [0, 0],
	},
	difference: {
		followers: [0, 0],
		friends: [0, 0],
		tweets: [0, 0],
		likes: [0, 0],
	},
}

// Info Fields
const infoUser1Picture = document.querySelector("#infoUser1Picture");
const infoUser1Name = document.querySelector("#infoUser1Name");
const infoUser1Followers = document.querySelector("#infoUser1Followers");
const infoUser1Friends = document.querySelector("#infoUser1Friends");
const infoUser1Likes = document.querySelector("#infoUser1Likes");
const infoUser1Tweets = document.querySelector("#infoUser1Tweets");

const infoUser2Picture = document.querySelector("#infoUser2Picture");
const infoUser2Name = document.querySelector("#infoUser2Name");
const infoUser2Followers = document.querySelector("#infoUser2Followers");
const infoUser2Friends = document.querySelector("#infoUser2Friends");
const infoUser2Likes = document.querySelector("#infoUser2Likes");
const infoUser2Tweets = document.querySelector("#infoUser2Tweets");

console.log("ich bin Index");

socket.emit("register", {
	handle: 'indexHTML'
});

d3.json("data/filtered_data_friendsCount_2019.json").then(data2019 => {
	d3.json("data/filtered_data_friendsCount_2018.json").then(data2018 => {

		initDataTable(data2019.nodes.find(d => d.id == user1),
			data2019.nodes.find(d => d.id == user2));
		initTouch();
		initToolbar();
		initListeners();

		// data.nodes.forEach(user => checkConnections(data, user.id));
		let currentDataset = year == "2018" ? data2018 : data2019;

		let followers = [
			currentDataset.nodes.map(d => d.followers_count),
			data2019.nodes.map(d => {
				let user2018 = data2018.nodes.find(e => e.id == d.id);
				if (user2018) {
					return d.followers_count / user2018.followers_count - 1;
				} else {
					return 0;
				}
			}),
		]
		let friends = [
			currentDataset.nodes.map(d => d.friends_count),
			data2019.nodes.map(d => {
				let user2018 = data2018.nodes.find(e => e.id == d.id);
				if (user2018) {
					return d.friends_count / user2018.friends_count - 1;
				} else {
					return 0;
				}
			}),
		]
		let likes = [
			currentDataset.nodes.map(d => d.favourites_count),
			data2019.nodes.map(d => {
				let user2018 = data2018.nodes.find(e => e.id == d.id);
				if (user2018) {
					return d.favourites_count / user2018.favourites_count - 1;
				} else {
					return 0;
				}
			}),
		]
		let tweets = [
			currentDataset.nodes.map(d => d.statuses_count),
			data2019.nodes.map(d => {
				let user2018 = data2018.nodes.find(e => e.id == d.id);
				if (user2018) {
					return d.statuses_count / user2018.statuses_count - 1;
				} else {
					return 0;
				}
			}),
		]

		initConstraints(followers, friends, likes, tweets);
	})
})

/**
 * Analyzes a given node's (user's) connections and categorizes them.
 * 
 * @param selectID node ID
 * @returns Array of nodes in the dataset excluding the selected one with a
 * type attribute representing their connection type
 */
function checkConnections(dataset, selectID) {

	let users = dataset.nodes;
	let links = dataset.links;

	// Filter all users with a connection that targets the selected user, meaning users that follow the selected user.
	let followingUsers = links.filter(link => link.target == selectID).map(link => {
		let followingUser = users.find(node => node.id == link.source);
		followingUser.type = "followers";
		return followingUser;
	});

	// Filter all users with a connection originating from the selected user, meaning users followed by the selected user.
	let friendUsers = links.filter(link => link.source == selectID).map(link => {
		let friendUser = users.find(node => node.id == link.target);
		friendUser.type = "friends";
		return friendUser;
	});

	let bothUsers = [];

	// Filter all users that are both following and followed by the selected user, indicating a bidirectional connection. Remove these users from the "followingUsers" and "friendUsers".
	followingUsers.forEach((followingUser, i) => {
		friendUsers.forEach((friendUser, l) => {

			if (friendUser.id == followingUser.id) {
				bothUsers.push(users.find(user => user.id == followingUser.id));
				followingUsers.splice(i, 1);
				friendUsers.splice(l, 1);
			}
		})
	})

	bothUsers = bothUsers.map(bothUser => {
		bothUser.type = "both";
		return bothUser;
	});

	// Filter all users that are neither following nor followed by the selected user, indicating no present connection.
	let noneUsers = users.map(user => user.id).filter(userID => (
		followingUsers.find(followingUser => followingUser.id == userID) === undefined &&
		friendUsers.find(friendUser => friendUser.id == userID) === undefined &&
		bothUsers.find(bothUser => bothUser.id == userID) === undefined)
	).map(userID => {
		let noneUser = users.find(node => node.id == userID);
		noneUser.type = "none";
		return noneUser;
	});

	// I don't know why this filter is necessary. Somehow nodes of the wrong type mixed into another array.
	followingUsers = followingUsers.filter(d => d.type == "followers");
	friendUsers = friendUsers.filter(d => d.type == "friends");

	let allConnections = followingUsers.concat(friendUsers, bothUsers, noneUsers);
	return allConnections;
}


/**
 * Configures the visible connections in the graph, by setting the respective 
 * filters.
 * 
 * @param {boolean} followers whether the followers filter should be active  
 * @param {boolean} friends whether the friends filter should be active  
 */
function setConnectionMode(followers, friends) {
	getFollowedByFilter = followers;
	isFollowingFilter = friends;
}

/**
 * Returns all nodes, that match the filter criteria, set in the filter modal.
 */
function getFilteredNodes() {
	let filterOriginal = document.querySelector("input[name=isOriginal]:checked").value;
	let filterInfluential = document.querySelector("input[name=isInfluential]:checked").value;

	d3.json("data/filtered_data_friendsCount_2019.json").then(data2019 => {
		d3.json("data/filtered_data_friendsCount_2018.json").then(data2018 => {
			function applyFilters(d) {

				// Check compliance with filters for "original" and 
				// "influential" status

				let qualitativeFilter = () => {
					passOriginal = false;
					passInfluential = false;
					if (filterOriginal == "originalMaybe"
						&& filterInfluential == "influentialMaybe") {
						return true;
					}
					if (filterOriginal == "originalYes"
						&& d.original == true) {
						passOriginal = true;
					}
					if (filterOriginal == "originalNo"
						&& d.original == false) {
						passOriginal = true;
					}
					if (filterOriginal == "originalMaybe") {
						passOriginal = true;
					}
					if (filterInfluential == "influentialYes"
						&& d.influential == true) {
						passInfluential = true;
					}
					if (filterInfluential == "influentialNo"
						&& d.influential == false) {
						passInfluential = true;
					}
					if (filterInfluential == "influentialMaybe") {
						passInfluential = true;
					}

					return passOriginal && passInfluential;
				};

				// Check compliance with range filters for quantitative values
				let quantitativeFilter =
					(currentConstraints.value.followers[0] <= d.followers_count
						&& d.followers_count <= currentConstraints.value.followers[1])
					&& (currentConstraints.value.friends[0] <= d.friends_count
						&& d.friends_count <= currentConstraints.value.friends[1])
					&& (currentConstraints.value.likes[0] <= d.favourites_count
						&& d.favourites_count <= currentConstraints.value.likes[1])
					&& (currentConstraints.value.tweets[0] <= d.statuses_count
						&& d.statuses_count <= currentConstraints.value.tweets[1])


				// Check compliance with magnitude filters, concerning the 
				// growth or decline of quantitative values
				let differentialFilter = () => {
					let user2018 = data2018.nodes.find(u => u.id == d.id)
					let user2019 = data2019.nodes.find(u => u.id == d.id)
					if (user2018 && user2019) {
						let followersGrowth = (user2019.followers_count / user2018.followers_count - 1);

						let friendsGrowth = (user2019.friends_count / user2018.friends_count - 1);

						let favouritesGrowth = (user2019.favourites_count / user2018.favourites_count - 1);

						let statusesGrowth = (user2019.statuses_count / user2018.statuses_count - 1);

						return (
							(
								currentConstraints.difference.followers[0] <= followersGrowth
								&& followersGrowth <= currentConstraints.difference.followers[1]
							) && (
								currentConstraints.difference.friends[0] <= friendsGrowth
								&& friendsGrowth <= currentConstraints.difference.friends[1]
							) && (
								currentConstraints.difference.likes[0] <= favouritesGrowth
								&& favouritesGrowth <= currentConstraints.difference.likes[1]
							) && (
								currentConstraints.difference.tweets[0] <= statusesGrowth
								&& statusesGrowth <= currentConstraints.difference.tweets[1]
							)
						)
					} else {
						return year == "2018-19" ? true : year == d.year_data;
					}
				}

				return qualitativeFilter() && quantitativeFilter && differentialFilter();
			}

			let filteredNodes;
			if (year == "2018") {
				filteredNodes = data2018.nodes.filter(d => applyFilters(d));
			} else if (year == "2019") {
				filteredNodes = data2019.nodes.filter(d => applyFilters(d));
			} else if (year == "2018-19") {
				filteredNodes = data2019.nodes.filter(d => applyFilters(d));
			}
			console.log(data2018, data2019);
			graphContainer.dispatchEvent(
				new CustomEvent("filters-changed", { detail: filteredNodes })
			);
		})
	})
}

/**
 * Toggle visibility of view containers to switch between overview 
 * and detail view mode.
 */
function toggleView() {
	if (view === "overview") {
		overviewContainer.style.display = "none";
		detailViewContainer.style.display = "grid";

		if (radarChartContainer.children.length === 0) {
			socket.on('UserID', function (data) {
				console.log("something recieved");
				let x_id = data.x_id,
					y_id = data.y_id;
				console.log("x_id: ", x_id);
				console.log("y_id: ", y_id);
				let user1 = y_id;
				let user2 = x_id;
				drawRC(radarChartContainer, user1, user2);
			});

			socket.on('single_y_UserID', function (data) {
				console.log("something recieved for y");
				let y_id = data.y_id;
				let user1 = y_id;
				drawRC(radarChartContainer, user1, user2);
			});

			socket.on('single_x_UserID', function (data) {
				console.log("something recieved for x");
				let x_id = data.x_id;
				let user2 = x_id;
				drawRC(radarChartContainer, user1, user2);
			});
			drawRC(radarChartContainer, user1, user2);
		}

		socket.on('UserID', function (data) {
			console.log("something recieved");
			let x_id = data.x_id,
				y_id = data.y_id;
			console.log("x_id: ", x_id);
			console.log("y_id: ", y_id);
			let user1 = y_id;
			let user2 = x_id;

			drawVP(violinPlotContainer, user1, user2, violinPlotSelect.value);
		});

		socket.on('single_y_UserID', function (data) {
			console.log("something recieved for y");
			let y_id = data.y_id;
			let user1 = y_id;
			drawVP(violinPlotContainer, user1, user2, violinPlotSelect.value);
		});

		socket.on('single_x_UserID', function (data) {
			console.log("something recieved for x");
			let x_id = data.x_id;
			let user2 = x_id;
			drawVP(violinPlotContainer, user1, user2, violinPlotSelect.value);
		});

		drawVP(violinPlotContainer, user1, user2, violinPlotSelect.value);

		if (dotMatrix1Container.children.length === 0) {
			socket.on('UserID', function (data) {
				console.log("something recieved");
				let x_id = data.x_id,
					y_id = data.y_id;
				console.log("x_id: ", x_id);
				console.log("y_id: ", y_id);
				let user1 = y_id;
				let user2 = x_id;

				drawDM(dotMatrix1Container, user1);
			});

			socket.on('single_y_UserID', function (data) {
				console.log("something recieved for y");
				let y_id = data.y_id;
				let user1 = y_id;
				drawDM(dotMatrix1Container, user1);
			});


			drawDM(dotMatrix1Container, user1);
		}

		if (dotMatrix2Container.children.length === 0) {
			socket.on('UserID', function (data) {
				console.log("something recieved");
				let x_id = data.x_id,
					y_id = data.y_id;
				console.log("x_id: ", x_id);
				console.log("y_id: ", y_id);
				let user1 = y_id;
				let user2 = x_id;

				drawDM(dotMatrix2Container, user2);
			});

			socket.on('single_x_UserID', function (data) {
				console.log("something recieved for x");
				let x_id = data.x_id;
				let user2 = x_id;
				drawDM(dotMatrix2Container, user2);
			});

			drawDM(dotMatrix2Container, user2);
		}
		view = "detail";
	} else if (view === "detail") {
		detailViewContainer.style.display = "none";
		overviewContainer.style.display = "block";
		view = "overview";
	}
}

/**
 * Toggle visibility of overview chart containers to switch between graph 
 * and matrix mode.
 */
function toggleMode() {
	if (overviewMode === "graph") {
		matrixContainer.style.display = "flex";
		graphContainer.style.display = "none";
		overviewMode = "matrix";
		iconMode.src = "img/hash.svg";
	} else if (overviewMode === "matrix") {
		matrixContainer.style.display = "none";
		graphContainer.style.display = "flex";
		overviewMode = "graph";
		iconMode.src = "img/git-branch.svg";
	}
}

/**
 * Switch between years, to be displayed in overview graph mode.
 * 
 * @param {Number} direction 
 */
function rotateYear(direction) {
	if (direction == 1 || direction == -1) {
		let years = ["2018", "2019", "2018-19"];
		let currentYear = years.findIndex((d, i) => d == year);

		year = years[(currentYear + direction + 3) % 3];
		iconYear.className = "year-" + year;

		toggleYearIndicator();

		graphContainer.dispatchEvent(new CustomEvent("year-changed", { detail: year }))

		drawPCP(quantitativePCPContainer, user1, user2, "value");
		drawPCP(differentialPCPContainer, user1, user2, "difference");
	}
}

/**
 * Sets the year, whose data is currently displayed.
 * 
 * @param {String} inputYear new year to be set 
 */
function setYear(inputYear) {
	year = inputYear;
	iconYear.className = "year-" + year;

	toggleYearIndicator();
	toggleYearModal();

	graphContainer.dispatchEvent(new CustomEvent("year-changed", { detail: year }))

	drawPCP(quantitativePCPContainer, user1, user2, "value");
	drawPCP(differentialPCPContainer, user1, user2, "difference");
}

/**
 * Shows overlay with currently displayed year. 
 * Triggers a "year-changed" event for the overview visualizations.
 * Hides overlay after a set interval.
 */
function toggleYearIndicator() {
	d3.select("#yearIndicator")
		.style("top", iconYear.offsetTop + "px")
		.transition()
		.style("right", "66px")
		.text(year);

	let timer = d3.timer(() => {
		d3.select("#yearIndicator")
			.transition()
			.style("right", "-1200px");
		timer.stop();
	}, 3000);
}

/**
 * Shows overlay with year selection.
 */
function toggleYearModal() {
	if (d3.select("#yearModal").style("right") == "-1200px") {
		d3.select("#yearModal")
			.style("top", iconYear.offsetTop + "px")
			.transition()
			.style("right", "66px");
	} else {
		d3.select("#yearModal")
			.transition()
			.style("right", "-1200px");
	}
}

/**
 * Toggle visibility of the filter overlay in overview mode. 
 */
function toggleFilterModal() {
	/*
		if (Adj_zIndex_changer == true){
			Adj_zIndex_changer = false;
			document.getElementById("order").style.zIndex = "0";
		}
		setTimeout(function() {
			zIndex_changer = true;
		}, 10000);
		*/


	let style = filterModal.style;

	if (style.display == "flex") {
		getFilteredNodes();
		style.display = "none";
		document.getElementById("order").style.zIndex = "1";
	} else {
		style.display = "flex"

		drawPCP(quantitativePCPContainer, user1, user2, "value");
		drawPCP(differentialPCPContainer, user1, user2, "difference");
	}
}

/**
* Toggle visibility of the filter overlay in overview mode. 
*/
function toggleHelpModal() {

	let style = helpModal.style;

	if (style.display == "grid") {
		style.display = "none";
	} else {
		style.display = "grid"
	}
}

/* Initialization functions */

/**
 * Adds profile information to the detail view.
 * 
 * @param {object} user a twitter user  
 */
function initDataTable(u1, u2) {
	infoUser1Name.innerHTML = u1.screen_name;
	infoUser1Picture.src = u1.profile_image_url;
	infoUser1Picture.onerror = () => {
		infoUser1Picture.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";
	};
	infoUser1Followers.innerHTML = u1.followers_count;
	infoUser1Friends.innerHTML = u1.friends_count;
	infoUser1Likes.innerHTML = u1.favourites_count;
	infoUser1Tweets.innerHTML = u1.statuses_count;

	infoUser2Name.innerHTML = u2.screen_name;
	infoUser2Picture.src = u2.profile_image_url;
	infoUser2Followers.innerHTML = u2.followers_count;
	infoUser2Friends.innerHTML = u2.friends_count;
	infoUser2Likes.innerHTML = u2.favourites_count;
	infoUser2Tweets.innerHTML = u2.statuses_count;
}

/**
 * Add event listeners elements.
 */
function initListeners() {
	showFollowers.addEventListener("change", () => {
		setConnectionMode(true, false);
	});
	showFriends.addEventListener("change", () => {
		setConnectionMode(false, true);
	});

	violinPlotSelect.addEventListener("change", () => {
		drawVP(violinPlotContainer, user1, user2, violinPlotSelect.value);
	})

	yearSelect.addEventListener("change", () => {
		setYear(yearSelect.value);
	})
}

/**
 * Initialize the constraints object.
 * 
 * @param {Array} followers 
 * @param {Array} friends 
 * @param {Array} likes 
 * @param {Array} tweets 
 */
function initConstraints(followers, friends, likes, tweets) {
	currentConstraints.value.followers = [d3.min(followers[0]), d3.max(followers[0])];
	currentConstraints.value.friends = [d3.min(friends[0]), d3.max(friends[0])];
	currentConstraints.value.likes = [d3.min(likes[0]), d3.max(likes[0])];
	currentConstraints.value.tweets = [d3.min(tweets[0]), d3.max(tweets[0])];

	currentConstraints.difference.followers = [d3.min(followers[1]), d3.max(followers[1])];
	currentConstraints.difference.friends = [d3.min(friends[1]), d3.max(friends[1])];
	currentConstraints.difference.likes = [d3.min(likes[1]), d3.max(likes[1])];
	currentConstraints.difference.tweets = [d3.min(tweets[1]), d3.max(tweets[1])];

	originalConstraints = JSON.parse(JSON.stringify(currentConstraints));
}

/**
 * Resets constraints to original values.
 */
function resetConstraints(mode, dimension) {
	if (dimension) {
		currentConstraints[mode][dimension][0] = originalConstraints[mode][dimension][0];
		currentConstraints[mode][dimension][1] = originalConstraints[mode][dimension][1];
	} else {
		currentConstraints = JSON.parse(JSON.stringify(originalConstraints));
	}

}

/**
 * Configure and add touch events to different views or elements.
 */
function initTouch() {
	function eventLog(e) {
		console.log(`Event "${e.type}" on target "${e.target.tagName}"`);
	}

	const configSwipeHorizontal = {
		event: "swipe-horizontal",
		pointers: 3,
		direction: Hammer.DIRECTION_HORIZONTAL
	}
	const configSwipeVertical = {
		event: "swipe-vertical",
		pointers: 3,
		direction: Hammer.DIRECTION_VERTICAL
	}

	// Node Link Diagram
	const graphManager = new Hammer.Manager(graphContainer);
	graphManager.add(new Hammer.Swipe(configSwipeHorizontal));
	graphManager.add(new Hammer.Swipe(configSwipeVertical));
	graphManager.on("swipe-vertical", () => rotateYear(1));
	graphManager.on("swipe-horizontal", () => toggleMode());
	graphManager.get("swipe-horizontal").requireFailure("swipe-vertical");

	// Adjacency Matrix
	const matrixManager = new Hammer.Manager(matrixContainer);
	matrixManager.add(new Hammer.Swipe(configSwipeHorizontal));
	matrixManager.on("swipe-horizontal", () => toggleMode());
}

/**
 * Add click events to toolbar buttons.
 */
function initToolbar() {
	// Toolbar Events
	toolbarButtonFilter.onclick = () => toggleFilterModal();
	toolbarButtonYear.onclick = () => toggleYearModal();
	toolbarButtonMode.onclick = () => toggleMode();
	toolbarButtonUser.onclick = () => toggleView();
	toolbarButtonHelp.onclick = () => toggleHelpModal();
}

drawNL();
drawAM();

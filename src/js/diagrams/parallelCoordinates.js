function drawPCP(container, u1, u2, mode) {
	d3.select("#" + container.id + " svg").remove();

	const margin = { top: 20, right: 30, bottom: 20, left: 50 },
		width = container.clientWidth - margin.left - margin.right,
		height = container.clientHeight - margin.top - margin.bottom;

	let x = d3.scalePoint().range([0, width]),
		y = {},
		dragging = {};

	const line = d3.line(),
		axis = d3.axisLeft();

	let dimensions = [];
	let foreground;
	let background;

	const svg = d3
		//.select("svg").remove()
		.select("#" + container.id)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr(
			"transform",
			"translate(" + margin.left + "," + margin.top + ")"
		);

	d3.json("data/filtered_data_friendsCount_2019.json").then(
		(data2019) => {
			d3.json("data/filtered_data_friendsCount_2018.json").then(
				(data2018) => {
					let currentDataset = year == "2018" ? data2018 : data2019;

					let quantNodes = (dataset) => {
						if (mode === "value") {
							return dataset.nodes.map((d) => {
								let q = {};
								q.id = d.id;
								q.followers = d.followers_count;
								q.friends = d.friends_count;
								q.likes = d.favourites_count;
								q.tweets = d.statuses_count;
								return q;
							});
						} else if (mode === "difference") {
							return data2019.nodes.map((user2019) => {
								let user2018 = data2018.nodes.find(
									(d) => d.id === user2019.id
								);
								let q = {};
								if (user2018) {
									q.id = user2019.id;
									q.followers =
										user2019.followers_count /
										user2018.followers_count - 1;
									q.friends =
										user2019.friends_count /
										user2018.friends_count - 1;
									q.likes =
										user2019.favourites_count /
										user2018.favourites_count - 1;
									q.tweets =
										user2019.statuses_count /
										user2018.statuses_count - 1;
								}
								return q;
							});
						}
					};

					dimensions = d3
						.keys(quantNodes(currentDataset)[0])
						.filter((d) => {
							if (mode === "value") {
								return (
									d != "id" &&
									(y[d] = d3
										.scaleSymlog()
										.domain(
											d3.extent(
												quantNodes(currentDataset),
												(p) => p[d]
											)
										)
										.range([height, 0]))
								);
							} else if (mode === "difference") {
								return (
									d != "id" &&
									(y[d] = d3
										.scaleLinear()
										.domain(
											d3.extent(
												quantNodes(data2019),
												(p) => p[d]
											)
										)
										.range([height, 0]))
								);
							}
						});

					// Extract the list of dimensions and create a scale for each.
					x.domain(dimensions);

					// Add grey background lines for context.
					background = svg
						.append("g")
						.attr("class", "background")
						.selectAll("path")
						.data(quantNodes(currentDataset))
						.enter()
						.append("path")
						.attr("d", path);

					foreground = svg
						.append("g")
						.attr("class", "foreground")
						.selectAll("path")
						.data(quantNodes(currentDataset))
						.enter()
						.append("path")
						.attr("d", path);

					// Add a group element for each dimension.
					const g = svg
						.selectAll(".dimension")
						.data(dimensions)
						.enter()
						.append("g")
						.attr("id", (d) => `dimension-${d}-${mode}`)
						.attr("class", (d) => "dimension dimension-" + d)
						.attr(
							"transform",
							(d) => "translate(" + x(d) + ")"
						);

					// Add an axis and title.
					g.append("g")
						.attr("class", "axis")
						.each(function (d) {
							d3.select(this).call(
								axis
									.scale(y[d])
									.ticks(5)
									.tickFormat(d3.format(
										mode === "value"
											? ".2s"
											: "+~%")
									)
							)
						})
						.append("text")
						.style("text-anchor", "middle")
						.attr("y", -9)
						.text(d => d)

					if (mode === "value") {
						svg.append("g")
							.attr("class", "highlight pcp-users-old")
							.selectAll("path")
							.data(
								quantNodes(data2018)
									.filter(
										(d) => d.id == u1 || d.id == u2
									)
									.sort((a, b) => a.id - b.id)
							)
							.enter()
							.append("path")
							.attr("d", path);
					}

					svg.append("g")
						.attr("class", "highlight pcp-users-current")
						.selectAll("path")
						.data(
							quantNodes(data2019)
								.filter((d) => d.id == u1 || d.id == u2)
								.sort((a, b) => a.id - b.id)
						)
						.enter()
						.append("path")
						.attr("d", path);

					g.append("g")
						.attr("class", "brush")
						.each(function (d) {
							d3.select(this).call(
								y[d].brush = d3
									.brushY()
									.on("brush", () => brush(d))
									.on("end", () => brushend(d))
							)
							if (currentConstraints[mode][d][0] != originalConstraints[mode][d][0] || currentConstraints[mode][d][1] != originalConstraints[mode][d][1]) {
								console.log("selected");
								d3.select(this).call(
									y[d].brush.move,
									currentConstraints[mode][d].map(x =>
										y[d](x)).sort()
								);
							}
						})
						.selectAll(".brush > .selection")
						.attr("x", -8)
						.attr("width", 16)
						.each(function () {
							let rect = d3.select(this);
							let rHeight = Number(rect.attr("height"));
							let rY = Number(rect.attr("y"));
							if (rHeight < 0) {
								rect
									.attr("height", Math.abs(rHeight))
									.attr("y", rY + rHeight);
							}
						})
				}
			);
		}
	);

	// Handles a brush event, toggling the display of foreground lines.
	function brush(dimension) {
		let event = d3.event;

		d3.selectAll(".brush > rect")
			.attr("x", -8)
			.attr("width", 16);

		y[dimension].selection = event.selection;

		changeVisibility();
	}

	function brushend(dimension) {
		let event = d3.event;

		if (event.selection == null) {
			y[dimension].selection = null;
			changeVisibility();
			resetConstraints(mode, dimension);
		}

		if (event.selection) {
			currentConstraints[mode][dimension] = event.selection
				.sort((a, b) => b - a)
				.map(d => y[dimension].invert(d));
		}
	}

	function changeVisibility() {
		let actives = dimensions.filter(p => y[p].selection);

		let extents = actives.map(p => y[p].selection
			.sort((a, b) => b - a));

		foreground.style("opacity", d => {
			return actives.every((p, i) => {
				return (
					extents[i][0] >= y[p](d[p]) &&
					y[p](d[p]) >= extents[i][1]
				);
			})
				? 1
				: 0;
		});

		svg.selectAll(".highlight path").style("opacity", d => {
			return actives.every((p, i) => {
				return (
					extents[i][0] >= y[p](d[p]) &&
					y[p](d[p]) >= extents[i][1]
				);
			})
				? 1
				: 0.2;
		});
	}

	// Returns the path for a given data point.
	function path(d) {
		return line(dimensions.map((p) => [x(p), y[p](d[p])]));
	}
}

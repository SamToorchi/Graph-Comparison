function drawRC(container, u1, u2) {

    const margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = container.clientWidth - margin.left - margin.right,
        height = container.clientHeight - margin.top - margin.bottom;

    const centerX = width / 2;
    const centerY = height / 2;
    const length = d3.min([centerX, centerY]);

    const scaleLength = d3.scaleSymlog([0, length]);
    const scaleLengthReverse = d3.scaleSymlog([length, 0]);

    const scaleFollowers = d3.scaleSymlog([centerY, centerY - length])
    const scaleFriends2018 = scaleLengthReverse;
    const scaleFriends2019 = scaleLength;
    const scaleTweets2018 = scaleLengthReverse;
    const scaleTweets2019 = scaleLength;
    const scaleLikes = d3.scaleSymlog([centerY, centerY + length])

    const axisFollowers = d3.axisLeft(scaleFollowers);
    const axisFriends2018 = d3.axisBottom(scaleFriends2018);
    const axisFriends2019 = d3.axisBottom(scaleFriends2019);
    const axisTweets2018 = d3.axisBottom(scaleTweets2018);
    const axisTweets2019 = d3.axisBottom(scaleTweets2019);
    const axisLikes = d3.axisLeft(scaleLikes);

    d3.selectAll("#" + container.id + "> *").remove();

    const svg = d3
        .select("#" + container.id)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
        );

    const sectionText = d3.select("#" + container.id + "> svg")
        .append("g");

    sectionText
        .append("text")
        .text("2018")
        .attr("x", width / 4)
        .attr("y", height / 8)

    sectionText
        .append("text")
        .text("2019")
        .attr("x", 3 * width / 4)
        .attr("y", height / 8);

    d3.json("data/filtered_data_friendsCount_2018.json").then(data2018 => {
        d3.json("data/filtered_data_friendsCount_2019.json").then(data2019 => {

            let nodes = data2019.nodes.concat(data2018.nodes);

            scaleFollowers.domain(d3.extent(nodes, p => p.followers_count));
            scaleFriends2018.domain(d3.extent(nodes, p => p.friends_count));
            scaleFriends2019.domain(d3.extent(nodes, p => p.friends_count));
            scaleTweets2018.domain(d3.extent(nodes, p => p.statuses_count));
            scaleTweets2019.domain(d3.extent(nodes, p => p.statuses_count));
            scaleLikes.domain(d3.extent(nodes, p => p.favourites_count));

            const dimensions = [
                "followers",
                "friends2018",
                "friends2019",
                "tweets2018",
                "tweets2019",
                "likes"
            ];

            const axes = svg
                .selectAll(".dimension")
                .data(dimensions)
                .enter()
                .append("g")
                .attr("class", "dimension")

            axes
                .append("g")
                .attr("class", d => "axis axis-" + d);

            d3.select(".axis-followers")
                .call(axisFollowers.ticks(3).tickFormat(d3.format(".2s")))
                .attr("transform", "translate(" + centerX + ",0)")
                .append("text")
                .style("text-anchor", "start")
                .attr("x", 9)
                .attr("y", centerY - length)
                .text("followers");

            d3.select(".axis-friends2018")
                .call(axisFriends2018.ticks(3).tickFormat(d3.format(".2s")))
                .attr("transform", "translate(" + (centerX - Math.cos((30 * Math.PI) / 180) * length) + "," + (centerY - Math.sin((30 * Math.PI) / 180) * length) + ") rotate(30)")
                .append("text")
                .style("text-anchor", "start")
                .attr("x", -45)
                .attr("y", -20)
                .text("friends");

            d3.select(".axis-friends2019")
                .call(axisFriends2019.ticks(3).tickFormat(d3.format(".2s")))
                .attr("transform", "translate(" + centerX + "," + centerY + ") rotate(-30)")
                .append("text")
                .style("text-anchor", "start")
                .attr("x", length)
                .attr("y", -9)
                .text("friends");

            d3.select(".axis-tweets2018")
                .call(axisTweets2018.ticks(3).tickFormat(d3.format(".2s")))
                .attr("transform", "translate(" + (centerX - Math.cos((30 * Math.PI) / 180) * length) + "," + (centerY + Math.sin((30 * Math.PI) / 180) * length) + ") rotate(-30)")
                .append("text")
                .style("text-anchor", "start")
                .attr("x", -45)
                .attr("y", 40)
                .text("tweets");

            d3.select(".axis-tweets2019")
                .call(axisTweets2019.ticks(3).tickFormat(d3.format(".2s")))
                .attr("transform", "translate(" + centerX + "," + centerY + ") rotate(30)")
                .append("text")
                .style("text-anchor", "start")
                .attr("x", length)
                .attr("y", 40)
                .text("tweets");

            d3.select(".axis-likes")
                .call(axisLikes.ticks(3).tickFormat(d3.format(".2s")))
                .attr("transform", "translate(" + centerX + ",0)")
                .append("text")
                .style("text-anchor", "start")
                .attr("x", 9)
                .attr("y", centerY + length)
                .text("likes");

            function polygon(userID, year) {
                let nullPolygon = [
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 0
                    },
                    {
                        x: 0,
                        y: 0
                    }
                ]

                if (year == 2018) {
                    let user = data2018.nodes.find(d => d.id == userID)
                    if (user) {
                        return [
                            {
                                x: centerX,
                                y: scaleFollowers(user.followers_count)
                            },
                            {
                                x: centerX,
                                y: scaleLikes(user.favourites_count)
                            },
                            {
                                x: centerX - Math.cos((30 * Math.PI) / 180) * scaleTweets2019(user.statuses_count),
                                y: centerY + Math.sin((30 * Math.PI) / 180) * scaleTweets2019(user.statuses_count)
                            },
                            {
                                x: centerX - Math.cos((30 * Math.PI) / 180) * scaleFriends2019(user.friends_count),
                                y: centerY - Math.sin((30 * Math.PI) / 180) * scaleFriends2019(user.friends_count)
                            },
                        ];
                    } else {
                        return nullPolygon;
                    }
                } else {
                    let user = data2019.nodes.find(d => d.id == userID)
                    if (user) {
                        return [
                            {
                                x: centerX,
                                y: scaleFollowers(user.followers_count)
                            },
                            {
                                x: centerX + Math.cos((30 * Math.PI) / 180) * scaleFriends2019(user.friends_count),
                                y: centerY - Math.sin((30 * Math.PI) / 180) * scaleFriends2019(user.friends_count)
                            },
                            {
                                x: centerX + Math.cos((30 * Math.PI) / 180) * scaleTweets2019(user.statuses_count),
                                y: centerY + Math.sin((30 * Math.PI) / 180) * scaleTweets2019(user.statuses_count)
                            },
                            {
                                x: centerX,
                                y: scaleLikes(user.favourites_count)
                            },
                        ]
                    } else {
                        return nullPolygon;
                    }
                }

            }

            svg
                .append("g")
                .attr("class", "polygon polygon-new user1")
                .selectAll("polygon")
                .data([polygon(u1, 2019)])
                .enter()
                .append("polygon")
                .attr("points", d => {
                    return d.map(e => [e.x, e.y].join(",")).join(" ");
                });

            svg
                .append("g")
                .attr("class", "polygon polygon-new user2")
                .selectAll("polygon")
                .data([polygon(u2, 2019)])
                .enter()
                .append("polygon")
                .attr("points", d => {
                    return d.map(e => [e.x, e.y].join(",")).join(" ");
                });

            svg
                .append("g")
                .attr("class", "polygon polygon-old user1")
                .selectAll("polygon")
                .data([polygon(u1, 2018)])
                .enter()
                .append("polygon")
                .attr("points", d => {
                    return d.map(e => [e.x, e.y].join(",")).join(" ");
                });

            svg
                .append("g")
                .attr("class", "polygon polygon-old user2")
                .selectAll("polygon")
                .data([polygon(u2, 2018)])
                .enter()
                .append("polygon")
                .attr("points", d => {
                    return d.map(e => [e.x, e.y].join(",")).join(" ");
                });

        });
    });
}
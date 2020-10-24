function drawAM() {
    //const containerAdj = document.querySelector("#matrixContainer");

    var margin = { top: 150, right: 150, bottom: 10, left: 80 },
        width,
        height;
    if ((window.innerWidth - margin.left - margin.right) > (window.innerHeight - margin.top - margin.bottom)) {
        width = window.innerHeight - margin.top - margin.bottom;
        height = window.innerHeight - margin.top - margin.bottom;
    } else {
        width = window.innerWidth - margin.right;
        height = window.innerWidth - margin.right;
        margin.left = 100;
    }
    //width = 600,


    var x = d3.scaleBand().range([0, width]),
        z = d3.scaleLinear().domain([0, 4]).clamp(true),
        c = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(10));

    var svg = d3.select("#header2")
        //.classed("svg-contrainer-adjmatrix", true)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", margin.left + "px")
        .style("position", "fixed")
        .style("top", "0px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //console.log(d3.select("#overviewContainer").select("#matrixContainer").select("#header2").append("svg"));

    d3.json("../../data/merged_original_datasets.json").then(function (twitter) {
        var matrix = [],
            nodes_18 = twitter.nodes,
            links_18 = twitter.links,
            nodes_19 = twitter.nodes_19,
            links_19 = twitter.links_19;

        const filteredNodes_19 = nodes_19.reduce((p, c, i) => {
            if (
                nodes_18.some(x => x.id === c.id)
            ) {
                p.push(c)
            };
            return p
        }, []);

        var filteredNodes_19_top_100 = filteredNodes_19.sort(function (a, b) {
            return d3.descending(+a.friends_count, +b.friends_count);
        }).slice(0, 100);

        const filteredNodes_18_top_100 = nodes_18.reduce((p, c, i) => {
            if (
                filteredNodes_19_top_100.some(x => x.id === c.id)
            ) {
                p.push(c)
            };
            return p
        }, []);


        const filteredLinks_18 = links_18.reduce((p, c, i) => {
            if (
                filteredNodes_18_top_100.some(x => x.id === c.source)
                &&
                filteredNodes_18_top_100.some(x => x.id === c.target)
            ) {
                p.push(c)
            };
            return p
        }, []);


        const filteredLinks_19 = links_19.reduce((p, c, i) => {
            if (
                filteredNodes_19_top_100.some(x => x.id === c.source)
                &&
                filteredNodes_19_top_100.some(x => x.id === c.target)
            ) {
                p.push(c)
            };
            return p
        }, []);


        // Compute index per node.
        nodes_18.forEach(function (node, i) {
            node.year = 1;
        });

        // Compute index per node.
        nodes_19.forEach(function (node, i) {
            node.year = 2;
        });


        const links = [...filteredLinks_18, ...filteredLinks_19].reduce((r, l) => {
            //console.log(l);
            const dup = r.find(({ source: s, target: t }) =>
                (s == l.source && t == l.target) ||
                (s == l.target && t == l.source))
            dup ? dup.dup = true : r.push(l)
            return r
        }, []),

            nodes = [...filteredNodes_19_top_100, ...filteredNodes_18_top_100].reduce((r, n) => {
                const dupL = links.find(l =>
                    l.dup && (l.source == n.id || l.target == n.id)),
                    dupN = r.find(({ id }) => id == n.id)
                !dupN && r.push({ ...n, ...(dupL && { year: 3 }) })
                return r
            }, []),

            mergedMatrix = { links: links.map(({ dup, ...rest }) => rest), nodes };




        console.log(mergedMatrix);

        var nodes_pre = mergedMatrix.nodes,
            links_pre = mergedMatrix.links;

        for (var i = 0; i < nodes_pre.length; i++) {
            var manipulate = nodes_pre[i].screen_name;
            if (manipulate === "manunna_91") {
                nodes_pre[i].year = 2;
            }

            if (manipulate === "mf_viz") {
                nodes_pre[i].year = 2;
            }
        }


        var n = nodes_pre.length;
        nodes_pre.forEach(function (node, i) {
            node.index = i;
            node.count = 0;
            matrix[i] = d3.range(n).map(function (j) {
                return { x: j, y: i, z: 0 };
            });
        });
        //console.log(nodes_pre);

        for (var i = 0; i < links_pre.length; i++) {
            var target = links_pre[i].target;
            var index = nodes_pre.findIndex(function (item) {
                return item.id === target
            });
            links_pre[i].targetID = index;
        };
        //console.log(links_pre);

        //Convert user-ids to index of nodes
        for (var i = 0; i < links_pre.length; i++) {
            var source = links_pre[i].source;
            var index = nodes_pre.findIndex(function (item) {
                return item.id === source
            });
            links_pre[i].sourceID = index;
        };

        links_pre.forEach(function (link, i) {
            matrix[link.sourceID][link.targetID].z += 4;

            nodes_pre[link.sourceID].count++;
            nodes_pre[link.targetID].count++;
        });

        var orders = {
            name: d3.range(n).sort(function (a, b) {
                return d3.ascending(nodes_pre[a].screen_name, nodes_pre[b].screen_name);
            }),
            count: d3.range(n).sort(function (a, b) {
                return d3.descending(nodes_pre[a].followers_count, nodes_pre[b].followers_count);
            }),
            group: d3.range(n).sort(function (a, b) {
                return d3.descending(nodes_pre[a].friends_count, nodes_pre[b].friends_count);
            })
        };

        // The default sort order.
        x.domain(orders.name);

        svg.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height);

        var row = svg.selectAll(".row")
            .data(matrix)
            .enter().append("g")
            .attr("class", "row")
            .attr("transform", function (d, i) {
                return "translate(0," + x(i) + ")";
            })
            .each(row);

        row.append("line")
            .attr("x2", width);

        row.append("text")
            .attr("x", -6)
            .attr("y", x.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .style("font-size", "7px")
            .text(function (d, i) {
                return nodes_pre[i].screen_name
            })
            .on("click", function (d, i) {
                var x_screen_name_for_connection = nodes_pre[i].screen_name,
                    x_followers_count_for_connection = nodes_pre[i].followers_count,
                    x_friends_count_for_connection = nodes_pre[i].friends_count,
                    x_favourites_count_for_connection = nodes_pre[i].favourites_count,
                    x_statuses_count_for_connection = nodes_pre[i].statuses_count,
                    x_profile_image_url_for_conncection = nodes_pre[i].profile_image_url,
                    x_id_for_connection = nodes_pre[i].id;

                send_Single_x(
                    x_screen_name_for_connection,
                    x_followers_count_for_connection,
                    x_friends_count_for_connection,
                    x_favourites_count_for_connection,
                    x_statuses_count_for_connection,
                    x_profile_image_url_for_conncection
                );
                send_Single_x_id(x_id_for_connection);
            });


        var column = svg.selectAll(".column")
            .data(matrix)
            .enter().append("g")
            .attr("class", "column")
            .attr("transform", function (d, i) {
                return "translate(" + x(i) + ")rotate(-90)";
            });

        column.append("line")
            .attr("x1", -width);

        column.append("text")
            .attr("x", 6)
            .attr("y", x.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .style("font-size", "7px")
            .text(function (d, i) {
                return nodes_pre[i].screen_name
            })
            .on("click", function (d, i) {
                var y_screen_name_for_connection = nodes_pre[i].screen_name,
                    y_followers_count_for_connection = nodes_pre[i].followers_count,
                    y_friends_count_for_connection = nodes_pre[i].friends_count,
                    y_favourites_count_for_connection = nodes_pre[i].favourites_count,
                    y_statuses_count_for_connection = nodes_pre[i].statuses_count,
                    y_profile_image_url_for_conncection = nodes_pre[i].profile_image_url,
                    y_id_for_connection = nodes_pre[i].id;

                send_Single_y(
                    y_screen_name_for_connection,
                    y_followers_count_for_connection,
                    y_friends_count_for_connection,
                    y_favourites_count_for_connection,
                    y_statuses_count_for_connection,
                    y_profile_image_url_for_conncection
                );
                send_Single_y_id(y_id_for_connection);
            });


        function row(row) {
            var cell = d3.select(this).selectAll(".cell")
                .data(row.filter(function (d) {
                    return d.z;
                }))
                .enter().append("rect")
                .attr("class", "cell")
                .attr("x", function (d) {
                    return x(d.x);
                })
                .attr("width", x.bandwidth())
                .attr("height", x.bandwidth())
                .style("fill-opacity", function (d) {
                    return z(d.z);
                })
                .style("fill", function (d) { return (nodes_pre[d.x].year === 1) ? (c(4)) : ((nodes_pre[d.x].year === 2) ? (c(6)) : (c(9))); })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("click", click);
        }


        function click(p) {
            var y_screen_name_for_connection,
                y_followers_count_for_connection,
                y_friends_count_for_connection,
                y_favourites_count_for_connection,
                y_statuses_count_for_connection,
                y_profile_image_url_for_conncection,
                y_id_for_connection;

            var x_screen_name_for_connection,
                x_followers_count_for_connection,
                x_friends_count_for_connection,
                x_favourites_count_for_connection,
                x_statuses_count_for_connection,
                x_profile_image_url_for_conncection,
                x_id_for_connection;

            d3.selectAll(".row text").classed("active", function (d, i) {
                y_screen_name_for_connection = nodes_pre.find(x => x.index === p.y).screen_name;
                y_followers_count_for_connection = nodes_pre.find(x => x.index === p.y).followers_count;
                y_friends_count_for_connection = nodes_pre.find(x => x.index === p.y).friends_count;
                y_favourites_count_for_connection = nodes_pre.find(x => x.index === p.y).favourites_count;
                y_statuses_count_for_connection = nodes_pre.find(x => x.index === p.y).statuses_count;
                y_profile_image_url_for_conncection = nodes_pre.find(x => x.index === p.y).profile_image_url;
                y_id_for_connection = nodes_pre.find(x => x.index === p.y).id;

                x_screen_name_for_connection = nodes_pre.find(x => x.index === p.x).screen_name;
                x_followers_count_for_connection = nodes_pre.find(x => x.index === p.x).followers_count;
                x_friends_count_for_connection = nodes_pre.find(x => x.index === p.x).friends_count;
                x_favourites_count_for_connection = nodes_pre.find(x => x.index === p.x).favourites_count;
                x_statuses_count_for_connection = nodes_pre.find(x => x.index === p.x).statuses_count;
                x_profile_image_url_for_conncection = nodes_pre.find(x => x.index === p.x).profile_image_url;
                x_id_for_connection = nodes_pre.find(x => x.index === p.x).id;
            });
            sendInformationFromAdjToDetail(
                y_screen_name_for_connection,
                y_followers_count_for_connection,
                y_friends_count_for_connection,
                y_favourites_count_for_connection,
                y_statuses_count_for_connection,
                y_profile_image_url_for_conncection,
                x_screen_name_for_connection,
                x_followers_count_for_connection,
                x_friends_count_for_connection,
                x_favourites_count_for_connection,
                x_statuses_count_for_connection,
                x_profile_image_url_for_conncection
            );
            sendIdsFromAdjToIndex(x_id_for_connection, y_id_for_connection);
        }

        function mouseover(p) {
            d3.selectAll(".row text").classed("active", function (d, i) {
                return i == p.y;
            });
            d3.selectAll(".column text").classed("active", function (d, i) {
                return i == p.x;
            });

        }

        function mouseout() {
            d3.selectAll("text").classed("active", false);
            d3.selectAll("rect").attr("width", x.bandwidth());
            d3.selectAll("rect").attr("height", x.bandwidth());
        }

        d3.selectAll("input[name='select_filter']").on("change", function () {
            clearTimeout(timeout);
            order(this.value);
        });

        function order(value) {
            var compare_animation_array = [];
            for (var i = 0; i < 100; i++) {
                compare_animation_array.push(x(i));
            }
            x.domain(orders[value]);
            var t = svg.transition()
                .duration(2000)
                ;
            t.selectAll(".row")
                .selectAll(".cell")
                .attr("x", function (d) {
                    return x(d.x);
                });
            t.selectAll(".row")
                .transition()
                .style("fill", "black")
                .transition()
                .attr("transform", function (d, i) {
                    // moved up
                    if (compare_animation_array[i] > x(i)) {
                        return "translate(0," + x(i) + ")";
                    }
                    else {
                        return "translate(0," + x(i) + ")";
                    }
                })

            t.selectAll(".column")
                .transition()
                .style("fill", "black")
                .transition()
                .attr("transform", function (d, i) {
                    return "translate(" + x(i) + ")rotate(-90)";
                })
        }

        var timeout = setTimeout(function () {
            order("name");
            d3.select("#order").property("selectedIndex", 2).node().focus();
        }, 2000);
    });

    let z_index = document.getElementById("order");

    // This handler will be executed only once when the cursor
    // moves over the unordered list
    z_index.addEventListener("mouseenter", function (event) {
        // highlight the mouseenter target
        event.target.style.zIndex = "1";
        console.log(event.target.style.zIndex);

        // reset the color after a short delay
        setTimeout(function () {
            event.target.style.zIndex = "0";
        }, 500);
    }, false);

    // This handler will be executed every time the cursor
    // is moved over a different list item
    z_index.addEventListener("mouseover", function (event) {
        // highlight the mouseover target
        event.target.style.zIndex = "0";
        console.log(event.target.style.zIndex);

        // reset the color after a short delay
        setTimeout(function () {
            event.target.style.zIndex = "0";
        }, 500);
    }, false);

}
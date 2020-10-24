var margin = {top: 150, right: 80, bottom: 100, left: 100},
    width = 600,
    height = 600;

var x = d3.scaleBand().range([0, width]),
    z = d3.scaleLinear().domain([0, 4]).clamp(true),
    c = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(10));

var svg = d3.select("#header2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", margin.left + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//console.log(d3.select("#overviewContainer").select("#matrixContainer").select("#header2").append("svg"));

d3.json("content/2018/eurovisNetwork_2018.json").then(function(twitter) {
    var matrix = [],
        nodes_18 = twitter.nodes,
        links_18 = twitter.links,
        nodes_19 = twitter.nodes_19,
        links_19 = twitter.links_19;

    const filteredNodes_19 = nodes_19.reduce((p,c,i) => {
        if(
            nodes_18.some(x => x.id===c.id)
        )
        {
            p.push(c)
        };
        return p
    },[]);

    var filteredNodes_19_top_100 = filteredNodes_19.sort(function(a, b) {
        return d3.descending(+a.followers_count, +b.followers_count);
    }).slice(0, 100);

    const filteredNodes_18_top_100 = nodes_18.reduce((p,c,i) => {
        if(
            filteredNodes_19_top_100.some(x => x.id===c.id)
        )
        {
            p.push(c)
        };
        return p
    },[]);


    const filteredLinks_18 = links_18.reduce((p,c,i) => {
        if(
            filteredNodes_18_top_100.some(x => x.id===c.source)
            &&
            filteredNodes_18_top_100.some(x => x.id===c.target)
        )
        {
            p.push(c)
        };
        return p
    },[]);


    const filteredLinks_19 = links_19.reduce((p,c,i) => {
        if(
            filteredNodes_19_top_100.some(x => x.id===c.source)
            &&
            filteredNodes_19_top_100.some(x => x.id===c.target)
        )
        {
            p.push(c)
        };
        return p
    },[]);


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
            const dup = r.find(({source: s, target: t}) =>
                (s == l.source && t == l.target) ||
                (s == l.target && t == l.source))
            dup ? dup.dup = true : r.push(l)
            return r
        }, []),

        nodes = [...filteredNodes_19_top_100, ...filteredNodes_18_top_100].reduce((r, n) => {
            const dupL = links.find(l =>
                l.dup && (l.source == n.id || l.target == n.id)),
                dupN = r.find(({id}) => id == n.id)
            !dupN && r.push({...n, ...(dupL && {year: 3})})
            return r
        }, []),

        mergedMatrix = {links: links.map(({dup, ...rest}) => rest), nodes};



    console.log(mergedMatrix);

    var nodes_pre = mergedMatrix.nodes,
        links_pre = mergedMatrix.links;

    var n = nodes_pre.length;
    nodes_pre.forEach(function (node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function (j) {
            return {x: j, y: i, z: 0};
        });
    });
    console.log(nodes_pre);

    for (var i = 0; i < links_pre.length; i++) {
        var target = links_pre[i].target;
        var index = nodes_pre.findIndex(function (item) {
            return item.id === target
        });
        links_pre[i].targetID = index;
    };
    console.log(links_pre);

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
        //matrix[link.target][link.source].z += 4;
        ////matrix[link.source][link.source].z += 4;
        ////matrix[link.target][link.target].z += 4;
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
        .text(function (d, i) {
            return nodes_pre[i].screen_name
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
        .text(function (d, i) {
            return nodes_pre[i].screen_name
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
            .style("fill", function (d) { return  (nodes_pre[d.x].year === 1) ? (c(1)) : ((nodes_pre[d.x].year === 2) ? (c(6)) : (c(9))); })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click);
    }

    function click(p) {
        console.log("clicked", p);
        var screen_name_for_connection;
        d3.selectAll(".row text").classed("active", function (d, i) {
            screen_name_for_connection = nodes_pre.find(x => x.index === p.y).screen_name;
        });
        send_message(screen_name_for_connection);
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

    d3.select("#order").on("change", function () {
        clearTimeout(timeout);
        order(this.value);
    });

    function order(value) {
        var compare_animation_array = [];
        for (var i = 0; i < 100; i++){
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
                if (compare_animation_array[i] > x(i)){
                    //return "translate(-20," + x(i) + ")";
                    return "translate(0," + x(i) + ")";
                }
                else{
                    return "translate(0," + x(i) + ")";
                }
            })
            /*
            .style("fill", function (d, i) {
                if (compare_animation_array[i] > x(i)){
                    return "red";
                }
                else if (compare_animation_array[i] == x(i)){
                    return "green";
                }
                else{
                    return "blue";
                }
            });
*/
        t.selectAll(".column")
            .transition()
            .style("fill", "black")
            .transition()
            .attr("transform", function (d, i) {
                return "translate(" + x(i) + ")rotate(-90)";
            })
            /*
            .style("fill", function (d, i) {
                if (compare_animation_array[i] > x(i)){
                    return "red";
                }
                else if (compare_animation_array[i] == x(i)){
                    return "green";
                }
                else{
                    return "blue";
                }
            });
            */

    }

    var timeout = setTimeout(function () {
        order("group");
        d3.select("#order").property("selectedIndex", 2).node().focus();
    }, 2000);
});

function drawDM(container, user) {

    const margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = container.clientWidth - margin.left - margin.right,
        height = container.clientHeight - margin.top - margin.bottom;

    d3.selectAll("#" + container.id + "> *").remove();

    const svg = d3.select("#" + container.id)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const radius = height * 0.033;
    const dotMargin = radius / 2;
    const rowLength = width;
    const dotsPerRow = Math.floor(rowLength / (2 * radius + 2 * dotMargin));

    let strokeColor = d3.scaleOrdinal(
        ["both, friends, followers, none"],
        [
            "rgb(255, 242, 174)",
            "rgb(179, 226, 205)",
            "rgb(203, 213, 232)",
            "rgb(230, 245, 201)"
        ]
    );
    let fillColor = d3.scaleOrdinal(
        ["both, friends, followers, none"],
        [
            "rgb(255, 217, 47)",
            "rgb(102, 194, 165)",
            "rgb(141, 160, 203)",
            "rgb(166, 216, 84)"
        ]
    );


    d3.json("data/filtered_data_friendsCount_2019.json").then(data2019 => {
        d3.json("data/filtered_data_friendsCount_2018.json").then(data2018 => {

            let allConnections2018 = checkConnections(data2018, user);
            let allConnections2019 = checkConnections(data2019, user);

            /* data2018.nodes.forEach(u => {
                let con18 = checkConnections(data2018, u.id);
                let con19 = checkConnections(data2019, u.id);

                con19.forEach(d => {
                    let e = con18.find(f => f.id == d.id);
                    if (e && d.type != e.type) {
                        console.log(u.screen_name)
                    }
                })
            }); */

            var tooltip = d3.select("#" + container.id).append("div")
                .attr("class", "dot-tooltip card overlay")
                .style("opacity", 0);

            d3.select("#" + container.id).on("click", () => {
                tooltip.style("opacity", 0)
            })

            svg
                .selectAll(".rows")
                .data(allConnections2019.map((d, i) => {
                    let e = allConnections2018.find(c => c.id == d.id);
                    d.row = Math.floor(i / dotsPerRow);
                    d.column = i - d.row * dotsPerRow;

                    d.fill = fillColor(d.type);
                    if (e) {
                        d.stroke = strokeColor(e.type)
                    } else {
                        d.stroke = "white";
                    }
                    return d;

                }))
                .enter()
                .append("circle")
                .attr("class", d => d.type)
                .attr("cx", d => radius + dotMargin + d.column * (2 * radius + 2 * dotMargin))
                .attr("cy", d => radius + dotMargin + d.row * (2 * radius + 2 * dotMargin))
                .attr("r", radius)
                .style("stroke", d => d.stroke)
                .style("fill", d => d.fill)
                .on("click", function (d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1)
                        .text(d.screen_name)
                        .style("top", (d3.event.pageY - 16) + "px");

                    if (d3.event.pageX < window.innerWidth / 2) {
                        tooltip.style("left", (d3.event.pageX + this.r.baseVal.value + 8) + "px")
                    } else {
                        tooltip.style("right", (window.innerWidth - d3.event.pageX + this.r.baseVal.value + 8) + "px")
                    }
                });
        })
    })
}

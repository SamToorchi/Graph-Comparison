function drawVP(container, u1, u2, mode) {    

    const margin = { top: 10, right: 30, bottom: 30, left: 50 },
        width = container.clientWidth - margin.left - margin.right,
        height = container.clientHeight - margin.top - margin.bottom;

    d3.selectAll("#" + container.id + "> *").remove();

    const svg = d3.select("#" + container.id)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    let y;

    d3.json("data/filtered_data_friendsCount_2019.json").then(data => {

        let nodes = data.nodes;

        y = d3.scaleSymlog()
            .domain(d3.extent(nodes.map(d => d[mode])))
            .range([height, 0])
        svg
            .append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d3.format(".2s"))
            )

        const histogram = d3.histogram()
            .domain(y.domain())
            .thresholds(y.ticks(60))
            // Important: how many bins approx are going to be made? 
            // It is the 'resolution' of the violin plot
            .value(d => d)

        const bins = histogram(nodes.map(g => g[mode]));
        const binStarts = bins.filter(d => d.length != 0).map(d => d.x0);

        const data_with_extremes = bins.filter((d, i, a) => {
            if (d.length != 0) {
                return d;
            } else if (a[i - 1] && a[i - 1].length != 0) {
                return d;
            } else if (a[i + 1] && a[i + 1].length != 0) {
                return d;
            }
        }).map(d => d.x0);
        const q1 = d3.quantile(binStarts, .25)
        const median = d3.quantile(binStarts, .5)
        const q3 = d3.quantile(binStarts, .75)
        const min = d3.min(data_with_extremes);
        const max = d3.max(data_with_extremes);
        /*
        const interQuantileRange = q3 - q1
        const min = q1 - 1.5 * interQuantileRange
        const max = q1 + 1.5 * interQuantileRange 
        */

        // The bin with the most entries will have a width of 100%.
        const maxNum = d3.max(bins.map(a => a.length));

        const xNum = d3.scaleLinear()
            .range([0, width])
            .domain([-maxNum, maxNum])

        svg
            .append("g")
            .attr("class", "violin-shape")
            .append("path")
            .datum(bins)
            .attr("d", d3.area()
                .x0(d => xNum(-d.length))
                .x1(d => xNum(d.length))
                .y(d => y(d.x0))
                .curve(d3.curveCatmullRom));
        /*  .curve(d3.curveCatmullRom));
            .curve(d3.curveMonotoneY));
            both curve types have advantages and disadvantages
            boxplot has to be adjusted accordingly */

        const center = width / 2;
        const boxWidth = 10;

        const boxContainer = svg
            .append("g")
            .attr("class", "box-plot")

        // Main vertical line
        boxContainer
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(min))
            .attr("y2", y(max))

        // Box
        boxContainer
            .append("rect")
            .attr("class", "violin-box")
            .attr("x", center - boxWidth / 2)
            .attr("y", y(q3))
            .attr("height", (y(q1) - y(q3)))
            .attr("width", boxWidth)

        // User values
        const userValues = nodes.filter(d => d.id == u1 || d.id == u2);

        // Indicator of user value
        boxContainer
            .append("g")
            .attr("class", "user-indicators")
            .selectAll("userIndicator")
            .data(userValues)
            .enter()
            .append("circle")
            .attr("cx", center)
            .attr("cy", d => y(d[mode]))
            .attr("r", boxWidth / 2);
    })
}
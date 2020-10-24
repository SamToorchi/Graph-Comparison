function drawNL() {

    //set margin corresponding to graph container width and height
    const container = document.getElementById("graphContainer");
    let marginAll = Math.min(container.clientWidth, container.clientHeight);
    const margin = {top: marginAll / 50, right: marginAll / 50 + 50, bottom: marginAll / 50 + 50, left: marginAll / 50},
        width = container.clientWidth - margin.left - margin.right,
        height = container.clientHeight - margin.top - margin.bottom;

    //Array that stores the connectivity information
    let getsFollowedBy = [];

    //object that stores the selected nodes
    let selected = {
        first: null,
        second: null
    };

    //define the colors of the selection and highlighting boxes
    let selectBoxOne = "rgb(0, 140, 255) solid 3px";
    let selectBoxTwo = "rgb(255, 123, 0) solid 3px";
    let overlapBox = "rgb(128, 128, 128) dashed 3px";

    //set the witdth and height (radius) of the images
    const radius = Math.min(width, height) / 40;

    //map of the given .json filenames with year as key
    const files = new Map();
    files.set("2018", ["./data/filtered_data_friendsCount_2018.json"]);
    files.set("2019", ["./data/filtered_data_friendsCount_2019.json"]);
    files.set("2018-19", ["./data/filtered_data_friendsCount_2018.json", "./data/filtered_data_friendsCount_2019.json"]);

    // append the svg object to the body of the page
    const svg = d3.select("#graphContainer")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // create the force simulation in regard to given height and width
    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-Math.min(width, height)))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(-(width / 5000)))
        .force("y", d3.forceY(height / 2).strength(-(height / 5000)));


    //restarts the simulation and redraws everything corresponding to the given parameters
    updateSimulation(year, simulation, svg, files);

    //redraw and restart simulation if year change button is pressed
    container.addEventListener("year-changed", function (d) {
        updateSimulation(d.detail, simulation, svg, files);
    });

    //helper functions for node dragging and to fix node positions afterwards
    function dragstarted(d) {
        simulation.velocityDecay(1);
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    }
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    function dragended(d) {
        if (!d3.event.active) simulation.stop();
    }

    //helper function to determine if nodes are connected
    //corresponding to the "getsFollowedBy" Array and the connective filters
    function neigh(a, b) {
        if (getFollowedByFilter && !isFollowingFilter) {
            return a == b || getsFollowedBy[a + "-" + b];
        } else if (isFollowingFilter && !getFollowedByFilter) {
            return a == b || getsFollowedBy[b + "-" + a];
        }
        else if(getFollowedByFilter && isFollowingFilter){
            return a == b || (getsFollowedBy[b + "-" + a] && getsFollowedBy[a + "-" + b]);
        }
    }

    //restarts the simulation and redraws everything corresponding to the given parameters
    function updateSimulation(year, simulation, svg) {
        //delete content of the svg and restart simulation
        svg.select(".nodes").remove();
        svg.select(".links").remove();
        simulation.restart();
        simulation.alpha(1);
        simulation.alphaTarget(0);

        //load the data from the json file corresponding to the given year
        const promises = files.get(year).map(url => d3.json(url));
        Promise.all(promises).then((data, error) => {
            if (error) throw error;

            let nodes = [];
            let links = [];

            //if two years / graphs are selected the nodes and links are merged to prevent duplicates
            //if duplicates appear the newest node is kept
            if (data.length > 1) {
                data.forEach(graph => {
                    graph.nodes.forEach(node => {
                        duplicate = nodes.findIndex(x => x.id === node.id);
                        if (duplicate != -1) {
                            nodes.splice(duplicate, 1);
                            node.duplicate = "true";
                        } else {
                            node.duplicate = "false";
                        }
                        nodes.push(node);
                    });
                    graph.links.forEach(link => {
                        duplicate = links.findIndex(x => x.source === link.source && x.target === link.target);
                        if (duplicate != -1) {
                            links.splice(duplicate, 1);
                            link.duplicate = "true";
                        } else {
                            link.duplicate = "false";
                        }
                        links.push(link);
                    })
                })
            } else {
                nodes = data[0].nodes;
                links = data[0].links;
            }

            //set selected nodes to null or keep the selection of the previous simulation
            if(selected.first == null || nodes.find(u => u.id == selected.first.id) == undefined){
                selected.first = null;
            }
            if(selected.second == null || nodes.find(u => u.id == selected.second.id) == undefined){
                selected.second = null;
            }

            //set show attribute for node, that is used for applying the filters
            nodes.forEach(singleNode => {
                singleNode.show = true;
            })

            //save connections and directions of links
            links.forEach(d => {
                getsFollowedBy[d.source + "-" + d.target] = true;
            });

            //append links from json file as line elements to svg
            const link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(links)
                .enter()
                .append("line")
                .attr("id", d => (d.source + "-" + d.target))
                .attr("duplicate", d => d.duplicate)
                .attr("year", d => d.year);

            //append links from json file as line elements to svg
            const node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("image")
                .data(nodes)
                .enter()
                .append("image")
                .attr("id", d => d.id)
                .attr("year", d => d.year_data)
                .attr("duplicate", d => d.duplicate)
                .attr('width', 2 * radius)
                .attr('height', 2 * radius)
                .attr("transform",
                    "translate(-" + radius + ",-" + radius + ")")
                .attr("href", d => d.profile_image_url)
                .on("error", function () {
                    this.setAttribute("href", "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png");
                })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            //show screen name on node mouse over
            node.append("title")
                .text(d => d.screen_name);

            //set simulation decay to slow down and stop movement
            simulation.velocityDecay(0.95);

            //add nodes and links to simulation
            simulation
                .nodes(nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(links);

            //either use already selected node at beginning or
            //use random initial selection
            if(selected.first == null && selected.second==null){
                initialSelection();
            } else {
                styleSelectedNodes(selected);
            }

            //add mouse click function to nodes
            node.on("click", () => {
                target = d3.select(d3.event.target)._groups[0]["0"];

                //if target of click was a already selected node, different style and select options are executed
                if ((selected.first != null && target.id == selected.first.id) || ( selected.second != null && target.id == selected.second.id)) {
                    //reset visuals to default
                    node
                        .style("opacity", 1)
                        .style("outline", "none")

                    link
                        .style("opacity", 0)
                        .style("stroke-width", 2)

                    //style the one selected node
                    if (selected.first != null && target.id == selected.first.id) {
                        selected.first = null;
                        styleSelectedNodes();
                    } else if ( selected.second != null && target.id == selected.second.id) {
                        selected.second = null;
                        styleSelectedNodes();
                    }

                    //send the information of the one selected node to the detail view
                    if(selected.first != null && nodes.find(u => u.id == selected.first.id) != undefined){
                        node_y = nodes.find(u => u.id == selected.first.id);
                        send_Single_y_Node(node_y["screen_name"], node_y["followers_count"], node_y["friends_count"], node_y["favourites_count"], node_y["statuses_count"], node_y["profile_image_url"]);
                        send_Single_y_id_Node(node_y.id)
                    }
                    if(selected.second != null && nodes.find(u => u.id == selected.second.id) != undefined){
                        node_x = nodes.find(u => u.id == selected.second.id);
                        send_Single_x_Node(node_x["screen_name"], node_x["followers_count"], node_x["friends_count"], node_x["favourites_count"], node_x["statuses_count"], node_x["profile_image_url"]);
                        send_Single_x_id_Node(node_x.id)
                    }

                    return;

                }

                //if target wasn't a selected node yet, set it as selected in the "selected" object
                setSelectedNodes(target);
                //style the selected nodes
                styleSelectedNodes(selected);

                //send either both or only one selected node to the detail view
                if(selected.first != null && selected.second != null){
                    node_y = nodes.find(u => u.id == selected.first.id);
                    node_x = nodes.find(u => u.id == selected.second.id);

                    if(node_y != undefined && node_x != undefined){
                        sendInformationFromNodeToDetail(
                            node_y["screen_name"], node_y["followers_count"], node_y["friends_count"], node_y["favourites_count"], node_y["statuses_count"], node_y["profile_image_url"],
                            node_x["screen_name"], node_x["followers_count"], node_x["friends_count"], node_x["favourites_count"], node_x["statuses_count"], node_x["profile_image_url"])
                        sendIdsFromNodeToIndex(node_y.id, node_x.id);
                    }
                }
                else {
                    if(selected.first != null && nodes.find(u => u.id == selected.first.id) != undefined){
                        node_y = nodes.find(u => u.id == selected.first.id);
                        send_Single_y_Node(node_y["screen_name"], node_y["followers_count"], node_y["friends_count"], node_y["favourites_count"], node_y["statuses_count"], node_y["profile_image_url"]);
                        send_Single_y_id_Node(node_y.id)
                    }
                    if(selected.second != null && nodes.find(u => u.id == selected.second.id) != undefined){
                        node_x = nodes.find(u => u.id == selected.second.id);
                        send_Single_x_Node(node_x["screen_name"], node_x["followers_count"], node_x["friends_count"], node_x["favourites_count"], node_x["statuses_count"], node_x["profile_image_url"]);
                        send_Single_x_id_Node(node_x.id)
                    }
                }

            });

                //event listener for changing the filters
                container.addEventListener("filters-changed", e => {
                filteredNodes = e.detail;

                //set show properties for nodes corresponding to their occurrence in the filteredNodes
                nodes.forEach(o => {
                    if(filteredNodes.find(u => u.id == o.id)){
                        o.show = true;
                    }
                    else o.show = false;

                })

                //if a selected node is filtered out, the selected object is updated accordingly
                if(selected.first == null || !filteredNodes.find(u => u.id == selected.first.id)){
                    selected.first = null;
                }
                if(selected.second == null || !filteredNodes.find(u => u.id == selected.second.id)){
                    selected.second = null;
                }

                //style both selected nodes
                styleSelectedNodes();

            })

            //update position attributes for nodes and links every tick of simulation
            function ticked() {
                node
                    .attr("x", d =>
                        d.x = Math.max(radius, Math.min(width - radius, d.x)) - radius / 2
                    )
                    .attr("y", d =>
                        d.y = Math.max(radius, Math.min(height - radius, d.y)) - radius / 2
                    );

                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
            }

            //Generate a random selection of a node with at least 10 links to other nodes
            async function initialSelection() {
                await new Promise(r => setTimeout(r, 1));
                node
                    .style("opacity", 0.2);

                let randomNode;
                let counter = 0;


                while (counter < 10) {
                    counter = 0;

                    randomNode = nodes[Math.floor(Math.random() * nodes.length)];

                    links.forEach(d => {
                        if (getFollowedByFilter && !isFollowingFilter && d.target.id == randomNode.id) {
                            counter++;
                        } else if (isFollowingFilter && !getFollowedByFilter && d.source.id == randomNode.id) {
                            counter++;
                        } else if(getFollowedByFilter && isFollowingFilter){
                            counter = 10;
                        }
                    });
                }
                //trigger click event for selection and styling of initial selected node
                d3.select("image[id=\'" + randomNode.id + "\']")._groups[0]["0"].dispatchEvent(new Event("click"));
            };

            //sets the given node as selected in the "selected" object and swaps other node if necessary
            function setSelectedNodes(node) {
                if (selected.first == null) {
                    selected.first = node;
                    return;
                } else if (selected.first != null) {
                    selected.second = selected.first;
                    selected.first = node;
                    return;
                }
            }

            //trigger styling of both selected nodes according to the "selected object"
            function styleSelectedNodes() {
                //reset styling to default
                node
                    .style("opacity", 0)
                    .style("outline", "none");

                link
                    .style("opacity", 0)
                    .style("stroke-width", 2);

                //only style selected node if it is set
                if (selected.first != null) {
                    styleNode(selected.first);
                }
                if (selected.second != null) {
                    styleNode(selected.second);
                }

                //incorporate filter usage
                if (selected.first == null && selected.second == null) {
                    node
                        .style("opacity", o => {
                            if(o.show){
                                return 1;
                            }else {
                                return 0;
                            }
                        })
                        .style("outline", "none");
                }

            };

            function styleNode(selectedNode) {

                //style opacity in regard to filters, connections and matching neighbours
                node.style("opacity", o => {
                    if(!o.show){
                        return 0;
                    }
                    if (neigh(o.id, selectedNode.id) && nodes.find(u => u.id == o.id) != undefined) {
                        if(d3.select("image[id=\'" + o.id + "\']")._groups[0]["0"].style.opacity == 1 && d3.select("image[id=\'" + o.id + "\']")._groups[0]["0"].style.outline == "currentcolor none medium"){
                            d3.select("image[id=\'" + o.id + "\']")._groups[0]["0"].style.outline = overlapBox;
                        }
                        return 1;
                    } else if (d3.select("image[id=\'" + o.id + "\']")._groups[0]["0"].style.opacity == 1) {
                        return 1;
                    } else {
                        return 0.2;
                    }
                })
                //style outline in regard to filters, number/position of selected nodes and matching neighbours
                    .style("outline", o => {
                        if(!o.show){
                            return "none";
                        }
                        else if (o.id == selectedNode.id) {
                            if(selected.first != null && selectedNode.id == selected.first.id){
                                return selectBoxOne;
                            }
                            else {
                                return selectBoxTwo;
                            }
                        } else if (d3.select("image[id=\'" + o.id + "\']")._groups[0]["0"].style.outline == selectBoxOne) {
                            return selectBoxOne;
                        } else if (d3.select("image[id=\'" + o.id + "\']")._groups[0]["0"].style.outline == selectBoxTwo) {
                            return selectBoxTwo;
                        }else if (d3.select("image[id=\'" + o.id + "\']")._groups[0]["0"].style.outline == overlapBox) {
                            return overlapBox;
                        }
                        else {
                            return "none";
                        }
                    });

                //style link opacity regarding to filters (visibility and connectivity) and matching neighbours
                link.style("opacity", link_d => {
                    if (getFollowedByFilter && link_d.source.show) {
                        if (link_d.target.id == selectedNode.id && nodes.find(u => u.id == link_d.source.id) != undefined) {
                            return 1;
                        } else if (d3.select("line[id=\'" + link_d.source.id + "-" + link_d.target.id + "\']")._groups[0]["0"] != null
                            && d3.select("line[id=\'" + link_d.source.id + "-" + link_d.target.id + "\']")._groups[0]["0"].style.opacity == 1) {
                            return 1;
                        }
                    } else if (isFollowingFilter && link_d.target.show) {
                        if (link_d.source.id == selectedNode.id && nodes.find(u => u.id == link_d.target.id) != undefined) {
                            return 1;
                        } else if (d3.select("line[id=\'" + link_d.source.id + "-" + link_d.target.id + "\']")._groups[0]["0"] != null
                            && d3.select("line[id=\'" + link_d.source.id + "-" + link_d.target.id + "\']")._groups[0]["0"].style.opacity == 1) {
                            return 1;
                        }
                    }

                    return 0;
                })
                //style link stroke in regard to year (and duplicate = both years)
                    .style("stroke", link_d => {
                        if (link_d.hasOwnProperty("duplicate")
                            && link_d.duplicate === "true") {
                            return "#17becf";
                        } else if (link_d.hasOwnProperty("year")
                            && link_d.year === 2018) {
                            return "#e377c2";
                        } else if (link_d.hasOwnProperty("year")
                            && link_d.year === 2019) {
                            return "#9467bd";
                        } else {
                            return "#33f01a";
                        }
                    })
            };
        })
    }
}
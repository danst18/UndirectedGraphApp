﻿$(function() { 

    WS.INodeWS.FindAllNodes(cbRenderNodes, cbError);

}); 


function cbRenderNodes(result) {

    headerDiv = document.getElementById("header");
    results = "Number of nodes: " + result.length + "<br/>";
    headerDiv.innerHTML = headerDiv.innerHTML + results;

    var nodes = [];
    for (var i = 0; i < result.length; i++) {
        nodes.push({
            group: 'nodes',
            data: {
                id: result[i].ID,
                name: result[i].Label
            },
            classes: 'nodeClass'
        });
    }

    var edges = [];
    for (var i = 0; i < result.length; i++) {
        for (var j = 0; j < result[i].GraphEdges.length; j++) {

            if (!findRepeatedEdge(edges, result[i].GraphEdges[j].ID, result[i].GraphEdges[j].RelatedID)) {

                edges.push({
                    group: 'edges',
                    data: {
                        source: result[i].GraphEdges[j].ID,
                        target: result[i].GraphEdges[j].RelatedID
                    }
                });
            }
        }
    }
    
    
    var cy = cytoscape({
        container: $('#cy')[0],

        style: cytoscape.stylesheet()
          .selector('.nodeClass')
            .css({
                'content': 'data(name)',
                'text-valign': 'center',
                'color': '#34495e',
                'width': '100px',
                'height': '100px',
                'border-width': '2px',
                'border-color': '#34495e',
                'background-color': '#ecf0f1',
            })
          .selector('edge')
            .css({
                'line-color': '#bdc3c7' 
            })
          .selector('.selected')
            .css({
                'background-color': '#e74c3c',
            })
          .selector('edge.selected')
            .css({
                'line-color': '#e74c3c',
                'width': '3px'
            }),


        elements: {
            nodes: nodes,
            edges: edges
        },

        layout: {
            name: 'random',
            padding: 30
        },

        ready: function () {
            window.cy = this;

            cy.userZoomingEnabled(false);
            cy.elements().unselectify();

            /* Tap events */
            cy.on('tap', '.nodeClass', function (e) {

                var node = e.cyTarget;
                node.toggleClass('selected');

                // remove selected elements if more than two nodes are selected, or if the shortest path 
                // has already been calculated (selected edges > 0)
                if (cy.nodes('.selected').length > 2 && cy.edges('.selected').length == 0) {
                    alert("You can only select two nodes");
                    cy.elements().removeClass("selected");
                } else if (cy.edges('.selected').length > 0) {
                    cy.elements().removeClass("selected");
                }

            });

            cy.on('tap', 'edge', function (e) {
                cy.elements().removeClass('selected');
            });

            cy.on('tap', function (e) {
                if (e.cyTarget === cy) {
                    cy.elements().removeClass('selected');
                }
            });


            /* Button events */
            $('#btnShortestPath').on('click', function () {

                // only calculate shortest path if there are two nodes selected
                if (cy.nodes('.selected').length == 2) {
                    var sourceNode = cy.nodes('.selected')[0].id();
                    var targetNode = cy.nodes('.selected')[1].id();

                    WS.IPathFinderWS.ShortestPath(sourceNode, targetNode, cbRenderShortestPath, cbError);
                } else {
                    alert("You have to select two nodes");
                }

            });

            $('#btnRedraw').on('click', function () {
                location.reload();
            });

        }
    });

}

function cbError() {
    alert("Error!");
}

function findRepeatedEdge(edges, id, relatedId) {

    for (var i = 0; i < edges.length; i++) {
        if (edges[i].data.source == relatedId && edges[i].data.target == id) {
            return true;
        }
    }
    return false;
}

function cbRenderShortestPath(result) {
    if (result.length != 0) {
        for (var i = 0; i < result.length; i++) {

            // add selected class to found nodes
            cy.nodes('[id="' + result[i].ID + '"]').addClass('selected');

            // add selected class to edges between the found nodes
            if (i != result.length - 1) {
                cy.edges('[source="' + result[i].ID + '"][target="' + result[i + 1].ID + '"]').addClass('selected');
                cy.edges('[source="' + result[i + 1].ID + '"][target="' + result[i].ID + '"]').addClass('selected');
            }
        }
    } else {
        // if no shortest path is found, unselect the nodes
        cy.nodes().removeClass('selected');
    }

}
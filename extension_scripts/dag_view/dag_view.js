// create a new dag
var g = new dagreD3.graphlib.Graph().setGraph({});
//Serialization: var j = JSON.stringify(dagreD3.graphlib.json.write(g))
// g = dagreD3.graphlib.json.read(JSON.parse(j))
//select group I'm going to work in
var svg, inner;

var presetDAG = {
  root_id: "tco7ypaw8pi",
  current_id: "tco7ypaw8pi",
  nodes: {
    tco7ypaw8pi: {
      name: "1",
      url: "http://cs.unc.edu/~porter/",
      element_html:
        "<p>\nOffice: 362 Sitterson Hall<br>\nEmail: porter [at] cs {dot} unc (dot) edu <br>\nPhone/Fax: (919) 590-6044<br>\n</p>",
      caption: "red",
      id: "tco7ypaw8pi",
      edges: ["1vzqqx08h4p"]
    },
    "1vzqqx08h4p": {
      name: "2",
      url: "http://cs.unc.edu/~porter/",
      element_html:
        "<p>\nDepartment of Computer Science<br>\nUniversity of North Carolina at Chapel Hill <br>\nCampus Box 3175, Brooks Computer Science Building<br>\nChapel Hill, NC 27599-3175 <br>\n</p>",
      caption: "blue",
      id: "1vzqqx08h4p",
      edges: ["t7s9bsuxo6c"]
    },
    t7s9bsuxo6c: {
      name: "3",
      url: "http://cs.unc.edu/~porter/",
      element_html:
        '<p>\nPh.D. in Computer Science, <a href="http://www.utexas.edu">The University of Texas at Austin,</a> 2010.<br>\nM.S. in Computer Science, <a href="http://www.utexas.edu">The University of Texas at Austin,</a> 2007.<br>\nB.A. in Computer Science and Mathematics, <a href="http://www.hendrix.edu">Hendrix College,</a> 2003.<br>\n</p>',
      caption: "green",
      id: "t7s9bsuxo6c",
      edges: ["ex163y27q3c"]
    },
    ex163y27q3c: {
      name: "4",
      url: "http://cs.unc.edu/~porter/",
      element_html:
        "<p>My research develops better abstractions for managing concurrency and\nsecurity, primarily in the operating system, and extends these abstractions to other portions of the\ntechnology stack as appropriate.</p>",
      caption: "orange",
      id: "ex163y27q3c",
      edges: ["22goctl2pc8"]
    },
    "22goctl2pc8": {
      name: "5",
      url: "http://cs.unc.edu/~porter/",
      element_html:
        '<p>\n  During Fall 2017, I am a Visiting Assistant Professor\n  at <a href="http://www.gsd.inesc-id.pt/">the Distributed Systems\n  Group</a> at <a href="https://tecnico.ulisboa.pt/">Instituto Superior Técnico</a>.\n  </p>',
      caption: "ok",
      id: "22goctl2pc8",
      edges: []
    }
  }
};
// Set up zoom support
var zoom = d3.zoom().on("zoom", function() {
  inner.attr("transform", d3.event.transform);
});

// Create the renderer
var render = new dagreD3.render();

/**************test code***************/
window.onload = main;
function main() {
  (svg = d3.select("svg")), (inner = svg.select("g"));
  //inner.call(zoom);
  populateDAG(3);
}
/*************************************************/
function populateDAG(elems) {
  setGraph(presetDAG);
}

function addNewChildToGraph() {
  var rand = Math.random().toString();
  g.setNode(rand, { shape: "circle", id: rand, label: rand.substr(0, 4) });
  update();
}

function setGraph(currDAG) {
  //Add to g
  for (var currNode in currDAG.nodes) {
    g.setNode(currNode, {
      shape: "circle",
      id: currNode,
      label: currNode.substr(0, 4)
    });
  }
  //Connect dag
  connectDAG(currDAG, currDAG.nodes[currDAG.root_id]);
  update();
}

/******Helper Fns**************/
// Run the renderer. This is what draws the final graph.
// Recursively Connect all nodes to their children in the graph g
function connectDAG(currDAG, currNode) {
  if (currNode.edges == undefined || currNode.edges.length == 0) {
    return;
  }
  for (var i = 0; i < currNode.edges.length; i++) {
    g.setEdge(currNode.id, currNode.edges[i], { label: "" });
    connectDAG(currDAG, currDAG.nodes[currNode.edges[i]]);
  }
}

function update() {
  render(inner, g);
  attachEventListeners();
}

function attachEventListeners() {
  /* Fields */
  var node_mouse_down_on = null;
  var nodeL = inner.selectAll("g.nodes")._groups[0][0].childNodes;
  var isMouseDown = false;
  var menu = document.getElementById("ctxmenu");
  var node_right_clicked_on = null;
  /* Iterate over nodes, add the events */
  document.getElementById("addNode").onclick = function(e) {
    addNewChildToGraph();
  };
  document.getElementById("delNode").onclick = function(e) {
    removeNode(node_right_clicked_on);
  };
  // /* Document event listeners */
  document.onclick = function(e) {
    var isLeftClicked = e.button == 0;
    if (isLeftClicked) {
      menu.className = "hide";
      node_right_clicked_on = null;
    }
  };
  document.onmouseup = function() {
    isMouseDown = false;
    //clears all node's colors on click up
    nodeL.forEach(node_i => {
      node_i.children[0].style = "fill:clear";
    });
  };

  for (var i = 0; i < nodeL.length; i++) {
    nodeL[i].addEventListener("mousedown", function(e) {
      isMouseDown = true;
      var node_id_clicked_on = e.target.parentNode.id;
      node_mouse_down_on = node_id_clicked_on;
      e.target.style = "fill:green";
    });

    nodeL[i].addEventListener("mouseenter", function(e) {
      var node_id_mouseentered_on = e.target.id;
      if (!isMouseDown) {
        e.target.children[0].style = "fill:green";
      } else if (node_mouse_down_on != node_id_mouseentered_on) {
        e.target.children[0].style = "fill:red";
      }
    });

    nodeL[i].addEventListener("mouseleave", function(e) {
      var node_id_mouseentered_on = e.target.id;
      if (
        node_mouse_down_on != node_id_mouseentered_on ||
        node_mouse_down_on == null
      ) {
        e.target.children[0].style = "fill:clear";
      }
    });

    nodeL[i].addEventListener("mouseup", function(e) {
      var node_id_mousereleased_on = e.target.parentNode.id;
      if (
        node_mouse_down_on != null &&
        node_mouse_down_on != node_id_mousereleased_on
      ) {
        var node_id_hovered_on = e.target.id;
        console.log(
          "Linked: " + node_mouse_down_on + " to: " + node_id_mousereleased_on
        );
        g.setEdge(node_mouse_down_on, node_id_mousereleased_on, { label: "" });
        update();
        node_mouse_down_on = null;
      }
    });

    nodeL[i].addEventListener("contextmenu", function(e) {
      //By default the click results to the circle, so here we select the parent, which is the "g" node.
      node_right_clicked_on = e.target.parentNode.id;
      console.log(e.target);

      var menu = document.getElementById("ctxmenu");
      menu.classList.toggle("hide");
      menu.style.left = e.clientX + "px";
      menu.style.top = e.clientY + "px";
      e.preventDefault();
    });
  }
}

//remove node from DAG and graph
function removeNode(node_to_remove) {
  g.removeNode(node_to_remove);
  update();
}

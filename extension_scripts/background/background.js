// This is the main JSON object which holds a tutorial.

"use strict";
var tutorial = new recording();
function recording() {
  this.DAG = new graphlib.Graph().setGraph({});
  this.current_node_id = null;
  this.root_node_id = null;
  this.tutorial_name = "";
}
recording.prototype.toJSON = function(key) {
  return {
    DAG: exportDAG(this),
    current_node_id: this.current_node_id,
    root_node_id: this.root_node_id,
    tutorial_name: this.tutorial_name
  }; // everything that needs to get stored
};

function Node(title_text, url, entered_text, inserted_html) {
  this.title_text = title_text;
  this.url = url;
  this.entered_text = entered_text;
  this.html = inserted_html;
}

//On inserting a new node, generate a random id, and insert into the DAG.
//First inserted node is the root node.
function insertNewNode(tutorial, node_value) {
  /*Input: Node object*/
  var rand_id = Math.random()
    .toString(36)
    .slice(2);
  tutorial.DAG.setNode(
    rand_id,
    { shape: "circle", id: rand_id, node_value },
    { label: node_value.title_text }
  );
  if (tutorial.root_node_id == null) {
    tutorial.current_node_id = tutorial.root_node_id = rand_id;
    return;
  } else {
    tutorial.DAG.setEdge(tutorial.current_node_id, rand_id);
    tutorial.current_node_id = rand_id;
  }
}

function exportDAG(tutorial) {
  return graphlib.json.write(tutorial.DAG);
}

function importDAG(tutorial, json) {
  tutorial = JSON.stringify(json);
  tutorial.DAG = graphlib.json.read(tutorial.DAG);
}

//Retrieve a list of node ids stemming from the specified node_id
function getOutEdges(tutorial, node_id) {
  /*Input: String */
  //raw edges look like: [{v:, w:},{v:,w: },{v:,w:}]
  var raw_edges = tutorial.DAG.outEdges(node_id);
  var string_edges = [];
  raw_edges.forEach(function(raw_edge) {
    string_edges.push(raw_edge.w);
  });
  return string_edges; /* Output: Array of String node ids */
}

//This global variable is meant to maintain the button state across refreshed pages. For example, when you
//advance to the next link, you will maintain the button on the bottom right.
//This should probably be cleaned up and not be global.
var load_status = false;

//"html" : <html here>
//"entered_text" : This is the text the professor entered

//This background listener listens for comamnds from the content script. The commands are:
//Get: this returns the first itme in the stack
//Send: This adds an item to the stack
//Save: Right now this saves the recording stream and merges it into the DAG. In the future, a visualizaiton should\
//merge the DAG.
//Clear: This empties all of the items in the DAG and recording stream. (Say)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );

  switch (request.command) {
    case "addName":
      tutorial.tutorial_name = request.tutorial_name;
      sendResponse({ msg: "adding name", tutorial: exportDAG(tutorial) });
      break;

    case "peek":
      sendResponse({
        msg: "Background: sending over entire DAG",
        tutorial: JSON.stringify(tutorial)
      });
      break;

    case "get_next":
      if (typeof tutorial.DAG.node(request.next_id) == "undefined") {
        sendResponse({ msg: "Out of steps!", tutorial: null });
        break;
      }
      tutorial.current_node_id = request.next_id;
      sendResponse({
        msg: "Background: sending over entire DAG",
        tutorial: JSON.stringify(tutorial)
      });

      break;

    case "get_prev":
      console.log("Prev button clicked");
      break;

    case "get_options":
      console.log("Get options called");
      break;
    //This case is only used when recording steps. Adds a step to tutorial.
    case "record_action":
      console.log("Record action called");
      insertNewNode(
        tutorial,
        new Node(
          request.title_text,
          request.url,
          request.entered_text,
          request.html
        )
      );
      sendResponse({
        msg: "Background: Message received",
        enteredText: request.entered_text
      });
      break;

    //Sends the tutorial object to the content script
    case "save":
      console.log("Save hit");
      //When the tutorial starts the current node id is set to the root node ID to be the starting place.
      tutorial.current_node_id = tutorial.root_node_id;
      sendResponse("Save complete");

      break;

    //Deletes the recording
    case "clear":
      console.log("Background script: clicked clear button");
      tutorial = new recording();
      sendResponse("Clear complete");
      break;

    case "get-load-status":
      sendResponse(load_status);
      break;

    case "set-load-status":
      load_status = !load_status;
      sendResponse(load_status);
      break;

    default:
      console.log("Default case reached");
      break;
  }
});

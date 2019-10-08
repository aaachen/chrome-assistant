$(document).ready(function() {
  /*load data from background script*/

  chrome.runtime.sendMessage({ command: "get_recording_state" }, function(
    response
  ) {
    //sends a message to the recording_content_state, which turns off
    if (response.state == true) {
      $("#endR").prop("disabled", false);
      $("#startR").prop("disabled", true);
    }
  });
});

$("#back_button").click(function() {
  chrome.browserAction.setPopup({
    popup: "./html/popup.html"
  });
  //Changes page immediately
  window.location.href = "/html/popup.html";
});

/* On click functions for elements in popup.html */
$("#startR").on("click", function() {
  $("#endR").prop("disabled", false);
  $(this).prop("disabled", true);

  //sends a message to the background script recording_state.js.
  //This sets recording_enabled to true.
  chrome.runtime.sendMessage({ command: "start_recording" }, function(
    response
  ) {
    //sends a message to the recording_content_state, which turns on the
    //hotkey listener
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { command: "enable_hot_key" },
        function(responsee) {
          console.log("Enable hot key returns: " + responsee);
        }
      );
    });
  });
});

$("#endR").on("click", function() {
  console.log("endR click");
  $(this).prop("disabled", true);
  $("#startR").prop("disabled", false);
  chrome.runtime.sendMessage({ command: "end_recording" }, function(response) {
    //sends a message to the recording_content_state, which turns off
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { command: "disable_hot_key" },
        function(responsee) {
          console.log(responsee);
        }
      );
    });
  });
  chrome.runtime.sendMessage({ command: "save" }, function(response) {
    console.log(response);
  });
});

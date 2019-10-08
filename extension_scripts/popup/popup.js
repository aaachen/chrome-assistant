$(document).ready(function() {
  //Clear button clears list
  $("#clear_record").click(function() {
    //send data to server
    chrome.runtime.sendMessage({ command: "clear" }, function(response) {
      console.log(response);
    });
  });

  //Loads the record into the frame
  $("#load_record").click(function() {
    //send data to server
    console.log("Entering load record function");
    chrome.tabs.query({ active: true, currentWindow: true }, function(
      arrayOfTabs
    ) {
      // since only one tab should be active and in the current window at once
      // the return variable should only have one entry
      chrome.tabs.sendMessage(arrayOfTabs[0].id, { command: "load" }, function(
        response
      ) {
        console.log("Start action sent");
      }); //end send message
    }); //end query
  }); //end click

  $("#newR").on("click", function() {
    console.log("newR click");
    chrome.browserAction.setPopup({
      popup: "./html/new_record.html"
    });
    //Changes page immediately
    window.location.href = "/html/new_record.html";
  });
});

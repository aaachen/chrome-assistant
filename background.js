//This is the main JSON object which holds a tutorial. 
var tutorial = { 
    name : "", //Plaintext, instructor specified
    id :"",    //Autogenerated
    current_url_num : 0, //index of current url obj in urls array
    current_step_num : 0,//index of current step in steps array 
    urls : [ //URLS is an array
      // { url: "",
      //   steps:[ 
      //   {
      //   caption:"",  //<- This instructor defined text
      //   element_html: "" //<- Outer and inner HTML of selected element
      //   }
      // ],
      // },
    ],
};

function get_current_url_obj() {
  if (tutorial.urls.length > 0){
    return tutorial.urls[this.current_url_num];
  }else{
    return {"url":"empty"}; //no items in tutorial
  }
}
function get_current_step_obj() { 
  if(get_current_url_obj().steps.length > 0){
    return get_current_url_obj().steps[this.current_step_num];
  }else{
    return {"url":"empty"}; //no items in tutorial
  }
}
function insert_new_url_obj(urlObj){ 
  tutorial.urls.push(urlObj); 
  tutorial.current_url_num++;
  tutorial.current_step_num = 0;
}
function insert_new_step_obj(stepObj){ 
  tutorial.urls[tutorial.current_url_num].steps.push(stepObj); 
  tutorial.current_step_num++;
}
 
//This function increments the next step and return true if there
//is another step available. It returns false if there are no more steps.
function incrementStep(tutorialObj){
        //When the user requests the next step, we advance the url index and 
        //if the length has been reached on steps, we increment the url index
        console.log(JSON.stringify(tutorialObj));
        tutorialObj.current_step_num++;
        if(tutorialObj.current_step_num == tutorialObj.urls[tutorialObj.current_url_num].steps.length){
          tutorialObj.current_step_num = 0;
          tutorialObj.current_url_num++;
          if(tutorialObj.current_url_num == tutorialObj.urls.length){
            //No more steps available!
            return false;
          }
        }
        return true;
}

//This global variable is meant to maintain the button state across refreshed pages. For example, when you
//advance to the next link, you will maintain the button on the bottom right.  
//This should probably be cleaned up
var load_status = false; 



//"element_html" : <html here>
//"entered_text" : This is the text the professor entered

//This background listener listens for comamnds from the content script. The commands are:
//Get: this returns the first itme in the stack
//Send: This adds an item to the stack
//Save: For now all this does is return the entire stack jsonified. This will send to the server later
//Clear: This empties all of the items in the list. (Say)
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

    switch(request.command){
        case "peek": 
        sendResponse({msg: "Background: sending top element from background script", tutorial:tutorial});  
        break;

        case "get_step_and_increment":
       
          sendResponse({msg: "Background: sending next element from background script", tutorial:tutorial});
        incrementStep(tutorial);
        break;

        //This case is only used when recording steps
        case "record_action":
        //If the instructor's next step is on a new url:
        if(request.url !=  get_current_url_obj().url){
          insert_new_url_obj({"url": request.url, "steps":[{"caption": request.entered_text, "element_html" :request.element_html}] });
        }else{
          //If the instructor added a second step on the same webpage, push onto the steps array
          insert_new_step_obj({"caption": request.entered_text, "element_html" :request.element_html});
        }
        
        sendResponse({msg: "Background: Message received", enteredText:request.entered_text});
        break;

        case "save":
        sendResponse(JSON.stringify(tutorial));
        break; 

        case "clear":
        tutorial = { 
          name : "", //Plaintext, instructor specified
          id :"",    //Autogenerated
          current_url_num : 0, //index of current url obj in urls array
          current_step_num : 0,//index of current step in steps array 
          urls : [ //URLS is an array
            // { url: "",
            //   steps:[ 
            //   {
            //   caption:"",  //<- This instructor defined text
            //   element_html: "" //<- Outer and inner HTML of selected element
            //   }
            // ],
            // },
          ],
      };
        sendResponse("CLEARED");
        break; 
        
        case "get-load-status":
        sendResponse(load_status);
        break; 

        case "set-load-status":
        //Resets the index to 0 to view tutorial from beginning
        tutorial.current_step_num = 0;
        tutorial.current_url_num = 0;
        load_status = !load_status;
        sendResponse(load_status);
        break;
        
        default: 
        break;
    }


  });






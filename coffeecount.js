// PuckCoffeeCount
// ---------------
// DroidScript (http://droidscript.org/) app to log coffee count by 
// clicking the PuckJS (https://www.espruino.com/Puck.js).
//
// It will speak to you when you click the puck.  Quickly double click puck to reset counter/
//
// Note: You need to leave app on and in the background... 
//
// Ensure DroidScript setup correctly (with Location Permissions) and has the PuckJS plugin installed

app.LoadPlugin( "PuckJS" ); //PuckJS plugin.

function OnStart(){
    var count = 0, // in memory count
        countHndle = "coffeecount", //'localStorage' data name handle
        file = countHndle, // File to dump our data to
        countText = app.CreateText(), // main ui text widget        
        resetTimeout = 500; // how long, in ms, to wait for a double click
        lastClickTime = 0; //time in ms since last click
    
    // Update ui with current count or start message
    var refreshCountText = function(){
        countText.SetText(count == 0 ? "Press PuckJS to start counting" :  "Count: " + count);
    };
    
    // Reset counter back to 0
    var resetCount = function(){
        count = 0;
        app.SaveNumber(countHndle, count, file);
        refreshCountText();
        app.TextToSpeech("Counter reset");
    };
    
    // Try and pull old val from storage
    count = app.LoadNumber(countHndle, 0, file);
    
    //Create a main layout.
    lay = app.CreateLayout( "Linear", "VCenter,FillXY" );    
    
    // Init our main count labellabel
    countText.SetTextSize("22");
    countText.SetMargins(0, 0, 0, 0.05);
    refreshCountText();
    lay.AddChild(countText);
        
    // Counter reset btn
    rstBtn = app.CreateButton('Reset', 0.5, 0.1);
    rstBtn.SetOnLongTouch(resetCount);
    lay.AddChild(rstBtn);
    
    //Add the main layout to our app.
    app.AddLayout( lay );
    
    //Set system volume level for text to speach
    app.SetRingerMode( "normal" );
    app.SetVolume( "System", 0.5 );
    
    // PuckJS init code and btn listener
    PuckJS = app.CreatePuckJS();
    PuckJS.SetOnConnect(function onPuckConnect(){
        PuckJS.WatchButton( true );
    });
    
    PuckJS.SetOnButton(function onPuckClick( isPushed ){
        if( isPushed == 1 ){
            var now = new Date();
            now = now.getTime();
            
            // If a quick double click, reset the couter and return early
            if(lastClickTime > 0 && now - lastClickTime < resetTimeout){
                resetCount();
                return;
            }
                
            // update last click to nwo
            lastClickTime = now;
            
            // Save number to storage, update ui and inform user 
            app.SaveNumber(countHndle, ++count, file);
            refreshCountText();
            app.TextToSpeech(count);
        }
    });

    //Start scanning for the PuckJS.
    PuckJS.Scan( "Puck" );
    
    //Tell user we are ready.
    app.TextToSpeech( "Please connect to puck" ); 
}

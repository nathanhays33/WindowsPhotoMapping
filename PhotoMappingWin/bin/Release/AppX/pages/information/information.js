// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/information/information.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            
            if (Data.loc != null) {
                if (typeof Data.loc.locationStatus === 'undefined') {
                    //  var element = document.getElementById("fromLocation");
                    var message = getLocation(Data.loc.coordinate.latitude, Data.loc.coordinate.longitude, true);
                    //      WinJS.Utilities.setInnerHTML(element, message);
                }
            }

                if(trailVersion){
                    document.getElementById("type").innerHTML = "Trial Version";
                }
                else {
                    document.getElementById("type").innerHTML = "Paid Version";
                }
                if (typeof Data.photoArray != 'undefined') {
                    document.getElementById("photoCount").innerHTML = Data.photoArray.length;
                    document.getElementById("geoTagCount").innerHTML = Data.count;
                }
                else {
                    document.getElementById("photoCount").innerHTML = 0;
                    document.getElementById("geoTagCount").innerHTML = 0;
                }
                
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();

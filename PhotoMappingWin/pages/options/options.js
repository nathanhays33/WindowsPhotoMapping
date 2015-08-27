// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511

var avgPushPin = null;
var connectPins = null;
var userPin = null;

(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/options/options.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.


        ready: function (element, options) {
            // TODO: Initialize the page here.
            avgPushPin = document.getElementById("averageMarker");
            connectPins = document.getElementById("connectPins");
            userPin = document.getElementById("userPin");

            if (Options.connect) {
                connectPins.checked = true;
            }

            if (Options.avgMarker) {
                avgPushPin.checked = true;
            }
            if (Options.userMarker) {
                userPin.checked = true;
            }
            if (trailVersion) {
                userPin.disabled = true;
                document.getElementById("locationLabel").innerHTML = "Show your location (disabled for Trial Version)";
                document.getElementById("location").innerHTML = "Disabled for Trial Version";
            }


            var back = document.getElementById("backButton");
            back.addEventListener("click", function () { goToSection("/pages/home/home.html"); }, false);

            function goToSection(section) {
                Options.avgMarker = avgPushPin.checked;
                Options.connect = connectPins.checked;
                Options.userMarker = userPin.checked;
                WinJS.Navigation.navigate(section);
            }

            if (Data.loc != null) {
                if (typeof Data.loc.locationStatus === 'undefined') {
                    //  var element = document.getElementById("fromLocation");
                           var message = getLocation(Data.loc.coordinate.latitude, Data.loc.coordinate.longitude, true);
                    //      WinJS.Utilities.setInnerHTML(element, message);
                }
            }
        },
       
        unload: function () {
            // TODO: Respond to navigations away from this page.

            Options.avgMarker = avgPushPin.checked;
            Options.connect = connectPins.checked;
            Options.userMarker = userPin.checked;
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();

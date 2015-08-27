var beenCalled = false;
var map, mapCenter, imageFile, searchManager, directionsManager, loc = null;

(function () {
    "use strict";

    var defaultInfobox = null;
    var homePage = WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            if (!trailVersion) {
                getloc();
            }

            /** Photo Sharing **/
            var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.addEventListener("datarequested", sharePicture);

            function sharePicture(e) {
                if (imageFile != null) {
                    var request = e.request;
                    request.data.properties.title = "Photo";
                    request.data.setStorageItems([imageFile.file]);
                }
            }

            Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: showMap, culture: "en-us", homeRegion: "US" });

            function showMap() {
                
                /** Show Map ***/
                if (mapCenter === null) {
                    mapCenter = new Microsoft.Maps.Location(39, -101);

                }
                var mapOptions =
                {
                    credentials: "AqfnXhZWBtdVJy2KP_htNYGJJ5O7BvEhJjGZHxt2lSlN7r8B1SFfTU3P93f0auo4",
                    center: mapCenter,
                    zoom: 4
                };
                var mapDiv = document.getElementById("mapDiv");
                map = new Microsoft.Maps.Map(mapDiv, mapOptions);

                /*
                if (Data.loc === null && Options.userMarker === true) {
                    getloc();
                }
                else {
                    initMap();
                }
                */

                initMap();
            }
            function showNoPhotoDialog() {
                var msg = new Windows.UI.Popups.MessageDialog("Will you like to add some photos?",
                                                                  "No Images");
                //Add buttons and set their callback functions
                msg.commands.append(new Windows.UI.Popups.UICommand("OK",
                   function (command) {
                       WinJS.Navigation.navigate("/pages/photoPicker/photoPicker.html");
                   }));
                beenCalled = true;
                msg.commands.append(new Windows.UI.Popups.UICommand("Cancel",
                   function (command) {

                   }));
                msg.showAsync();
            }


            /*** Get user location ***/
            function getloc() {
                if (loc == null) {
                    loc = new Windows.Devices.Geolocation.Geolocator();
                }
                if (loc != null) {
                    loc.getGeopositionAsync().then(getPositionHandler, errorHandler);
                }
            }

            function getPositionHandler(pos) {
                Data.loc = pos;
             //   initMap();
                /*
                document.getElementById('latitude').innerHTML = pos.coordinate.latitude;
                document.getElementById('longitude').innerHTML = pos.coordinate.longitude;
                document.getElementById('accuracy').innerHTML = pos.coordinate.accuracy;
                document.getElementById('geolocatorStatus').innerHTML =
                        getStatusString(loc.locationStatus);
                        */
            }

            function errorHandler(e) {

                var t = e.message;
                initMap();
                /*
                document.getElementById('errormsg').innerHTML = e.message;
                // Display an appropriate error message based on the location status.
                document.getElementById('geolocatorStatus').innerHTML =
                    getStatusString(loc.locationStatus);
                    */
            }

            function getStatusString(locStatus) {
                switch (locStatus) {
                    case Windows.Devices.Geolocation.PositionStatus.ready:
                        // Location data is available
                        return "Location is available.";
                        break;
                    case Windows.Devices.Geolocation.PositionStatus.initializing:
                        // This status indicates that a location device is still initializing
                        return "Location devices are still initializing.";
                        break;
                    case Windows.Devices.Geolocation.PositionStatus.noData:
                        // No location data is currently available 
                        return "Data from location services is currently unavailable.";
                        break;
                    case Windows.Devices.Geolocation.PositionStatus.disabled:
                        // The app doesn't have permission to access location,
                        // either because location has been turned off.
                        return "Your location is currently turned off. " +
                            "Change your settings through the Settings charm " +
                            " to turn it back on.";
                        break;
                    case Windows.Devices.Geolocation.PositionStatus.notInitialized:
                        // This status indicates that the app has not yet requested
                        // location data by calling GetGeolocationAsync() or 
                        // registering an event handler for the positionChanged event. 
                        return "Location status is not initialized because " +
                            "the app has not requested location data.";
                        break;
                    case Windows.Devices.Geolocation.PositionStatus.notAvailable:
                        // Location is not available on this version of Windows
                        return "You do not have the required location services " +
                            "present on your system.";
                        break;
                    default:
                        break;
                }
            }

            function initMap() {
                if (Data.loc != null && Options.userMarker === true) {
                    if (typeof Data.loc.locationStatus === 'undefined') {
                        var offset = new Microsoft.Maps.Point(0, 5);
                        var pushpinOptions = { icon: '/images/ic_user_marker.png', visible: true, textOffset: offset };
                        var pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(Data.loc.coordinate.latitude, Data.loc.coordinate.longitude), pushpinOptions);
                        Microsoft.Maps.Events.addHandler(pushpin, 'mouseup', userInfoBox);
                        map.entities.push(pushpin);
                    }
                }

               if (typeof Data.photoArray != 'undefined') {
                   var locationArray = new Array();
                    for (var i in Data.photoArray) {
                        if (Data.photoArray[i].longitude != null) {               
                            var location = new Microsoft.Maps.Location(Data.photoArray[i].latitude, Data.photoArray[i].longitude);
                            locationArray.push(location);
                            var pin;
                            if (Data.photoArray[i].marker === false) {
                                pin = new Microsoft.Maps.Pushpin(location, { draggable: false, text: i.toString() });
                            }
                            else {
                                pin = new Microsoft.Maps.Pushpin(location, { draggable: false, text: i.toString(), icon: '/images/blue_marker.png' });
                            }
                            Microsoft.Maps.Events.addHandler(pin, 'mouseup', DisplayLoc);
                            map.entities.push(pin);
                        }
                    }
                  //  var mapOptions
                    if (Data.count > 1) {
                        mapCenter = new Microsoft.Maps.Location(Data.avgLogitude / Data.count, Data.avgLatitude / Data.count);
                        if (Options.avgMarker) {
                            //Average Marker
                            var pin = new Microsoft.Maps.Pushpin(mapCenter, { draggable: false, text: "Avg" });
                            Microsoft.Maps.Events.addHandler(pin, 'mouseup', avgInfoBox);
                            map.entities.push(pin);
                        }
                        if (Options.connect) {
                            //Adding Polyline
                            var line = new Microsoft.Maps.Polyline(locationArray);
                            map.entities.push(line);
                        }

                        //Center Map
                        /** Center Map ***/
                        //var viewRect = Microsoft.Maps.LocationRect.fromCorners(new Microsoft.Maps.Location(40, -120), new Microsoft.Maps.Location(35, -115));
                        map.setView({ center: mapCenter });
                        map.setView({ zoom: 8});
                    }
                    else {
                        mapCenter = new Microsoft.Maps.Location(39,-101);
                    }
               }

               function avgInfoBox(e) {
                   var infoboxOptions = {
                       width: 200, height: 100, showCloseButton: true, zIndex: 0, offset:
                           new Microsoft.Maps.Point(10, 0), showPointer: true, title: 'Average Location for ' + Data.count + ' images',
                           description: (Data.avgLogitude / Data.count) +  " , " + (Data.avgLatitude / Data.count)
                   };
                   defaultInfobox = new Microsoft.Maps.Infobox(map.getCenter(), infoboxOptions);
                   defaultInfobox.setLocation(pin.getLocation());
                   map.entities.push(defaultInfobox);
               }

               function userInfoBox(e) {
                   var message = 'Accuracy: ' + Data.loc.coordinate.accuracy + "meters";
                   var infoboxOptions = {
                       width: 200, height: 100, showCloseButton: true, zIndex: 0, offset:
                           new Microsoft.Maps.Point(10, 0), showPointer: true, title: 'You are here',
                       description: message
                   };
                   defaultInfobox = new Microsoft.Maps.Infobox(map.getCenter(), infoboxOptions);
                   defaultInfobox.setLocation(pushpin.getLocation());
                   map.entities.push(defaultInfobox);
               }

               function DisplayLoc(e) {
                   if (e.targetType == 'pushpin') {
                       document.getElementById("mapBar").style.visibility = "visible";
                       document.getElementById("mapDiv").style.width= "80%";
                       var pinLoc = e.target.getLocation();
                       var pinText = e.target.getText();

                       if (defaultInfobox != null) {
                           hideInfobox();
                       }

                       imageFile = Data.photoArray[pinText];
                       getLocation(Data.photoArray[pinText].latitude, Data.photoArray[pinText].longitude, true);

                       if (Data.loc != null) {
                           if (typeof Data.loc.locationStatus === 'undefined') {
                               var d = getDistanceFromLatLonInKm(Data.photoArray[pinText].latitude, Data.photoArray[pinText].longitude,
                                   Data.loc.coordinate.latitude, Data.loc.coordinate.longitude);
                               var element = document.getElementById("fromLocation");
                               WinJS.Utilities.setInnerHTML(element, d + " km");
                           }
                       }
                       if (trailVersion) {
                           var element = document.getElementById("fromLocation");
                           WinJS.Utilities.setInnerHTML(element,"Disabled in Trial Version");
                       }

                       var contentGrid = document.getElementById("contentGrid");
                       WinJS.Binding.processAll(contentGrid, Data.photoArray[pinText]);
                   }
               }

               function hideInfobox() {
                   defaultInfobox.setOptions({ visible: false });
               }

            }

            if (
                WinJS.Application.sessionState.previousExecutionState
                === Windows.ApplicationModel.Activation.ApplicationExecutionState.terminated) {
                var mruToken = WinJS.Application.sessionState.mruToken;
                if (mruToken) {


                }

            }
            if ((typeof Data.photoArray === 'undefined') && !beenCalled) {
                showNoPhotoDialog();
            }
        },

    });
})();

function GetRoute() {
    ClearMap();

    if (directionsManager) {
        directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.driving });

        var startWaypoint = new Microsoft.Maps.Directions.Waypoint(
            { address: document.getElementById('txtStart').value });

        var endWaypoint = new Microsoft.Maps.Directions.Waypoint(
            { address: document.getElementById('txtEnd').value });

        directionsManager.addWaypoint(startWaypoint);
        directionsManager.addWaypoint(endWaypoint);

        directionsManager.setRenderOptions({ itineraryContainer: document.getElementById('itineraryDiv') });
        directionsManager.calculateDirections();
    } else {
        Microsoft.Maps.loadModule('Microsoft.Maps.Directions', {
            callback: function () {
                directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);

                GetRoute();
            }
        });
    }
}

function ClearMap() {
    map.entities.clear();

    if (directionsManager) {
        directionsManager.resetDirections();
    }
}




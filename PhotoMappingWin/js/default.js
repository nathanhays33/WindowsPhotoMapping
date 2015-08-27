// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232506

var currentApp, licenseInformation = null;
var trailVersion = null;

(function () {
    "use strict";

    // Use this object to store info about the loaded image.
    var photoObject =
    {
        src: null,
        displayName: null,
        name: null,
        path: null,
        dateCreated: null,
        latitude: null,
        longitude: null,
        make: null,
        model: null,
        image: null,
        distance: null,
        file: null,
        marker: null
    };

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {

            // Save the previous execution state. 
            WinJS.Application.sessionState.previousExecutionState =
                args.detail.previousExecutionState;
            
            WinJS.Namespace.define("Data", {
                photoArray: decodedArray,
                avgLogitude: null,
                avgLatitude: null,
                count: 0,
                loc:null
            });

            WinJS.Namespace.define("Options", {
                avgMarker: false,
                connect: false,
                userMarker: false
            });
            /*
            initializeLicense();

            function initializeLicense() {
                // some app initialization functions

                // Initialize the license info for use in the app that is uploaded to the Store.
                // uncomment for release
                 currentApp = Windows.ApplicationModel.Store.CurrentApp;

                // Initialize the license info for testing.
                // comment the next line for release
             //   currentApp = Windows.ApplicationModel.Store.CurrentAppSimulator;

                // Get the license info
                licenseInformation = currentApp.licenseInformation;

                // Register for the license state change event.
                licenseInformation.addEventListener("licensechanged", reloadLicense);

                trailVersion = licenseInformation.isTrial;

                // other app initializations function

           
            }

            function reloadLicense() {
                // (code is in next steps)
                trailVersion = licenseInformation.isTrial;

            }

            */
            trailVersion = false;

            /*
            function loadTrialModeProxyFile() {
                var currentApp = Windows.ApplicationModel.Store.CurrentAppSimulator;
                Windows.ApplicationModel.Package.current.installedLocation.getFolderAsync("data").done(
                    function (folder) {
                        folder.getFileAsync("WindowsStoreProxy.xml").done(
                            function (file) {
                                //currentApp.licenseInformation.addEventListener("licensechanged", trialModeRefreshScenario);
                                Windows.ApplicationModel.Store.CurrentAppSimulator.reloadSimulatorAsync(file).done();
                                licenseInformation = currentApp.licenseInformation;
                                trailVersion = licenseInformation.isTrial;
                                trailVersion = false;
                                licenseInformation.addEventListener("licensechanged", reloadLicense);
                            });
                    });
            }

            function reloadLicense() {
                trailVersion = licenseInformation.isTrial;
            }
            */


            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
                var mruEntries = Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.entries;
                if (mruEntries.size > 0) {
                  var  publicPhotoArray = new Array();
                  mruEntries.forEach(function (entry) {
                       /** Decode token **/
                      Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.getFileAsync(entry.token).done(
                          function (retrievedFile) {
                              /** put the files into an object**/
                              publicPhotoArray.push(retrievedFile);
                          },
                          function (error) {
                              
                          }
                  );
                        // Continue processing the MRU entry
                  });
                  var decodedArray = decodePicture(publicPhotoArray, false, false);
                  Data.photoArray = decodedArray;
                } else {
                    // Handle empty MRU
                }
            }

            nav.onnavigated = function (evt) {
                var contentHost =
                    document.body.querySelector("#contenthost"),
                    url = evt.detail.location;

                // Remove existing content from the host element.
                WinJS.Utilities.empty(contentHost);

                // Display the new page in the content host.
                WinJS.UI.Pages.render(url, contentHost);
            }


            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    app.start();
})();


var photoArray = new Array();
var avgLat = 0;
var avgLog = 0;
var count = 0;

function decodePicture(files, updateStorage, removePhoto) {
    Data.avgLogitude = 0;
    Data.avgLatitude = 0;
    Data.count = 0;
    count = 0;
    if (!removePhoto) {
        photoArray.length = 0;
    }
    if (updateStorage === true) {
        Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.clear();
    }
    if (files.length > 0) {
        var index = 0;
        for (var y = 0; y < files.length; y++) {
            getFileProperties(files[y],y);
           (function (y) {
               setTimeout(function () {
                   getImageProperties(files[y], y);

               }, 300);
           })(y);

        }
        avgLat = avgLat / count;
        avgLot = avgLog / count;
        return photoArray;
    } else {
        // The picker was dismissed with no selected file
        WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
        return null;
    }
}

function errorFile() {
    console.log("File Error ");
}

function errorImage() {
    console.log("Image Error ");
}

function getFileProperties(file, updateStorage) {
    var imageBlob = URL.createObjectURL(file, { oneTimeOnly: false });
    photoArray.push({
        displayNam: file.displayName,
        name: file.name,
        src: imageBlob,
        path: file.path,
        dateCreated: file.dateCreated,
        file: file,
        marker: false
    });
    if (updateStorage === true) {
        WinJS.Application.sessionState.mruToken =
            Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.add(file);
    }
    return file;
}


function getImageProperties(file, int) {
    file.properties.getImagePropertiesAsync().then(
        function (imageProperties) {
            if (imageProperties.longitude != null) {
                photoArray[int].longitude = imageProperties.longitude;
                photoArray[int].latitude = imageProperties.latitude;
                count++;
                Data.count = count;
                Data.avgLogitude += photoArray[int].latitude;
                Data.avgLatitude += photoArray[int].longitude;
                photoArray[int].image = "///images/mapIcon.png";
            }
            else {
                photoArray[int].image = "///images/map_blank.png";
                photoArray[int].longitude = null;
                photoArray[int].latitude = null;
            }
            Data.photoArray[int].make = imageProperties.cameraManufacturer.toString();
            Data.photoArray[int].model = imageProperties.cameraModel.toString();
        }, function onReject(err) { console.log('NOT OK', err.stack) })
        .done(function () {
            return true;
        });
}

function getLocation(lat, lng, innerHtml) {
    var location = '';
    var query = lat + "," + lng;
    var searchRequest =
        'http://dev.virtualearth.net/REST/v1/Locations/' + query + '?o=json&key=AqfnXhZWBtdVJy2KP_htNYGJJ5O7BvEhJjGZHxt2lSlN7r8B1SFfTU3P93f0auo4';
    var promise = WinJS.xhr({ url: searchRequest });
    promise.done(
     // Complete function
     function (response) {
         var json = JSON.parse
             (
             response
             .responseText);
         if (json.resourceSets[0].resources.length != 0) {
             location = json.resourceSets[0].resources[0].name;
             if (innerHtml) {
                 var element = document.getElementById("location");
                 WinJS.Utilities.setInnerHTML(element, location);
             }
         }
         return location;
     },

     // Error function
     function (response) {
         // handle error here...
         return location;
     }
  );


}

function getLocationLatLng(query) {
    var coordinates = new Array();
    var location = 0;
    ///var query = city + "," + state;
    var searchRequest =
        'http://dev.virtualearth.net/REST/v1/Locations/' + query + '?output=json&key=AqfnXhZWBtdVJy2KP_htNYGJJ5O7BvEhJjGZHxt2lSlN7r8B1SFfTU3P93f0auo4';
    var promise = WinJS.xhr({ url: searchRequest });
    promise.done(
     // Complete function
     function (response) {
         var json = JSON.parse
             (
             response
             .responseText);
         coordinates.push(json.resourceSets[0].resources[0].point.coordinates[0]);
         coordinates.push(json.resourceSets[0].resources[0].point.coordinates[1]);
          return coordinates;

     },

     // Error function
     function (response) {
         // handle error here...
         coordinates.push(0);
         coordinates.push(0);
         return coordinates;
     }
  );
}

function onCancel() {

}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return Math.round(d);
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}
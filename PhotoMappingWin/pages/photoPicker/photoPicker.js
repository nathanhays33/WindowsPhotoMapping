var pictureListDOM;
var photoArray = new Array();
var currentPhotoArray = new Array();
var index = 0;
var imageFile = null;

var resetButton;
var exportButton;
var distanceValue = 5;
var folderString = null;

var searchDOM;
var distanceDOM;
var clearButton;
var addButton;

(function () {
    "use strict";

    WinJS.Namespace.define("SearchUtils",
  {
      querySubmittedHandler: WinJS.UI.eventHandler(querySubmittedHandler)
  }
   );

    function querySubmittedHandler(args) {
        var x = args.detail.queryText;
        if (x === "") {
            showErrorMessage("No Location was entered");
        }
        else if (typeof Data.photoArray === 'undefined') {
            showErrorMessage("No photos have been loaded. Use the 'Get Photo' button to load photos");
        }
        else if (Data.photoArray === 'undefined') {
            showErrorMessage("No photos have been loaded. Use the 'Get Photo' button to load photos");
        }
        else {
            folderString = x + "_" +  distanceValue.toString() +"km";
            var coordinates = new Array();
            var location = 0;
            var searchRequest =
                'http://dev.virtualearth.net/REST/v1/Locations/' + x + '?output=json&key=AqfnXhZWBtdVJy2KP_htNYGJJ5O7BvEhJjGZHxt2lSlN7r8B1SFfTU3P93f0auo4';
            var promise = WinJS.xhr({ url: searchRequest });
            promise.done(
             // Complete function
             function (response) {
                 var json = JSON.parse
                     (
                     response
                     .responseText);
                 if (json.resourceSets[0].resources.length === 0) {
                     showErrorMessage("No Coordinate was found. Reason for this is: No Internet, Misspelled location, or Wrong Format");
                 }
                 else {
                     coordinates.push(json.resourceSets[0].resources[0].point.coordinates[0]);
                     coordinates.push(json.resourceSets[0].resources[0].point.coordinates[1]);
                     searchPhotos(coordinates);
                 }
             },
             // Error function
             function (response) {
                 showErrorMessage("No Coordinate was found. Reason for this is: No Internet, Misspelled location, or Wrong Format");
             }
          );
        }
    }

    function searchPhotos(coordinates) {
        var searchPhotoArray = new Array();
        for (var i = 0; i < Data.photoArray.length; i++) {

            var distance = getDistanceFromLatLonInKm(coordinates[0], coordinates[1],
                     Data.photoArray[i].latitude, Data.photoArray[i].longitude);
            if (distance < distanceValue) {
                   Data.photoArray[i].distance = distance.toString();
                   searchPhotoArray.push(Data.photoArray[i]);
            }
        }

        if (searchPhotoArray.length === 0) {
            showErrorMessage("No photos was found with those parameters")
        }
        else {
            resetButton.style.visibility = 'visible';
            exportButton.style.visibility = 'visible';
            updateList(searchPhotoArray, true);
        }
    }

    var homePage = WinJS.UI.Pages.define("/pages/photoPicker/photoPicker.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.

            var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.addEventListener("datarequested", sharePicture);
            function sharePicture(e) {
                if (imageFile != null) {
                    var request = e.request;
                    request.data.properties.title = "Photo";
                    request.data.setStorageItems([imageFile.file]);
                }
            }


            WinJS.Namespace.define("User", {
                photosList: new WinJS.Binding.List(Data.photoArray)
            });

            document.getElementById("getPhotoButton")
                 .addEventListener("click", this.getPhotoButtonClickHandler, false);

            addButton = document.getElementById("addPhotoButton");
            addButton.addEventListener("click", this.getPhotoButtonClickHandler, false);
            addButton.style.visibility = 'hidden';

            resetButton = document.getElementById("resetPhotoButton");
            resetButton.style.visibility = 'hidden';
            resetButton.addEventListener("click", reloadPhotos, false);

            exportButton = document.getElementById("exportPhotoButton");
            exportButton.style.visibility = 'hidden';
            exportButton.addEventListener("click", exportPhotosMessage, false);

            clearButton = document.getElementById("clearPhotoButton");
            clearButton.addEventListener("click", clearPictures, false);
            clearButton.style.visibility = 'hidden';

            searchDOM = document.getElementById("searchFields");
            searchDOM.style.visibility = 'hidden';
            distanceDOM = document.getElementById("distance");
            distanceDOM.style.visibility = 'hidden';

            pictureListDOM = document.getElementById('basicListView').winControl;
            pictureListDOM.addEventListener('iteminvoked', SelectItem);


            var selectElementX = document.getElementById("distance");
            selectElementX.addEventListener("change", function (evt) {
                distanceValue = evt.target.options[evt.target.selectedIndex].value;
            });

            function exportPhotosMessage() {
                if (folderString === null) {
                    showErrorMessage("There was an error! Did you search for photos with a location?");
                }
                else if (currentPhotoArray.length === 0) {
                    showErrorMessage("There was an error! There is no photos to export. Create a new search with different parameters");
                }
                else if (currentPhotoArray.length > 20 && trailVersion) {
                    showErrorMessage("You can export upto 20 photos in the trial version");
                }
                else {
                    var msg = new Windows.UI.Popups.MessageDialog("The photos in the search will be exported to your Picture folder with the label " + folderString);
                    //Add buttons and set their callback functions
                    msg.commands.append(new Windows.UI.Popups.UICommand("OK",
                       function (command) {
                           asyncOperation.cancel();
                           exportPhotos();
                       }));
                    msg.commands.append(new Windows.UI.Popups.UICommand("Cancel",
                      function (command) {
                          asyncOperation.cancel();
                      }));
                    var asyncOperation = msg.showAsync();
                }
            }


            function exportPhotos() {
                Windows.Storage.KnownFolders.picturesLibrary.createFolderAsync(folderString).then(function (data) {
                    for (var i = 0; i < currentPhotoArray.length; i++) {
                        currentPhotoArray[i].file.copyAsync(data);
                    }
                })
                .done(function () {
                    setTimeout(showErrorMessage("All photos have been exported"), 1000);
                  }
                , function (data) {
                    showErrorMessage("This folder already exist");
                });
            }

            function reloadPhotos() {
         //       undateImageBlob();
                updateList(Data.photoArray, false);
                resetButton.style.visibility = 'hidden';
                exportButton.style.visibility = 'hidden';
            }
            function SelectItem(event) {
                var selectedItem = event.detail.itemIndex;
                showNoPhotoDialog(selectedItem);
            }

            if (typeof Data.photoArray != 'undefined') {
                searchDOM.style.visibility = 'visible';
                distanceDOM.style.visibility = 'visible';
                addButton.style.visibility = 'visible';
                clearButton.style.visibility = 'visible';
                User.photosList = Data.photoArray;
                updateList(Data.photoArray, false);
        }
        
        },

        getPhotoButtonClickHandler: function (eventInfo) {
            var count = 0;
       //     var event = event.target.id;
            if (Windows.UI.ViewManagement.ApplicationView.value !=
                Windows.UI.ViewManagement.ApplicationViewState.snapped ||
                Windows.UI.ViewManagement.ApplicationView.tryUnsnap() === true) {

                // Create the picker object and set options
                var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
                openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
                openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
                // Users expect to have a filtered view of their folders depending on the scenario.
                // For example, when choosing a documents folder, restrict the filetypes to documents for your application.
                openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg"]);

                openPicker.pickMultipleFilesAsync().then(function (files) {
                    count = files.length;
                    clearPictures(null);
                    if (eventInfo.target.id != "addPhotoButton") {
                        return decodePicture(files, true, false);
                    }
                    else {
                        return decodePicture(files, true, true);
                    }

                })
                    .then(null, 
                    // We still need to handle the error, or the app will get killed 
                    // due to the unhandled exception 
                    function () { console.log("error")})

               .then(function (photos) {
                   Data.photoArray = photos;
                   searchDOM.style.visibility = 'visible';
                   distanceDOM.style.visibility = 'visible';
                   addButton.style.visibility = 'visible';
                   clearButton.style.visibility = 'visible';
                   return photos;
               }).done(function (photosX) {
                   setTimeout(updateList(Data.photoArray, false), 800 *count);
               })
   
                /********* Contunue ****/
            } // Windows if
        },
        displayError: function (error) {
            document.getElementById("imageName").innerHTML = "Unable to load image.";
        }
    }); //end of homePage

    // The click event handler for button1
    function clearPictures(eventInfo) {
        Data.photoArray = null;
        resetButton.style.visibility = 'hidden';
        exportButton.style.visibility = 'hidden';
        searchDOM.style.visibility = 'hidden';
        distanceDOM.style.visibility = 'hidden';
        clearButton.style.visibility = 'hidden';
        addButton.style.visibility = 'hidden';
        folderString = null;
        Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.clear();

        updateList(Data.photoArray, false);
    }
})();

function updateList(array, loadDistance) {
    currentPhotoArray = array;
    User.photosList = Data.photoArray;
    var simpleTemplate = document.getElementById('itemtemplate');
    var newList = new WinJS.Binding.List(array);

    pictureListDOM.itemTemplate = simpleTemplate;
    pictureListDOM.itemDataSource = newList.dataSource;
}

function showNoPhotoDialog(index) {
    imageFile = Data.photoArray[index];
    var distanceMessage =  "Distance (from search location): " + Data.photoArray[index].distance
    var message = 
                  "Display Name: " + Data.photoArray[index].displayName + '\n' +
                  "Name: "+ Data.photoArray[index].name + '\n' +
                  "Path: " + Data.photoArray[index].path + '\n' +
                  "Date Created: " + Data.photoArray[index].dateCreated + '\n' +
                  "Latitude: "+ Data.photoArray[index].latitude + '\n' +
                  "Longitude: " + Data.photoArray[index].longitude + '\n' +
                  "Make: " + Data.photoArray[index].make + '\n' +
                  "Model: " + Data.photoArray[index].model + "\n" +
                  distanceMessage;

    var msg = new Windows.UI.Popups.MessageDialog(message,
                                                      'Photo Details');
    //Add buttons and set their callback functions
    msg.commands.append(new Windows.UI.Popups.UICommand("OK",
       function (command) {


       }));
    if (trailVersion) {
        msg.commands.append(new Windows.UI.Popups.UICommand("Use blue marker(Only for Paid Version)",
            function (command) {
                
            }));
    }
    else {
        if (Data.photoArray[index].marker === false) {
            msg.commands.append(new Windows.UI.Popups.UICommand("Mark photo with blue marker",
                function (command) {
                    Data.photoArray[index].marker = true;
                }));
        }
        else {
            msg.commands.append(new Windows.UI.Popups.UICommand("Unmark photo with blue marker",
            function (command) {
                Data.photoArray[index].marker = false;
            }));
        }
    }
    msg.showAsync();
}

function showErrorMessage(message) {
    var msg = new Windows.UI.Popups.MessageDialog(message);
    //Add buttons and set their callback functions
    msg.commands.append(new Windows.UI.Popups.UICommand("OK",
       function (command) {

       }));
    msg.showAsync();
}


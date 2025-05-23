console.log('Hello!');

const search_bar = new URLSearchParams(window.location.search);
// Get URL parameters
var selectedUni = search_bar.get("uni"); //
const selectedPlace = search_bar.getAll("spot"); // // Returns Array of Spots Selected ['Food', 'Study']

var circleColor = '#1E90FF';
// Leaflet Map
var map;

//  Hash Map of Universities-  latitudem, longitude, preferred zoom on OpenStreetMap, fullname, and .json file
const universities = new Map([
    ["IUI", { latitude: 39.7756, longitude: -86.176811, zoom: 14, fullName: "Indiana University, Indianapolis",
        foodDataFile: "Restaurants-Data/IndianaUniversityIndianapolis.json",
        studyDataFile: "StudySpots-Data/IndianaUniversityIndianapolis.json" }],
    ["IVYTC", { latitude: 39.804199, longitude: -86.158626, zoom: 15, fullName: "Ivy Tech Community College",
        foodDataFile: "Restaurants-Data/IvyTechCommunityCollege.json",
        studyDataFile: "StudySpots-Data/IvyTechCommunityCollege.json" }],
    ["PUI", { latitude: 39.773967, longitude: -86.172804, zoom: 14, fullName: "Purdue University, Indianapolis",
        foodDataFile: "Restaurants-Data/PurdueUniversityIndianapolis.json",
        studyDataFile: "StudySpots-Data/PurdueUniversityIndianapolis.json" }],
    ["UIndy", { latitude: 39.7095, longitude: -86.134518, zoom: 15, fullName: "University of Indianapolis",
        foodDataFile: "Restaurants-Data/UniversityOfIndianapolis.json",
        studyDataFile: "StudySpots-Data/UniversityOfIndianapolis.json" }],
    ["MarianU", { latitude: 39.8120, longitude: -86.204259, zoom: 15, fullName: "Marian University",
        foodDataFile: "Restaurants-Data/MarianUniversity.json",
        studyDataFile: "StudySpots-Data/MarianUniversity.json" }],
    ["ButlerU", { latitude: 39.8408, longitude: -86.174033, zoom: 15, fullName: "Butler University",
        foodDataFile: "Restaurants-Data/ButlerUniversity.json",
        studyDataFile: "StudySpots-Data/ButlerUniversity.json" }],
    ["MartU", { latitude: 39.7982, longitude: -86.104, zoom: 17, fullName: "Martin University",
        foodDataFile: "Restaurants-Data/MartinUniversity.json",
        studyDataFile: "StudySpots-Data/MartinUniversity.json" }]
  ]);

// Creating Icon Class
var LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'images/leaf-shadow.png',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});


// Red, Green, Orange, Cutlery, Study, and School Icons/Markers
var redIconObject = new LeafIcon({iconUrl: 'images/leaf-red.png'});
var greenIconObject = new LeafIcon({iconUrl: 'images/leaf-green.png'});
var orangeIconObject = new LeafIcon({iconUrl: 'images/leaf-orange.png'});
var cutleryMarker = new LeafIcon({iconUrl : 'images/cutlery.png', shadowUrl : null, iconSize : [40, 40]});
var studyMarker = new LeafIcon({ iconUrl : 'images/book.png', shadowUrl : null, iconSize : [30, 30]});
var schoolMarker = new LeafIcon({ iconUrl : 'images/school.png', shadowUrl : null, iconSize : [60, 95]});


// Creating Map
function createMap(lat = 39.7684, long = -86.1581, zoom_function = 11, university, place) {
    // Default coordinates are for Indianapolis, Indiana (39.7684° N, -86.1581° W)

        // If there was a university selected, get its lat, long, and zoom
        if (! (university === null) ) {
            lat = universities.get(university).latitude,
            long = universities.get(university).longitude,
            zoom_function = universities.get(university).zoom
        }

        // Define the map's coordinates as per user input
        var mapHash = {
            center: [lat, long],
            zoom: zoom_function
        };

        // Create the Leaflet map and set the tile layer
        map = new L.map('map', mapHash);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {maxZoom: 40, attribution: '© OpenStreetMap' }).addTo(map);


        if (place.length > 0) {
            addMarkers(university, place);
        }
        addIcons(university);
        addCircle(university);

    // Return the created map if needed for further use
    return map;
}

// function to add icons
function addIcons(university) {
    let icon;
    let lat = universities.get(university).latitude;
    let long = universities.get(university).longitude;

    // school icon
    icon = L.marker([lat, long] , { icon : schoolMarker});
    icon.addTo(map);
}

// function to add circle
function addCircle(university) {
    let lat = universities.get(university).latitude;
    let long = universities.get(university).longitude;

    var circle = L.circle([lat, long], {
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.5,
        radius: 4000
    });

    circle.addTo(map);
}

//function to add markers to restauraunts and study spots
function addMarkers(university, place) {

        for (let i of place ) {
            let url;
            let food = true;
            if (i == "Study") {
                url = universities.get(university).studyDataFile;
                food = !food;
            }
            else if (i == "Food" ){
                url = universities.get(university).foodDataFile;
                food = true;
            }
            fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // loops through file containing data
                for (let i = 0; i < data.length; i ++ ) {
                    var marker;
                    var additional_info;
                    var additional_info2;

                    let item = data[i];

                    if (!food) {
                        marker = L.marker([item.latitude, item.longitude], { icon: studyMarker });
                        additional_info = `<b>Has WiFi:</b> ${item.hasWifi}<br>`;
                    } else {
                        marker = L.marker([item.latitude, item.longitude], { icon: cutleryMarker });
                        additional_info = `<b>Price:</b> ${item.price}<br>`;
                    }
                    additional_info2 = `<a href= ${item.link} target="_blank">Link</a`;

                    // creating text for each marker
                    const popupContent =
                        `<b>Name:</b> ${item.name}<br>` +
                        `<b>Address:</b> ${item.address}<br>` +
                        `<b>Miles From Campus:</b> ${item.milesFromCampus}<br>` +
                        `<b>Date Info Entered:</b> ${item.dateInfoEntered}<br>`+
                        additional_info + additional_info2;
                        // `<a href="" target="_blank"></a>`;

                    marker.addTo(map).bindPopup(popupContent);
                }
            })
            .catch(function(error) {
                console.log('Error loading JSON:', error);
            });
    }
}

createMap(undefined, undefined, undefined, selectedUni, selectedPlace);

console.log("Goodbye!")

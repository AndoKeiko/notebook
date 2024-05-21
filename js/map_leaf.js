function GetMap() {
  let pin;
  let lat = document.getElementById("lat_hidden").value;
  let lon = document.getElementById("lon_hidden").value;
  let geo = document.getElementById("geo_hidden").value;
  console.log(geo);
  let map = new Bmap("#map");
  
  map.geolocation(function (data) {
    if (lat == "" || lon == "") {
      //location
      lat = data.coords.latitude;
      lon = data.coords.longitude;
    }
    console.log(lat);
    console.log(lon);
    //Map
    map.startMap(lat, lon, "load", 15);
    //pin
    pin = map.pinIcon(lat, lon, "./img/poi_custom.png", 1.0, 0, 0);
    //A. Set location data for BingMaps
    let location = map.setLocation(lat, lon);
    //const location = map.getCenter(); //MapCenter
    map.reverseGeocode(location, function (data) {
      if (geo == "") {
        document.querySelector("#geocode").innerHTML = data;
      } else {
        document.querySelector("#geocode").innerHTML = geo;
      }
    });
    map.onGeocode("click", function (clickPoint) {
      console.log(clickPoint.location.latitude);
      map.reverseGeocode(clickPoint.location, function (data) {
        console.log(data);
        document.querySelector("#geocode").innerHTML = data;
        const event = new CustomEvent('locationUpdated', { detail: { lat: clickPoint.location.latitude, lon: clickPoint.location.longitude, geocode: data } });
        document.dispatchEvent(event);

      });
      map.deletePin();
      pin = map.pinIcon(clickPoint.location.latitude, clickPoint.location.longitude, "./img/poi_custom.png", 1.0, 0, 0);

    });
  });

}
$("#lat_hidden").change(function() {
  GetMap();
});
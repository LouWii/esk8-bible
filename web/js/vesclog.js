
function VescGeoloc (appId, appCode, mapElement, mapOptions) {
    // Class parameters
    this.appId = appId;
    this.appCode = appCode;
    this.mapElement = mapElement;
    this.mapOptions = mapOptions;

    this.defaultLayers = null;
    this.highlightedPointMarker = null;
    this.map = null;
    this.platform = null;
    this.routeLine = null;

    this.init = function() {
        this.setupPlatform();
        this.setupLayers();
        this.setupMap();
    }

    this.setupPlatform = function () {
        // https://developer.here.com/documentation/maps/topics_api/h-service-platform.html
        this.platform = new H.service.Platform({
            app_id: this.appId,
            app_code: this.appCode,
            useCIT: true,
            useHTTPS: true
        });
    }

    this.setupLayers = function () {
        this.defaultLayers = this.platform.createDefaultLayers();
    }

    this.setupMap = function () {
        // https://developer.here.com/documentation/maps/topics_api/h-map-intro.html
        this.map = new H.Map(
            this.mapElement,
            this.defaultLayers.normal.map,
            this.mapOptions
        );
    }

    this.addRoute = function (geolocPoints) {
        this.routeLine = new H.geo.LineString();

        for (var i = 0; i < geolocPoints.length; i += 3) {
            // this.routeLine.pushPoint({lat: geolocPoints[i].coordinates.latitude, lng: geolocPoints[i].coordinates.longitude});
            this.routeLine.pushLatLngAlt(geolocPoints[i].coordinates.latitude, geolocPoints[i].coordinates.longitude);
        }

        this.map.addObject(new H.map.Polyline(
            this.routeLine, { style: { lineWidth: 3 }}
        ));

        // Center map to inserted route
        this.map.setCenter(this.routeLine.getBounds().getCenter());
    }

    this.setHighlightPoint = function (latitude, longitude) {
        if (this.highlightedPointMarker === null) {
            this.highlightedPointMarker = new H.map.Marker({lat: latitude, lng: longitude}, {zIndex: 1});
            this.map.addObject(this.highlightedPointMarker);
        } else {
            this.highlightedPointMarker.setPosition({lat: latitude, lng: longitude});
        }
    }

    this.removeHightlightPoint = function () {
        this.map.removeObject(this.highlightedPointMarker);
        this.highlightedPointMarker = null;
    }
}

document.addEventListener('DOMContentLoaded', function(){
    if (typeof geoloc !== 'undefined') {
        // Showing the map after initializing it make it bug... ?
        $('#vesc-geoloc-map').show();

        var centerPoint = {lat: geoloc[0].coordinates.latitude, lng: geoloc[0].coordinates.longitude}
        var highlightPointIndex = -1;
        var vescGeoloc = new VescGeoloc(
            'HVXTIlBr8Z8VkkUyHHnB',
            'gojPcpBVi5iBujJYIL0n0A',
            document.getElementById('vesc-geoloc-map'),
            // Map options: https://developer.here.com/documentation/maps/topics_api/h-map-options.html#h-map-options
            {
                zoom: 13,
                center: centerPoint
            }
        );
        vescGeoloc.init();
        vescGeoloc.addRoute(geoloc);

        $chartContainer = $('.vesc-log-chart-container .chart-container');
        $chartContainer.on('chartjs.point.index', function(event, dataIndex){
            if (dataIndex !== highlightPointIndex && geoloc[dataIndex] !== undefined) {
                vescGeoloc.setHighlightPoint(geoloc[dataIndex].coordinates.latitude, geoloc[dataIndex].coordinates.longitude);
                highlightPointIndex = dataIndex;
            }
        });
        $chartContainer.on('chartjs.mouseout', function(event){
            vescGeoloc.removeHightlightPoint();
        });
    }
}, false);
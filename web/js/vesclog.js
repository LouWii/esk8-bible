
function VescGeoloc (appId, appCode, mapElement) {
    // Class parameters
    this.appId = appId;
    this.appCode = appCode;
    this.mapElement = mapElement;

    this.map = null;
    this.platform = null;
    this.defaultLayers = null;

    this.init = function() {
        this.setupPlatform();
        this.setupLayers();
        this.setupMap();
    }

    this.setupPlatform = function () {
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
        this.map = new H.Map(
            this.mapElement,
            this.defaultLayers.normal.map,
            {
                center: {lat: geoloc[0].coordinates.latitude, lng: geoloc[0].coordinates.longitude},
                zoom: 13
            }
        );
    }
}

document.addEventListener('DOMContentLoaded', function(){
    if (typeof geoloc !== 'undefined') {
        $('#map').show();

        var vescGeoloc = new VescGeoloc(
            'HVXTIlBr8Z8VkkUyHHnB',
            'gojPcpBVi5iBujJYIL0n0A',
            document.getElementById('map')
        );
        vescGeoloc.init();

    }
}, false);
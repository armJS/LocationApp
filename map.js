function Map() {
    let map;
    let drawingManager;
    let selectedShape;
    let infowindow;

    let initMap = () => {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 40.177200, lng: 44.503490},
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: 12,
            disableDefaultUI: true,
            zoomControl: true
        });
    };

    let initDrawingManager = () => {
        drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [''] // hide drawing tools
            },

            polygonOptions: {
                strokeWeight: 2,
                fillOpacity: 0.45,
                editable: true
            }
        });

        drawingManager.setMap(map);
    };


    let initAdressAutocomplete = () => {
        let input = document.getElementById('address-input');
        let autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', () => {
            deleteSelectedShape();
            let place = autocomplete.getPlace();
            map.setCenter(place.geometry.location);
            map.setZoom(15);
        });
    };

    let showInfoWindow = (area) => {
        let content = `<div id="infowindow-content">
           <span>Area = ${Math.trunc(area)} m<sup>2</sup></span>
        </div>`;

        infowindow = new google.maps.InfoWindow({
            content,
            position: selectedShape.getPolygonBounds().getCenter(),
        });

        infowindow.open(map);
    };

    let hideInfoWindow = () => {
        if (infowindow) {
            infowindow.close();
        }
    };

    let calculateArea = () => {
        let area = google.maps.geometry.spherical.computeArea(selectedShape.getPath());
        showInfoWindow(area);
    };


    let clearSelection = () => {
        if (selectedShape) {
            selectedShape.setEditable(false);
            selectedShape = null;
        }
    };

    let setSelection = (shape) => {
        clearSelection();
        selectedShape = shape;
        shape.setEditable(false);
        google.maps.event.addListener(shape.getPath(), 'set_at', calculateArea);
        google.maps.event.addListener(shape.getPath(), 'insert_at', calculateArea);
    };


    let deleteSelectedShape = () => {
        if (selectedShape) {
            selectedShape.setMap(null);
        }

        hideInfoWindow();
        drawingManager.setDrawingMode("polygon");
    };

    let onOverlaycomplete = (e) => {
        if (e.type === google.maps.drawing.OverlayType.POLYGON) {
            drawingManager.setDrawingMode(null);

            let newShape = e.overlay;
            newShape.type = e.type;
            google.maps.event.addListener(newShape, 'click', () => {
                setSelection(newShape);
            });
            setSelection(newShape);
            calculateArea();

        }
    };

    let initListeners = () => {
        google.maps.event.addListener(drawingManager, 'overlaycomplete', onOverlaycomplete);
        google.maps.event.addDomListener(document.getElementById('resetBtn'), 'click', deleteSelectedShape);
        $('#confirmBtn').on('click', onConfirm);
    };

    let onConfirm = () => {};

    this.initialize = () => {
        initMap();
        initDrawingManager();
        initListeners();
        initAdressAutocomplete();

    }
}


google.maps.Polygon.prototype.getPolygonBounds = function () {
    let bounds = new google.maps.LatLngBounds();
    this.getPath().forEach(function (element) {
        bounds.extend(element);
    });
    return bounds;
};
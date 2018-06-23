// Creates global variables
var map, marker;
var markers = [];

function initMap() {

   //ARRAY PARA ALTERAR DETALHES(ESTILOS) DO MAPA ATUAL.
    var styles = [{
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [{
                color: '#ffffff'
            },
            {
                weight: 6
            }
        ]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
                color: '#efe9e4'
            },
            {
                lightness: -40
            }
        ]
    }, {
        featureType: 'transit.station',
        stylers: [{
                weight: 9
            },
            {
                hue: '#e85113'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [{
            visibility: 'off'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            lightness: 100
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            lightness: -100
        }]
    }, {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{
                visibility: 'on'
            },
            {
                color: '#f0e4d3'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{
                color: '#efe9e4'
            },
            {
                lightness: -25
            }
        ]
    }];

    // CRIAÇÃO DO NOVO MAPA, LOCAL ONDE VAI ABRIR PELA PRIMEIRA VEZ E O ZOOM
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:-23.559510, lng:-46.676763},
        zoom: 15,
        styles: styles,
        mapTypeControl: false
    });

   var largeInfoWindow = new google.maps.InfoWindow();
   // var bounds = new google.maps.LatLngBounds();
    
    //Altera a cor do Marker (makeMarkerIcon é uma função criada)
    var defaultIcon = makeMarkerIcon('00ff00');    
    
    //Toda vez que o mouse passar por cima do marker, a cor vai mudar
    var highlightedIcon = makeMarkerIcon('FFFF24');
    
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var address = locations[i].address;
        
         // TRECHO PARA CRIAR OS PONTOS DE MARCAÇÃO POR LOCALIZAÇÃO
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            address: address,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        
        // ADICIONA O MARCADOR NO LOCAL
        vm.places()[i].marker = marker;
        markers.push(marker);
        
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfoWindow);
        });
        
       // 2 eventos para quando passar o mouse por cima vai trocar a cor e quando não estiver o mouse por cima do marker, a cor fica no default.
        marker.addListener('mouseover', function(){
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function(){
            this.setIcon(defaultIcon);
        });
        

    }

    //FUNÇÃO PARA DAR INFO QUANDO CLICAR NA MARKER
    function populateInfoWindow(marker, infowindow) {
        //CHECA SE O INFOWINDOW NÃO ESTÁ ABERTO PARA O MARCADOR SELECIONADO
        //var defaultIcon = makeMarkerIcon('551A8B');
        if (infowindow.marker != marker) {
            // PARA APARECER O STREETVIEW SEM INFOS, ATIVAR O SETCONTENT('') E DESTATIVAR OS QUE TEM O TITLE, ENDEREÇO E LOCAL.
            //infowindow.setContent('');
            infowindow.marker = marker;
            //CONTENT PARA APARECER AS INFOS DO LOCAL QUANDO NÃO TIVER UM STREETVIEW
            infowindow.setContent('<div>' + marker.title + '</div>' +
                                 '<div>' + "Endereço: " + marker.address + '</div>'
                                 + '<div>' + "Localização: " + marker.position + '</div>');
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                //infowindow.setMarker = null;
                marker.setAnimation(null);
                marker.setIcon(defaultIcon);
            });
        }

        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
//         In case the status is OK, which means the pano was found, compute the
//         position of the streetview image, then calculate the heading, then get a
//         panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent(infowindow.getContent() + '<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
            }
        }
        var innerHTML = '<div>';
        innerHTML += '<h3>' + marker.title + '</h3>';

        fsRating(marker.title, function(data) {
            infowindow.setContent(innerHTML += '<br><br>' +
                '<strong> ' + data.usersCount + '</strong> ' +
                'foursquare user(s) checked into ' + marker.title +
                '<strong> ' + data.checkinsCount + ' </strong> times.' + '<div id="pano"></div>');

            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        });
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }

    // FUNÇÃO PARA CRIAR UMA NOVA MARCA(MARKER) E SEUS ESTILOS
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    // Foursquare helper function
    function callFoursquare(data, callback) {

        // Specify foursquare url components
        var versao = "20180323";
        var secretId = "AD3NKH3HXLWX3SDFSTMIGWMKODE0PR2JIGNWNAODRAYCWAMH";
        var clientId = "NM3VGFOXONZSMG23M3VXWVLUUZP3WEH0FJIWHKZHPTJMMHEH";
        var ll = "-23.558191,-46.665903";
        var query = data.toLowerCase().replace("", "");
        var foursquareUrl = "https://api.foursquare.com/v2/venues/search?v=" + versao + "&ll=" + ll + "&query=" + query + "&client_id=" + clientId + "&client_secret=" + secretId;
        
        //var foursquareUrl = "https://api.foursquare.com/v2/venues/search=" + versao + "&ll=" + ll + "&query=" + query + clientId + secretId;

       // url: https://api.foursquare.com/v2/venues/explore
        // Request JSON from foursquare api, process response
        $.getJSON(foursquareUrl).done(function(data) {
            var places = data.response.venues[0];
            callback(places);
        }).fail(function() {
            alert("Deu pau na API do Foursquare.");
        });
     
    }

    // Function for returning the check-ins of a place on foursquare
    function fsRating(data, callback) {
        callFoursquare(data, function(data) {
            var foursquare = {};
            foursquare.checkinsCount = data.stats.checkinsCount;
            foursquare.usersCount = data.stats.usersCount;
            callback(foursquare);
        });
    }
}

var locations = [{
            title: "O'Malley's", 
            location: {lat:-23.558191, lng:-46.665903}, 
            address: "Alameda Itu, 1529"
        },
        {
            title: "The Black Crow Pub", 
            location: {lat:-23.561900, lng: -46.688561}, 
            address: "R. Mourato Coelho, 628"
        },
        {
            title: 'Finnegans Pub', 
            location: {lat:-23.559510, lng: -46.676763}, 
            address: "R. Cristiano Viana, 358"
        },
        {
            title: 'All Black Pub', 
            location: {lat:-23.567749, lng:-46.663981}, 
            address: "Rua Oscar Freire, 163"
        },
        {
            title: 'Partisans Pub', 
            location: {lat:-23.561020, lng:-46.682566}, 
            address: "R. Cônego Eugênio Leite, 944 "
        }
    ];






// ERRO SE O MAPA NÃO CARREGAR ----------------------------------------------

mapError = function() {
    alert("Desgraça, esse API NUNCA FUNCIONA e não está funcionando, Odin me ajuda!!");
};


// PARTE DO VIEWMODEL. -----------------------------------------------------

ViewModel = function() {
    var self = this;

    self.places = ko.observableArray([{
            title: "O'Malley's Bar",
            address: 'Alameda Itu, 1529',
           // website:
           },
        {
            title: 'The Black Crow Pub',
            address: 'R. Mourato Coelho, 628',
           // website:
        },
        {
            title: 'Finnegans Pub',
            address: 'R. Cristiano Viana, 358',
           // website:
        },
        {
            title: 'All Black Pub',
            address: 'Rua Oscar Freire, 163',
           // website:
        },
        {
            title: 'Partisans Pub',
            address: 'R. Cônego Eugênio Leite, 944',
           // website:
        }
    ]);


    // FILTRO DOS PUBS -------------------------- FILTRO DOS PUBS -----------------
    
    self.filter = ko.observable('');
    self.filteredPlaces = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            self.places().forEach(function(place) {
                if (place.marker) {
                    place.marker.setVisible(true);
                }
            });
            return self.places();
        } else {
            return ko.utils.arrayFilter(self.places(), function(place) {
                if (place.title.toLowerCase().indexOf(filter) > -1) {
                    place.marker.setVisible(true);
                    return true;
                } else {
                    place.marker.setVisible(false);
                    return false;
                }
            });
        }
    }, self);

    self.showInfo = function(location) {
        google.maps.event.trigger(location.marker, 'click');
    };
};
var vm = new ViewModel();
ko.applyBindings(vm);
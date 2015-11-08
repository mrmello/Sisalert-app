angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('homeCtrl', function($scope, $state) {
 
  $scope.redirectToGiberela = function(){
    $state.go('app.giberela');
  }

  $scope.redirectToBrusone = function(){
    $state.go('app.brusone');
  }

  $scope.redirectToStations = function(){
    $state.go('app.estacoes');
  }
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.factory('openweather', function($http) {
  var runRequest = function(city) {
    return $http({
      method: 'JSONP',
      url: 'http://api.openweathermap.org/data/2.5/forecast/daily?q='+ city + '&lang=pt&mode=json&units=metric&cnt=4&callback=JSON_CALLBACK'
    });
  };
  return {
    event: function(city) {
      return runRequest(city);
    }
  };
})

.controller('WeatherForecastCtrl', function($scope, $timeout, openweather){
  var timeout;    
  $scope.$watch('city', function(newCity) {
    if(newCity) {
      if(timeout) $timeout.cancel(timeout);
      timeout = $timeout(function() {
        openweather.event(newCity).success(function(data, status) { 
          $scope.loc = data;
          $scope.forecast = data.list;
        });
      }, 1000);
    }
  });
})


.factory('stationsFactory', function($http) {
    var runRequest = function() {
    	return $http({
			method: 'GET',
			url: 'http://dev.sisalert.com.br/apirest/api/v1/stations/'			
      	});
    }; 
    return {
    event: function() {

      return runRequest();
    }
  };
})

.factory('dataStationsFactory', function($http) {
    var runRequest = function(id) {
      return $http({
      method: 'GET',
      url: 'http://dev.sisalert.com.br/apirest/api/v1/data/station/'+id+'/range/01-01-2014/01-02-2014'      
        });
    }; 
    return {
    event: function(id) {

      return runRequest(id);
    }
  };
})

.controller('MapCtrl', function ($scope, stationsFactory, dataStationsFactory) {

	var cities = [];
	stationsFactory.event().success(function(response, status) { 

		$.each(response, function (i, value){
			      cities.id = response[i]._id;
            cities.name = response[i].name;
            cities.country = response[i].location.country.name;
            cities.country_abbr = response[i].location.country.abbr;
            cities.state = response[i].location.state.name;
            cities.state_abbr = response[i].location.state.abbr;

            if(!$("#stateSelect option[value='"+cities.state_abbr+"']").length > 0){
            	$('#stateSelect').append($('<option>').text(cities.state).attr('value', cities.state_abbr));            
            }
            
            cities.city = response[i].location.city.name;
            cities.lat = response[i].location.lat;
            cities.long = response[i].location.lon;			
			createMarker(cities);
		});
	});
	
    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(40.0000, -98.0000),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
   
  	$scope.$watch('city', function(newCity) {
	    if(newCity) {
	      filterMarkers(newCity);
	    } else{
	    	 filterMarkers('');
	    }
	  });

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    $scope.markers = [];
    
    var infoWindow = new google.maps.InfoWindow();
    
    var createMarker = function (info){
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.city,
            id: info.id,
            label: info.name,
            state: info.state_abbr
        });
        marker.content = '<div class="infoWindowContent"' + info.state + '</div>';
        
        google.maps.event.addListener(marker, 'click', function(){

            var resp = '';
            dataStationsFactory.event(marker.id).success(function(response, status) { 
              
                resp = JSON.stringify(response);
                createWindow(resp);
            });
           
    });
    
    $(".close_modal, #div_maps").click(function() {
      $("#modalconfirma").fadeOut();
    });
        
        var createWindow = function(resp){
            $("#modalconfirma").fadeIn();
            $(".float_content p").text(resp)
        }
        
        $scope.markers.push(marker);

        var bounds = new google.maps.LatLngBounds();
		for(i=0;i<$scope.markers.length;i++) {
			bounds.extend($scope.markers[i].getPosition());
		}
		$scope.map.fitBounds(bounds);        
    }  

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }

    filterMarkers = function (filter) {   
     	var state = $("#stateSelect").val();
	    for (i = 0; i < $scope.markers.length; i++) {
	        marker = $scope.markers[i];
	        var city = marker.label;
	        if (marker.state == filter || ( city.toLowerCase().match(filter.toLowerCase()) && (state == "" ? true : marker.state == state) )|| filter.length === 0) {
	            marker.setVisible(true);
	        }
	        else {
	            marker.setVisible(false);
	        }
	    }
	}

});

angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})


.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('WeatherCtrl', function ($scope, weatherService) {
    $scope.weather = weatherService.getWeather();
})

.factory('weatherService', function($http) {
    return { 
      getWeather: function() {
        var weather = { temp: {}, clouds: null };
        $http.jsonp('http://api.openweathermap.org/data/2.5/weather?q=Brasilia,br&units=metric&callback=JSON_CALLBACK').success(function(data) {
            if (data) {
                if (data.main) {
                    weather.temp.current = data.main.temp;
                    weather.temp.min = data.main.temp_min;
                    weather.temp.max = data.main.temp_max;
                }
                weather.clouds = data.clouds ? data.clouds.all : undefined;
            }
        });

        return weather;
      }
    }; 
})

.filter('temp', function($filter) {
    return function(input, precision) {
        if (!precision) {
            precision = 1;
        }
        var numberFilter = $filter('number');
        return numberFilter(input, precision) + '\u00B0C';
    };
})

.directive('weatherIcon', function() {
    return {
        restrict: 'E', replace: true,
        scope: {
            cloudiness: '@'
        },
        controller: function($scope) {
            $scope.imgurl = function() {
                var baseUrl = 'https://ssl.gstatic.com/onebox/weather/128/';
                if ($scope.cloudiness < 20) {
                    return baseUrl + 'sunny.png';
                } else if ($scope.cloudiness < 90) {
                   return baseUrl + 'partly_cloudy.png';
                } else {
                    return baseUrl + 'cloudy.png';
                }
            };
        },
        template: '<div style="float:left"><img ng-src="{{ imgurl() }}"></div>'
    };
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

.controller('MapCtrl', function ($scope, stationsFactory) {

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
            label: info.name,
            state: info.state_abbr
        });
        marker.content = '<div class="infoWindowContent">' + info.state + '</div>';
        
        google.maps.event.addListener(marker, 'click', function(){

        	//var win = window.open(info.url, '_blank');
  			//win.focus();
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.label);
            infoWindow.open($scope.map, marker);
        });
        
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
angular.module('starter.controllers', ['chart.js'])
.service('sharedProperties', function () {
        var stationID = '';

        return {
            getProperty: function () {
                return stationID;
            },
            setProperty: function(value) {
                stationID = value;
            }
        };
    })


.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal

})

.controller('homeCtrl', function($scope, $state) {
 
  $scope.redirectTodadosEstacoes = function(){
    $state.go('app.dadosEstacoes');
  }

  $scope.redirectToperiodosAntigos = function(){
    $state.go('app.periodosAntigos');
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

.factory('dataStationsFactory', function($http, $filter, sharedProperties) {
    var temp = new Date();

    temp.setDate(temp.getDate()-1);
    yesterday = $filter('date')(temp,'MM-dd-yyyy');

    temp.setDate(temp.getDate()-5);
    fiveDays = $filter('date')(temp,'MM-dd-yyyy');
    
    var runRequest = function(id) {
      return $http({
      method: 'GET',
      url: 'http://dev.sisalert.com.br/apirest/api/v1/data/station/'+id+'/range/03-26-2016/03-30-2016'      
        });
    }; 
    return {
    event: function(id) {
      return runRequest(id);
    }
  };
})

.factory('stationsDataFactory', function($http) {
    var runRequest = function(id) {
      return $http({
      method: 'GET',
      url: 'http://dev.sisalert.com.br/apirest/api/v1/station/'+id+'/lobs/true'      
        });
    }; 
    return {
    event: function(id) {
      return runRequest(id);
    }
  };
})

.controller('StationsController', function ($scope, $filter, stationsDataFactory, stationsFactory) {

    stationsFactory.event().success(function(response, status) { 
       $.each(response, function (i, value){
        if(!$("#stationSelect option[value='"+response[i]._id+"']").length > 0){
          $('#stationSelect').append($('<option>').text(response[i].name).attr('value', response[i]._id));            
        }
      });
       sortSelect();
       getStationData();
    });

    function sortSelect() {
    var selElem = document.getElementById('stationSelect');
    var tmpAry = new Array();
    for (var i=0;i<selElem.options.length;i++) {
        tmpAry[i] = new Array();
        tmpAry[i][0] = selElem.options[i].text;
        tmpAry[i][1] = selElem.options[i].value;
    }
    tmpAry.sort();
    while (selElem.options.length > 0) {
        selElem.options[0] = null;
    }
    for (var i=0;i<tmpAry.length;i++) {
        var op = new Option(tmpAry[i][0], tmpAry[i][1]);
        selElem.options[i] = op;
    }
    return;
}

    getStationData = function(){
        reset();
        var id = $('#stationSelect').val();
        stationsDataFactory.event(id).success(function(response, status) { 
            $('#stationName').text(response.name); 
            $('#stationOrg').text(response.organization.abbr); 
            $('#stationLat').text(response.location.lat); 
            $('#stationLon').text(response.location.lon); 
            $('#stationElev').text(response.location.elev); 
            $('#stationAvgT').text(response.lobs.avgT+' C');
            $('#stationAvgH').text(response.lobs.avgH+' %');
            $('#stationAvgAP').text(response.lobs.avgAP);
            $('#stationWindS').text(response.lobs.windS);
            $('#stationWindD').text(response.lobs.windD);
            $('#stationSolR').text(response.lobs.solarR);
            $('#stationTotR').text(response.lobs.totR);
            $('#stationAvgDP').text(response.lobs.avgDP);
            $('#stationInterval').text(response.lobs.interval);

            var temp = new Date(response.lobs.datetime);
            day = $filter('date')(temp,'dd/MM/yy - HH:mm');
            $('#stationTime').text(day);
        });
    }

    reset = function(){
        $('#stationName').text(''); 
        $('#stationOrg').text(''); 
        $('#stationLat').text(''); 
        $('#stationLon').text(''); 
        $('#stationElev').text(''); 
        $('#stationAvgT').text('');
        $('#stationAvgH').text('');
        $('#stationAvgAP').text('');
        $('#stationWindS').text('');
        $('#stationWindD').text('');
        $('#stationSolR').text('');
        $('#stationTotR').text('');
        $('#stationAvgDP').text('');
        $('#stationInterval').text('');
        $('#stationTime').text('');
    }

})

.controller('MapCtrl', function ($scope, $rootScope, stationsFactory, sharedProperties) {

  $scope.showFilter = function(){
      if(parseInt($('.mapFilter').css('top')) != 121){
        $('.mapFilter').animate({top: '121px'});
        setTimeout(function(){ 
          $("#arrow").removeClass("ion-chevron-down");
          $("#arrow").addClass("ion-chevron-up");
        }, 400);        
      }else{
        $('.mapFilter').animate({top: '0px'});
        setTimeout(function(){ 
          $("#arrow").removeClass("ion-chevron-up");
          $("#arrow").addClass("ion-chevron-down");
        }, 400);
      }
  };

	var cities = [];
	stationsFactory.event().success(function(response, status) { 

		$.each(response, function (i, value){
        

			      cities.id = response[i]._id;
            cities.name = response[i].name;
            if(response[i].location.country != null){
                cities.country = response[i].location.country.name;
                cities.country_abbr = response[i].location.country.abbr;
            }
            if(response[i].location.state != null){
                cities.state = response[i].location.state.name;
                cities.state_abbr = response[i].location.state.abbr;
            }

            if(!$("#stateSelect option[value='"+cities.state_abbr+"']").length > 0){
            	$('#stateSelect').append($('<option>').text(cities.state).attr('value', cities.state_abbr));            
            }
            if(response[i].location.city != null){
                cities.city = response[i].location.city.name;
            }
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
            sharedProperties.setProperty(marker.id);
            $("#modalconfirma").fadeIn();
            $(".float_content p").text('');
            $('#tempMean').text('');
            $('#HRMean').text('');
            $('#TotalRain').text('');
            $rootScope.$emit("CallDataByStation", {});
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

})

.controller("GraphController", function($scope, $rootScope, $filter, sharedProperties, dataStationsFactory) {

    $rootScope.$on("CallDataByStation", function(){
       $scope.dataByStation();
    });

    days = [];
    rain = [];
    temperature = [];
    humidity = [];
    newDay = 0;
    $scope.dataByStation = function() {
        dataStationsFactory.event(sharedProperties.getProperty()).success(function(resp, status) { 
            if(resp != '' && resp != 'null'){

                var count = 0, sumT = 0, sumH = 0, sumR = 0, count2 = 0, dailyT = 0, dailyH = 0;
                $.each(resp['data'], function (i, value){            
                    
                    var temp = new Date(resp['data'][i].datetime);
                    day = $filter('date')(temp,'dd MMM');

                    if(days.indexOf(day) == -1) {
                      days.push(day);
                      if(count != 0){
                        newDay = 1;
                      }
                    } 
                    
                    sumT += parseFloat(JSON.stringify(resp['data'][i].data.avgT));
                    sumH += parseFloat(JSON.stringify(resp['data'][i].data.avgH));
                    sumR += parseFloat(JSON.stringify(resp['data'][i].data.totR));

                    dailyT += parseFloat(JSON.stringify(resp['data'][i].data.avgT));
                    dailyH += parseFloat(JSON.stringify(resp['data'][i].data.avgH));
                    
                    count++;
                    count2++;
                    
                    if(newDay == 1){
                        rain.push(sumR.toFixed(2));
                        temperature.push(dailyT.toFixed(2)/count2);
                        humidity.push(dailyH.toFixed(2)/count2);
                        dailyH = 0, dailyT = 0, count2 = 0, newDay = 0;
                    }

                });
                rain.push(sumR.toFixed(2));
                temperature.push(dailyT.toFixed(2)/count2);
                humidity.push(dailyH.toFixed(2)/count2);    
                
                var tempMean = (sumT/count).toFixed(2);
                var meanH = (sumH/count).toFixed(2);
                var totalR = sumR.toFixed(2);
                
                $('.fiveDays, .st_data, .card').css('display', 'flex');
                $(".float_content p").css('margin-top', '0%');
                $(".float_content p").text('Estação '+resp.weatherStation.name);
                $('#tempMean').text(tempMean+' C');
                $('#HRMean').text(meanH+' %');
                $('#TotalRain').text(totalR+' mm');

                $scope.labels = [days[4], days[3], days[2], days[1], days[0]];
                $scope.series = ['Precipitção', 'Humidade Média', 'Temperatura Média'];
                $scope.data = [
                    [rain[4], rain[3], rain[2], rain[1], rain[0]],
                    [humidity[4], humidity[3], humidity[2], humidity[1], humidity[0]],
                    [temperature[4], temperature[3], temperature[2], temperature[1], temperature[0]]
                ];
                while (days.length > 0) {
                    days.pop();
                    rain.pop();
                    temperature.pop();
                    humidity.pop();
                }
            }else{
                $('.fiveDays, .st_data, .card').css('display', 'none');
                $(".float_content p").css('margin-top', '45%');
                $(".float_content p").text('Não foram encontrados dados para serem exibidos, tente novamente mais tarde');
            }
        });        
    }
});

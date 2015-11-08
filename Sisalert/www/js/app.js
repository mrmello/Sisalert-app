// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $('.downArrow').click(function(){ 
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
    });

  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.estacoes', {
    url: '/estacoes',
    views: {
      'menuContent': {
        templateUrl: 'templates/estacoes.html'
      }
    }
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
      }
    }
  })

  .state('app.giberela', {
      url: '/giberela',
      views: {
        'menuContent': {
          templateUrl: 'templates/giberela.html',
          controller: ''
        }
      }
    })
    .state('app.brusone', {
      url: '/brusone',
      views: {
        'menuContent': {
          templateUrl: 'templates/brusone.html',
          controller: ''
        }
      }
    })

  .state('app.sobre', {
    url: '/sobre',
    views: {
      'menuContent': {
        templateUrl: 'templates/sobre.html',
        controller: ''
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});

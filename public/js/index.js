angular.module("redeban", 
  ['ngRoute', 'ngTable', 'ui.bootstrap']);

  angular.module("redeban")
  .config(function($routeProvider){
  $routeProvider.when('/' , {
    templateUrl: 'templates/home.html'
  })
  .when("/chart/:id", {
      templateUrl : "templates/chart.html",
      controller: 'chartController'
  });

});
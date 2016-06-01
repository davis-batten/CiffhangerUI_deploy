'use strict';

angular.module('cliffhanger.queries', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/queries', {
    templateUrl: 'views/queries/queries.html',
    controller: 'QueriesCtrl'
  });
}])

.controller('QueriesCtrl', [function() {

}]);

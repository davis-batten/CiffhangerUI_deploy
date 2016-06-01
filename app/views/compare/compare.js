'use strict';

angular.module('cliffhanger.compare', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/datasets/compare', {
    templateUrl: 'views/compare/compare.html',
    controller: 'CompareCtrl'
  });
}])

.controller('CompareCtrl', [function() {

}]);

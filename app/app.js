// Declare app level module which depends on views, and components
app = angular.module('cliffhanger', [
    'ui.bootstrap',
    'ngRoute',
    'cliffhanger.version',

    //Views
    'cliffhanger.dashboard',
    'cliffhanger.datasets',
    'cliffhanger.queries',
    'cliffhanger.compare'

]).
config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('');

    $routeProvider.otherwise({
        redirectTo: '/dashboard'
    });
}]);

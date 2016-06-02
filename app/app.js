// Declare app level module which depends on views, and components
app = angular.module('cliffhanger', [
    'ui.bootstrap',
    'ngRoute',
    'cliffhanger.version',

    //Views
    'cliffhanger.dashboard',
    'cliffhanger.datasets',
    'cliffhanger.queries',
    'cliffhanger.compare',
    'cliffhanger.metaTypes'

]).
config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('');

    $routeProvider.otherwise({
        redirectTo: '/dashboard'
    });
}])

.run(function($rootScope) {
    //set base Url for the REST API
    $rootScope.baseUrl = 'localhost:8080/cliffhanger'; //development

});

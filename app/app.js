// Declare app level module which depends on views, and components
app = angular.module('cliffhanger', [
    'ui.bootstrap'
    , 'ui.checkbox'
    , 'ngRoute'
    , 'ngTagsInput'
    , 'ngSanitize'
    , 'ngCsv'
    , 'cliffhanger.version',

    //My modules
    'cliffhanger.dashboard'
    , 'cliffhanger.datasets'
    , 'cliffhanger.compare'
    , 'cliffhanger.queries'
    , 'cliffhanger.query_wizard'
    , 'cliffhanger.tags'

]).
config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    //set up URL mapping/routing
    $locationProvider.hashPrefix('');
    $routeProvider.otherwise({
        redirectTo: '/'
    });
}]).run(function ($rootScope) {
    //set base Url for the REST API

    //    $rootScope.baseUrl = 'http://localhost:8080/cliffhanger'; //development
    $rootScope.baseUrl = 'http://hangingonbyanicepick.eastus2.cloudapp.azure.com:8080/cliffhanger-0.1'; //production

}).directive('prevent-default', function ($rootScope) {

    var linkFn = function (scope, element, attrs) {
        $(element).on("click", function (event) {
            event.preventDefault();
        });
    };
    return {
        restrict: 'A',
        link: linkFn
    }
});

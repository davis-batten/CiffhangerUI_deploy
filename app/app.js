//GLOBAL VARIABLES

window.baseUrl = 'http://localhost:8080/cliffhanger'; //development
window.zeppelin = 'http://hadn2.zirous.com:9995';
//window.baseUrl = "http://40.84.59.10:8080/cliffhanger-0.1"; //production

// Declare app level module which depends on views, and components
app = angular.module('cliffhanger', [
    'ui.bootstrap'
    , 'ui.checkbox'
    , 'ngRoute'
    , 'ngTagsInput'
    , 'ngSanitize'
    , 'ngCsv'
    , 'ui.grid'
    , 'ui.grid.pinning'
    , 'angular-jwt'
    , 'cliffhanger.version',

    //My modules
    'cliffhanger.users'
    , 'cliffhanger.superuser'
    , 'cliffhanger.datasets'
    , 'cliffhanger.compare'
    , 'cliffhanger.queries'
    , 'cliffhanger.query_wizard'
    , 'cliffhanger.tags'
    , 'cliffhanger.messageboard'
    , 'cliffhanger.issue'

]).config(function Config($locationProvider, $routeProvider, $httpProvider, jwtInterceptorProvider) {
    //set up URL mapping/routing
    $locationProvider.hashPrefix('');
    $routeProvider.otherwise({
        redirectTo: '/'
    });
    //setup JWT intercept
    jwtInterceptorProvider.tokenGetter = ['jwtHelper', '$http', 'config', function (jwtHelper, $http, config) {
        var accessToken = localStorage.getItem('accessToken');
        var refreshToken = localStorage.getItem('refreshToken');
        //skip authentication for pure HTML requests, allows unauthenticated users to see login page 
        if (config.url.substr(config.url.length - 5) == '.html') {
            return null;
        }
        //if token is expired and in need of refresh
        else if (jwtHelper.isTokenExpired(accessToken)) {
            return $http({
                url: window.baseUrl + '/ouath/access_token',
                skipAuthorization: true,
                method: 'POST',
                data: {
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                }
            }).then(function (response) {
                var newToken = response.data.access_token;
                localStorage.setItem('accessToken', newToken);
                return newToken;
            });
        }
        //normal operation
        else {
            return accessToken;
        }
    }];
    $httpProvider.interceptors.push('jwtInterceptor');
}).run(function ($rootScope, $location, userService) {
    $rootScope.theme = {}
    $rootScope.logout = userService.logout;
    //set base Url for the REST API
    $rootScope.baseUrl = window.baseUrl;
    var path = function () {
        return $location.path();
    };
    $rootScope.$watch(path, function (newVal, oldVal) {
        $rootScope.activetab = newVal;
    });
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


//var easter_egg = new Konami(function () {
//    alert('Konami!');
//    document.body.style.backgroundImage = "url('resources/mountain.jpg')";
//});

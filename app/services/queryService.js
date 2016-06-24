//service for dealing with Meta-Types on the Grails backend using REST API
angular.module('cliffhanger.query_wizard')
    .service('queryService', function ($log, $http, $rootScope, $q) {

        //this service method formats a new query on the backend
        this.buildQuery = function (input) {


            $log.debug('json query input', JSON.stringify(input));
            return $http.post($rootScope.baseUrl + '/query/build', input)

            .then(
                //success callback
                function (response) {
                    $log.debug('Success!');
                    return response.data;
                },
                //error callback
                function (response) {
                    $log.warn('Failure!');
                    $log.warn(response);
                    return $q.reject(response.data);

                }
            );
        }
    });

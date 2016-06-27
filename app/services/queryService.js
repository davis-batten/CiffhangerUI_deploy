//service for dealing with queries on the Grails backend using REST API
angular.module('cliffhanger.queries')
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
                }, //error callback
                function (response) {
                    $log.warn('Failure!');
                    $log.warn(response);
                    return $q.reject(response.data);

                }
            );
        }

        //this service method formats a new query on the backend
        this.runQuery = function (sql) {

                return $http.get($rootScope.baseUrl + '/query/run/' + sql)

                .then(
                    //success callback
                    function (response) {
                        $log.debug('Success!');
                        return response.data;
                    }, //error callback
                    function (response) {
                        $log.warn('Failure!');
                        $log.warn(response);
                        return $q.reject(response.data);

                    }
                );
            }
            /*
                    //this service method gets an existing Query from the backend
                    this.getQuery = function (name) {

                        $log.log(JSON.stringify(name));

                        return $http.get($rootScope.baseUrl + '/query/get' + name)
                            .then(
                                //success callback
                                function (response) {
                                    $log.info('Success!');
                                    $log.info(response);
                                    return response.data;
                                }, //error callback
                                function (response) {
                                    $log.warn('Failure!');
                                    $log.warn(response);
                                    return $q.reject(response.data);
                                }
                            );
                    };

                    //this service method gets all existing Queries from the backend
                    this.getAllQueries = function () {

                        return $http.get($rootScope.baseUrl + '/query/list')
                            .then(function (response) { //success callback
                                    $log.info(response); //list all data from response
                                    if (response.data.status == 'Success') {
                                        $log.info('Successfully retrieved queries');
                                        return response.data;
                                    } else {
                                        $log.warn('Failed to retrieve queries');
                                        return $q.reject(response.data);
                                    }
                                }
                                , function (response) { //error callback
                                    $log.warn(response);
                                    return $q.reject(response.data);
                                }
                            );
                    };
            */
    });

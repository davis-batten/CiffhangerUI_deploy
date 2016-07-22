//service for dealing with queries on the Grails backend using REST API
angular.module('cliffhanger.queries').service('queryService', function ($log, $http, $rootScope, $q) {
    //this service method formats a new query on the backend
    this.buildQuery = function (input) {
            $log.debug('input', input);
            return $http.post($rootScope.baseUrl + '/query/build', input).then(
                //success callback
                function (response) {
                    $log.debug('Success!');
                    return response.data;
                }, //error callback
                function (response) {
                    $log.warn('Failure!');
                    $log.warn(response);
                    return $q.reject(response.data);
                });
        }
        //this service method formats a new query on the backend
    this.runQuery = function (sql) {
            var input = {
                query: sql
            }
            return $http.post($rootScope.baseUrl + '/query/run', input).then(
                //success callback
                function (response) {
                    $log.debug('Success!');
                    return response.data;
                }, //error callback
                function (response) {
                    $log.warn('Failure!');
                    $log.warn(response);
                    return $q.reject(response.data);
                });
        }
        //this service method saves a query on the backend
    this.saveQuery = function (newQuery) {
        return $http.post($rootScope.baseUrl + '/query/save/' + $rootScope.user.username, newQuery).then(
            //success callback
            function (response) {
                $log.debug('Success!');
                return response.data;
            }, //error callback
            function (response) {
                $log.warn('Failure');
                $log.warn(response);
            });
    }

    //this service method updates a query on the backend
    this.updateQuery = function (query, sql) {
        var input = {
            id: query.id,
            sqlString: sql
        }
        return $http.post($rootScope.baseUrl + '/query/update', input).then(
            //success
            function (response) {
                $log.debug('Success!');
                $log.log(response);
                return response.data;
            },
            //error callback
            function (response) {
                $log.warn('Failure');
                $log.warn(response);
            });
    }

    //this service method deletes a specified query on the backend
    this.deleteQuery = function (query) {
            $log.log(query)
            return $http.post($rootScope.baseUrl + '/query/delete', query).then(function (response) { //success callback
                $log.info(response); //list all data from response
                if (response.data.status == 'Success') {
                    $log.info('Successfully deleted query ', query);
                    return response.data;
                } else {
                    $log.warn('Failed to delete ', query);
                    return $q.reject(response.data);
                }
            }, function (response) { //error callback
                $log.warn(response);
                return $q.reject(response);
            });
        }
        //this service method gets all existing Queries from the backend
    this.getAllQueries = function () {
        return $http.get($rootScope.baseUrl + '/query/list').then(function (response) { //success callback
            $log.info(response); //list all data from response
            if (response.data.status == 'Success') {
                $log.info('Successfully retrieved queries');
                return response.data;
            } else {
                $log.warn('Failed to retrieve queries');
                return $q.reject(response.data);
            };
        });
    }

    this.getUserQueries = function () {
        return $http.get($rootScope.baseUrl + '/query/userQueries/' + $rootScope.user.username).then(function (response) {
            $log.info(response); //list all data from response
            if (response.data.status == 'Success') {
                $log.info('Successfully retrieved queries');
                return response.data;
            } else {
                $log.warn('Failed to retrieve queries');
                return $q.reject(response.data);
            };
        });
    }
});

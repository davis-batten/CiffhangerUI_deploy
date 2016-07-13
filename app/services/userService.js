//service for dealing with Meta-Types on the Grails backend using REST API
angular.module('cliffhanger.superuser')
    .service('userService', function ($log, $http, $rootScope, $q) {

        $rootScope.user = {}

        this.login = function (username, password) {
            var input = {
                username: username,
                password: password
            }

            return $http.post($rootScope.baseUrl + '/user/login', input)
                .then(
                    //success callback
                    function (response) {
                        $log.info('Successful login!', response);
                        //update $rootScope with user profile details
                        $rootScope.user = response.data.data;
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

        this.logout = function () {
            $rootScope.user = {}
        }

        this.register = function (newUser) {
            return $http.post($rootScope.baseUrl + '/user/create', newUser)
                .then(
                    //success callback
                    function (response) {
                        $log.info('Success!', response);
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

        this.getAllUsers = function () {
            return $http.get($rootScope.baseUrl + '/user/getAllUsers')
                .then(
                    //success callback
                    function (response) {
                        $log.info('Success', response);
                        return response.data;
                    },
                    //Error callback
                    function (response) {
                        $log.warn('Failure');
                        $log.warn(response);
                        return $q.reject(response.data);
                    }
                );
        }

        this.updateUser = function (username, newUser) {
            return $http.put($rootScope.baseUrl + '/user/update/' + username, newUser)
                .then(
                    //Success callback
                    function (response) {
                        $log.info('Success', response);
                        return response.data;
                    },
                    //Error callback
                    function (response) {
                        $log.warn('Failure');
                        $log.warn(response);
                        return $q.reject(response.data);
                    }
                );
        }

        this.deleteUser = function (username) {
            return $http.delete($rootScope.baseUrl + '/user/delete/' + username)
                .then(
                    //Success callback
                    function (response) {
                        $log.info('Success', response);
                        return response.data;
                    },
                    //Error callback
                    function (response) {
                        $log.warn('Failure');
                        $log.warn(response);
                        return $q.reject(response.data);
                    }
                );
        }
    });

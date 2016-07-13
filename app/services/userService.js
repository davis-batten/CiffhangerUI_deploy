//service for dealing with Meta-Types on the Grails backend using REST API
angular.module('cliffhanger.users')
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


    });

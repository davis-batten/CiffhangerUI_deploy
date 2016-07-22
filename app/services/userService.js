//service for dealing with users on the Grails backend using REST API
angular.module('cliffhanger.users').service('userService', function ($log, $http, $rootScope, $q) {
    $rootScope.user = {}
    this.login = function (username, password) {
        var input = {
            username: username
            , password: password
        }
        return $http({
            method: 'POST'
            , url: $rootScope.baseUrl + '/user/login'
            , skipAuthorization: true
            , data: input
        }).then(
            //success callback
            function (response) {
                $log.info('Successful login!', response);
                //update $rootScope with user profile details
                $rootScope.user = response.data;
                localStorage.setItem('accessToken', $rootScope.user.access_token);
                localStorage.setItem('refreshToken', $rootScope.user.refresh_token);
                $log.debug('localStorage', localStorage);
                return response;
            }, //error callback
            function (response) {
                $log.warn('Failure!');
                $log.warn(response);
                return $q.reject(response);
            });
    }
    this.logout = function () {
        //clear account details and tokens
        $rootScope.user = {}
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        $log.debug('logout', localStorage);
    }
    this.register = function (newUser) {
        return $http({
            method: 'POST'
            , url: $rootScope.baseUrl + '/user/create'
            , skipAuthorization: true
            , data: newUser
        }).then(
            //success callback
            function (response) {
                $log.info('Success!', response);
                return response.data;
            }, //error callback
            function (response) {
                $log.warn('Failure!');
                $log.warn(response);
                return $q.reject(response.data);
            });
    }
    this.getAllUsers = function () {
        return $http.get($rootScope.baseUrl + '/user/list').then(
            //success callback
            function (response) {
                $log.info('Success', response);
                return response.data;
            }, //Error callback
            function (response) {
                $log.warn('Failure');
                $log.warn(response);
                return $q.reject(response.data);
            });
    }
    this.updateUser = function (username, newUser) {
            return $http.put($rootScope.baseUrl + '/user/update/' + username, newUser).then(
                //Success callback
                function (response) {
                    $log.info('Success', response);
                    return response.data;
                }, //Error callback
                function (response) {
                    $log.warn('Failure');
                    $log.warn(response);
                    return $q.reject(response.data);
                });
        }
        //this service method gets an existing user from the backend
    this.getUser = function (username) {
            $log.log(JSON.stringify(username));
            return $http.get($rootScope.baseUrl + '/user/get/' + username).then(
                //success callback
                function (response) {
                    $log.info('Success!');
                    $log.info(response);
                    return reponse.data;
                }, //error callback
                function (response) {
                    $log.warn('Failure!');
                    $log.warn(response);
                    return $q.reject(response.data);
                });
        }
        //This service deletes a user
    this.deleteUser = function (username) {
        return $http.delete($rootScope.baseUrl + '/user/delete/' + username).then(
            //Success callback
            function (response) {
                $log.info('Success', response);
                return response.data;
            }, //Error callback
            function (response) {
                $log.warn('Failure');
                $log.warn(response);
                return $q.reject(response.data);
            });
    }
});
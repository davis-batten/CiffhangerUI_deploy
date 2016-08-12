angular.module('cliffhanger.issue').service('issueService', function ($log, $http, $rootScope, $q) {
    var baseUrl = $rootScope.baseUrl;
    //create a new issue thread
    this.createIssue = function (newIssue) {
            newIssue.opener = $rootScope.user.username;
            return $http.post(baseUrl + '/discussionThread/create', newIssue).then(
                //success callback
                function (response) {
                    $log.debug(response);
                    return response.data;
                }, //error callback
                function (response) {
                    $log.error(response);
                    return $q.reject(response.data);
                });
        }
        //get a list of all issues
    this.getAllIssues = function () {
            return $http.get(baseUrl + '/discussionThread/list').then(
                //success callback
                function (response) {
                    $log.debug(response);
                    return response.data;
                }, //error callback
                function (response) {
                    $log.error(response);
                    return $q.reject(response.data);
                });
        }
        //get a single issue
    this.getIssue = function (threadId) {
            return $http.get(baseUrl + '/discussionThread/get/' + threadId).then(
                //success callback
                function (response) {
                    $log.debug(response);
                    return response.data;
                }, //error callback
                function (response) {
                    $log.error(response);
                    return $q.reject(response.data);
                });
        }
        //toggle open/close an issue
    this.toggleOpen = function (threadId, closerUsername) {
            //TODO
            var closer = {
                closer: closerUsername
            }
            $log.info('closer', closer);
            return $http.put(baseUrl + '/discussionThread/open/' + threadId, closer).then(
                //success callback
                function (response) {
                    $log.debug(response);
                    return response.data;
                }, //error callback
                function (response) {
                    $log.error(response);
                    return $q.reject(response.data);
                });
        }
        //post a new comment
    this.postComment = function (newComment) {
            return $http.post(baseUrl + '/comment/post', newComment).then(
                //success callback
                function (response) {
                    $log.debug(response);
                    return response.data;
                }, //error callback
                function (response) {
                    $log.error(response);
                    return $q.reject(response.data);
                });
        }
        //fetch all comments for an issue
    this.getComments = function (threadId) {
        return $http.get(baseUrl + '/comment/getByThread/' + threadId).then(
            //success callback
            function (response) {
                $log.debug(response);
                return response.data;
            }, //error callback
            function (response) {
                $log.error(response);
                return $q.reject(response.data);
            });
    }
});

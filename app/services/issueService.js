angular.module('cliffhanger.issue').service('issueService', function ($log, $http, $rootScope, $q) {

    var baseUrl = $rootScope.baseUrl;

    //create a new issue thread
    this.createIssue = function (newIssue) {
        //TODO
        return $http.post(baseUrl + '/discussionThread/create', newIssue).then(
            //success callback
            function (response) {
                $log.debug(response);
                return response.data;
            },
            //error callback
            function (response) {
                $log.error(response);
                return $q.reject(response.data);
            });
    }

    //get a list of all issues
    this.getAllIssues = function () {
        //TODO
        return $http.get(baseUrl + '/discussionThread/list').then(
            //success callback
            function (response) {
                $log.debug(response);
                return response.data;
            },
            //error callback
            function (response) {
                $log.error(response);
                return $q.reject(response.data);
            });
    }

    //(re)open an issue
    this.openIssue = function () {
        //TODO
        return $http.get(baseUrl + '/discussionThread/open').then(
            //success callback
            function (response) {
                $log.debug(response);
                return response.data;
            },
            //error callback
            function (response) {
                $log.error(response);
                return $q.reject(response.data);
            });
    }

    //close an issue
    this.closeIssue = function () {
        //TODO
        return $http.get(baseUrl + '/discussionThread/close').then(
            //success callback
            function (response) {
                $log.debug(response);
                return response.data;
            },
            //error callback
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
            },
            //error callback
            function (response) {
                $log.error(response);
                return $q.reject(response.data);
            });
    }

    //fetch all comments for an issue
    this.getComments = function (issue) {

        return $http.get(baseUrl + '/comment/getAllByThreadId/' + issue.threadId).then(
            //success callback
            function (response) {
                $log.debug(response);
                return response.data;
            },
            //error callback
            function (response) {
                $log.error(response);
                return $q.reject(response.data);
            });
    }



});

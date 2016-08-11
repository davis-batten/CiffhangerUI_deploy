angular.module('cliffhanger.issue', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/issue/:threadId', {
        templateUrl: 'views/issue/issue.html',
        controller: 'IssueCtrl',
        activetab: 'messageboard'
    });
}]).controller('IssueCtrl', function ($rootScope, $log, $scope, $q, $location, issueService, $routeParams) {

    $scope.issue = {};
    $scope.comments = [];
    $scope.alerts = [];

    // Redirect view to login page if user in not logged in
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });

    // On click: X in <uib-alert> element
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    // Read the role of the user and return CSS class name to style their username according to that role
    $scope.getRoleStyle = function (user) {
        // Users only ever have one role, but user.roles is a list due to our spring security implementation
        if (user.roles[0].authority == "ROLE_DEVELOPER") return "text-success";
        else if (user.roles[0].authority == "ROLE_ANALYST") return "text-primary";
        else return "text-muted";
    }

    // On click
    $scope.toggleOpen = function () {
        // $scope.issue.open = false; //for testing only
        issueService.toggleOpen($routeParams.threadId, $rootScope.user.username).then(
            //success
            function (response) {
                //reload issue
                $scope.issue = response;
            }, //error
            function (error) {
                $scope.alerts.push({
                    msg: error.message,
                    type: "danger"
                });
            });
    }

    //post a new comment
    $scope.postComment = function () {
        var newComment = {
            threadId: $routeParams.threadId,
            body: $scope.newComment,
            userId: $rootScope.user.username
        }
        issueService.postComment(newComment).then(
            //success
            function (response) {
                $log.debug(response);
                $scope.comments.push(response);
                $scope.newComment = "";
            },
            //error
            function (error) {
                $log.error(error);
                $scope.alerts.push({
                    msg: error.message,
                    type: "danger"
                });
            });
    }

    var loadIssue = function () {
        $log.info('user', $rootScope.user);
        var threadId = $routeParams.threadId;
        //load issue metadata
        issueService.getIssue(threadId).then(
            //success
            function (response) {
                $scope.issue = response;
            }, //error
            function (error) {
                $scope.alerts.push({
                    msg: error.message,
                    type: "danger"
                });
            });
        //load all comments by threadId
        issueService.getComments(threadId).then(
            //success
            function (response) {
                $scope.comments = response;
            }, //error
            function (error) {
                $scope.alerts.push({
                    msg: error.message,
                    type: "danger"
                });
            });
    }
    loadIssue();
});

angular.module('cliffhanger.messageboard', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/messageboard', {
        templateUrl: 'views/messageboard/messageboard.html'
        , controller: 'MessageBoardCtrl'
        , activetab: 'messageboard'
    });
}]).controller('MessageBoardCtrl', function ($rootScope, $log, $scope, $q, $location, issueService) {
    //list of alerts
    $scope.alerts = [];
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    $scope.issues = [
            {
                subject: "Can't load table cliffhanger.testHiveTable"
                , opener: {
                    username: "dbatt"
                    , role: {
                        roleID: "DEVELOPER"
                    }
                }
                , numComments: 5
                , createDate: new Date()
                , open: open
        }
            , {
                subject: "Can't change username"
                , opener: {
                    username: "colton"
                    , role: {
                        roleID: "ADMIN"
                    }
                }
                , numComments: 1
                , createDate: new Date()
                , open: false
        }
            , {
                subject: "No results for a join query"
                , opener: {
                    username: "heather"
                    , role: {
                        roleID: "ANALYST"
                    }
                }
                , numComments: 3
                , createDate: new Date()
                , open: true
        }
    ]
        //load the list of all issues
    $scope.loadIssues = function () {
        issueService.getAllIssues().then(
            //success
            function (response) {
                if (response.status == 'Success') {
                    $scope.issues = response.data;
                }
                //error
                else {
                    $scope.alerts.push({
                        msg: response.data
                        , type: "danger"
                    });
                }
            }, //error
            function (error) {
                $scope.alerts.push({
                    msg: "Failed to connect to server."
                    , type: "danger"
                });
            })
    }
    $scope.loadIssues();
    //for filter dropdown
    $scope.toggleFilterDropdown = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.filterbyisopen = !$scope.status.filterbyisopen;
        }
        //for filter
    $scope.setFilter = function (filterText) {
            if (filterText != null) {
                $scope.searchText = {
                    open: filterText
                };
            }
            else $scope.searchText = '';
        }
        //for sort by dropdown
    $scope.toggleSortByDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.sortbyisopen = !$scope.status.sortbyisopen;
    }
    $scope.setSort = function (sort) {
        $scope.sortText = sort;
        $scope.reverse = false;
        if (sort == 'lastComment.createDate') {
            $scope.reverse = true;
        }
    }
    $scope.roleStyle = function (issue) {
        var role = issue.opener.role.roleID;
        if (role == "DEVELOPER") return "label label-success";
        else if (role == "ANALYST") return "label label-primary";
        else return "label label-default";
    }
    $scope.openStyle = function (issue) {
        if (issue.open) return "glyphicon glyphicon-ok-circle text-success";
        else return "glyphicon glyphicon-remove-circle text-danger";
    }
    $scope.openTooltip = function (issue) {
        if (issue.open) return "Open";
        else return "Closed";
    }
    $scope.openThread = function (issue) {
        $log.log(issue);
        $rootScope.issueId = issue.threadId;
        $location.path("/issue/" + issue.threadId);
    }
    $scope.newIssue = function () {
        //TODO
    }
});
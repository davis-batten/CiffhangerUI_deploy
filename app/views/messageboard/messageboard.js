angular.module('cliffhanger.messageboard', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/messageboard', {
        templateUrl: 'views/messageboard/messageboard.html',
        controller: 'MessageBoardCtrl',
        activetab: 'messageboard'
    });
}]);
var messageboard = angular.module('cliffhanger.messageboard');
messageboard.controller('MessageBoardCtrl', function ($rootScope, $log, $scope, $uibModal, $q, $location, issueService) {
    //list of alerts
    $scope.alerts = [];
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    $scope.issues = [
        /*
            {
                subject: "Can't load table cliffhanger.testHiveTable",
                opener: {
                    username: "dbatt",
                    roles: [
                        "ROLE_DEVELOPER"
                    ]
                },
                numComments: 5,
                createDate: new Date(),
                open: open
        }
            , {
                subject: "Can't change username",
                opener: {
                    username: "colton",
                    roles: [
                        "ROLE_ADMIN"
                    ]
                },
                numComments: 1,
                createDate: new Date(),
                open: false
        }
            , {
                subject: "No results for a join query",
                opener: {
                    username: "heather",
                    roles: [
                        "ROLE_ANALYST"
                    ]
                },
                numComments: 3,
                createDate: new Date(),
                open: true
        }
        */
    ];
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });
    $scope.isCollapsed = true;
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
                        msg: response.data,
                        type: "danger"
                    });
                }
            }, //error
            function (error) {
                $scope.alerts.push({
                    msg: "Failed to connect to server.",
                    type: "danger"
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
            } else $scope.searchText = '';
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
        } else if (sort == 'createDateReverse') {
            $scope.sortText = 'createDate';
            $scope.reverse = true;
        }
    }
    $scope.roleStyle = function (issue) {
        var role = issue.opener.roles[0].authority;
        if (role == "ROLE_DEVELOPER") return "label label-success";
        else if (role == "ROLE_ANALYST") return "label label-primary";
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
        //opens new issue modal
    $scope.newIssue = function () {
        var input = $scope.input;
        var modalInstance = $uibModal.open({
            templateUrl: 'newIssueModal.html',
            controller: 'NewIssueModalInstanceCtrl',
            size: 'lg'
        });
        modalInstance.result.then(function (input) {
            $log.info('Modal dismissed at: ' + new Date());
            $log.info(input);
            issueService.createIssue(input).then(function (response) {
                // success
                $scope.issues.push(response.data);
                $scope.postReportSubmissionMessage = "Your problem has been reported to the developers."
            }, function (data) {
                // fail
                $scope.postReportSubmissionMessage = "There was a problem reporting your problem."
            });
        });
    }
});
//controller for instance of NewIssueModal
messageboard.controller('NewIssueModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $rootScope) {
    $scope.input = {
        subject: '',
        body: ''
    };
    //complete modal
    $scope.submit = function () {
        $uibModalInstance.close($scope.input);
    };
    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

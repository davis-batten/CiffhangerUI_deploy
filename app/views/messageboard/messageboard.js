angular.module('cliffhanger.messageboard', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/messageboard', {
        templateUrl: 'views/messageboard/messageboard.html',
        controller: 'MessageBoardCtrl',
        activetab: 'messageboard'
    });
}]);
var messageboard = angular.module('cliffhanger.messageboard');
messageboard.controller('MessageBoardCtrl', function ($rootScope, $log, $scope, $uibModal, $q, $location, issueService) {

    // list of alerts
    $scope.alerts = [];

    // On click: X in <uib-alert> element
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    // Send user to log in page if not logged in
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });

    // On click: REFRESH
    $scope.loadIssues = function () {
        issueService.getAllIssues().then(
            //success
            function (response) {
                $scope.issues = response;
            }, //error
            function (error) {
                $scope.alerts.push({
                    msg: error.message,
                    type: "danger"
                });
            });
    };
    $scope.loadIssues();


    // On click: FILTER BY
    $scope.toggleFilterDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.filterbyisopen = !$scope.status.filterbyisopen;
    };

    // On click: item in FILTER BY drop down
    $scope.setFilter = function (filterText) {
        if (filterText != null) {
            if (filterText == 'Request') {
                $scope.searchText = {
                    subject: filterText
                }
            } else {
                $scope.searchText = {
                    open: filterText
                }
            }
        } else $scope.searchText = '';
    };

    // On click: SORT BY
    $scope.toggleSortByDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.sortbyisopen = !$scope.status.sortbyisopen;
    };

    // On click: item in SORT BY dropdown
    $scope.setSort = function (sort) {
        $scope.sortText = sort;
        $scope.reverse = false;
        if (sort == 'lastComment.createDate') {
            $scope.reverse = true;
        } else if (sort == 'createDateReverse') {
            $scope.sortText = 'createDate';
            $scope.reverse = true;
        }
    };

    // Get css class for username based on role
    $scope.roleStyle = function (issue) {
        var role = issue.opener.roles[0].authority;
        if (role == "ROLE_DEVELOPER") return "label label-success";
        else if (role == "ROLE_ANALYST") return "label label-primary";
        else return "label label-default";
    };

    // Get icon to denote if issue is open or closed
    $scope.getIssueStatusIcon = function (issue) {
        if (issue.open) return "fa fa-check-circle text-success";
        else return "fa fa-times-circle text-danger";
    };

    // Get tooltip text to show if issue is open or closed
    $scope.openTooltip = function (issue) {
        if (issue.open) return "Open";
        else return "Closed";
    };

    // On click: a thread in the list
    $scope.openThread = function (issue) {
        $log.log(issue);
        $rootScope.issueId = issue.threadId;
        $location.path("/issue/" + issue.threadId);
    };

    // On click: OPEN NEW THREAD
    $scope.newIssue = function () {
        var input = $scope.input;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/messageboard/modals/newIssueModal.html',
            controller: 'NewIssueModalInstanceCtrl',
            size: 'lg'
        });
        modalInstance.result.then(function (input) {
            $log.info('Modal dismissed at: ' + new Date());
            $log.info(input);
            issueService.createIssue(input).then(
                // success
                function (response) {
                    $scope.issues.push(response);
                    $scope.postReportSubmissionMessage = "Your problem has been reported to the developers."
                },
                // fail
                function (error) {
                    $scope.postReportSubmissionMessage = "There was a problem reporting your problem."
                    $scope.alerts.push({
                        msg: error.message,
                        type: "danger"
                    })
                });
        });
    };
});

messageboard.controller('NewIssueModalInstanceCtrl', function ($scope, $uibModalInstance, $log, $rootScope) {

    $scope.input = {
        subject: '',
        body: ''
    };

    // On click: POST
    $scope.submit = function () {
        $uibModalInstance.close($scope.input);
    };

    // On click: X
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

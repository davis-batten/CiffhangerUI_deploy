angular.module('cliffhanger.messageboard', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/messageboard', {
        templateUrl: 'views/messageboard/messageboard.html',
        controller: 'MessageBoardCtrl',
        activetab: 'messageboard'
    });
}]).controller('MessageBoardCtrl', function ($rootScope, $log, $scope, $q, $location) {

    $scope.issues = [
        {
            subject: "Can't load table cliffhanger.testHiveTable",
            opener: {
                username: "dbatt",
                role: {
                    roleID: "DEVELOPER"
                }
            },
            numComments: 5,
            createDate: new Date(),
            open: false
        },
        {
            subject: "Can't change username",
            opener: {
                username: "colton",
                role: {
                    roleID: "ADMIN"
                }
            },
            numComments: 1,
            createDate: new Date(),
            open: true
        },
        {
            subject: "No results for a join query",
            opener: {
                username: "heather",
                role: {
                    roleID: "ANALYST"
                }
            },
            numComments: 3,
            createDate: new Date(),
            open: true
        }
    ]

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


    $scope.openThread = function () {
        //TODO
        $location.path("/issue");
    }

    $scope.newIssue = function () {
        //TODO
    }


});

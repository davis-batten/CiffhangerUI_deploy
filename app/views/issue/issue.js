angular.module('cliffhanger.issue', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/issue/:threadId', {
        templateUrl: 'views/issue/issue.html'
        , controller: 'IssueCtrl'
        , activetab: 'messageboard'
    });
}]).controller('IssueCtrl', function ($rootScope, $log, $scope, $q, $location, issueService, $routeParams) {
    //list of alerts
    $scope.alerts = [];
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    //TODO load issue/comment data
    //test issue data
    $scope.issue = {
        /*
            subject: "Can't load table testHiveTable"
            , opener: {
                username: "dbatt"
                , role: {
                    roleID: "DEVELOPER"
                }
            }
            , createDate: new Date()
            , open: true
            */
    };
    //test comment data
    $scope.comments = [
        /*
        {
            commentBy: {
                username: "dbatt"
                , role: {
                    roleID: "DEVELOPER"
                }
            }
            , body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus est leo, congue eu neque id, mattis lacinia metus. Donec tincidunt porta massa. Nunc sed lacus elementum, vulputate enim ut, bibendum tortor. Praesent et est lacus. Quisque vulputate nunc metus, sit amet porttitor ligula tempor sed. Morbi varius tortor in fermentum sagittis. Mauris laoreet scelerisque convallis. Nulla hendrerit mi quis nisi sagittis accumsan. Integer ac cursus risus. Sed tellus ante, feugiat eu enim nec, eleifend fermentum massa. Praesent lorem augue, vehicula vitae hendrerit vel, efficitur et eros. Phasellus aliquet ut purus a cursus. Nullam imperdiet sem in mattis tempor. Integer vel eros eu quam hendrerit consequat."
            , createDate: new Date()
        }
        , {
            commentBy: {
                username: "heather"
                , role: {
                    roleID: "ANALYST"
                }
            }
            , body: "Pellentesque vestibulum sem sit amet lacus suscipit, non porttitor nibh egestas. Maecenas lobortis mattis blandit. Pellentesque id dui nisi. Sed lobortis dolor sed risus eleifend, sit amet finibus leo faucibus. Etiam sed ex dolor. Sed urna risus, congue id tellus et, ultricies convallis tellus. Fusce convallis felis non tristique varius. Etiam hendrerit, libero imperdiet mattis lobortis, mi diam viverra turpis, sed luctus nibh erat faucibus odio."
            , createDate: new Date()
        }
        , {
            commentBy: {
                username: "colton"
                , role: {
                    roleID: "ADMIN"
                }
            }
            , body: "Curabitur ac neque finibus, vulputate libero eu, laoreet orci. Fusce in eleifend tellus. Quisque nec condimentum magna. In molestie facilisis nisl, et convallis enim hendrerit sed. Donec id nulla eget mi ultrices finibus sit amet at sem. Duis scelerisque neque sit amet nisl lobortis tincidunt. Morbi viverra dui eget dapibus lacinia. Praesent convallis nunc vel nisi mattis egestas. Aliquam pulvinar quam porta libero laoreet pharetra. Duis ultrices laoreet purus. Vivamus congue dolor at congue interdum."
            , createDate: new Date()
        }
        , {
            commentBy: {
                username: "heather"
                , role: {
                    roleID: "ANALYST"
                }
            }
            , body: "Nullam molestie sapien a risus tempor fermentum. Sed tempus maximus orci, porttitor elementum felis sodales sit amet. Quisque pulvinar hendrerit ipsum, in porta lacus gravida vitae."
            , createDate: new Date()
        }
        , {
            commentBy: {
                username: "dbatt"
                , role: {
                    roleID: "DEVELOPER"
                }
            }
            , body: "Phasellus ut libero est. Nullam viverra ullamcorper nisi, nec tempus mauris pulvinar nec. Vestibulum cursus, tellus ut consequat porttitor, nibh ex auctor est, non varius ex nisi maximus mauris. Aliquam bibendum nisl vestibulum massa commodo aliquet. Etiam ex nunc, finibus nec ornare non, feugiat quis massa. Interdum et malesuada fames ac ante ipsum primis in faucibus. Duis sit amet vestibulum leo, eu blandit erat."
            , createDate: new Date()
        }
        */
    ];
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });
    $scope.isCollapsed = true;
    $scope.loadIssue = function () {
        $log.info('user', $rootScope.user);
        var threadId = $routeParams.threadId;
        //load issue metadata
        issueService.getIssue(threadId).then( //success
            function (response) {
                if (response.status == 'Success') {
                    $scope.issue = response.data;
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
            });
        //load all comments by threadId
        issueService.getComments(threadId).then(
            //success
            function (response) {
                if (response.status == 'Success') {
                    $scope.comments = response.data;
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
            });
    }
    $scope.loadIssue();
    $scope.roleStyle = function (user) {
        $log.debug('role user', user);
        if (user.roles[0].authority == "ROLE_DEVELOPER") return "text-success";
        else if (user.roles[0].authority == "ROLE_ANALYST") return "text-primary";
        else return "text-muted";
    }
    $scope.toggleOpen = function () {
            //        $scope.issue.open = false; //for testing only
            issueService.toggleOpen($routeParams.threadId, $rootScope.user.username).then(
                //success
                function (response) {
                    if (response.status == 'Success') {
                        //reload issue
                        $scope.loadIssue();
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
                });
        }
        //post a new comment
    $scope.postComment = function () {
        var newComment = {
            threadId: $routeParams.threadId
            , body: $scope.newComment
            , userId: $rootScope.user.username
        }
        issueService.postComment(newComment).then(
            //success
            function (response) {
                if (response.status == 'Success') {
                    $scope.comments.push(response.data);
                    $scope.newComment = "";
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
            });
    }
});
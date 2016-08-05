angular.module('cliffhanger.queries', ['ngRoute', 'ngSanitize', 'ngCsv']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/analyst/queries', {
        templateUrl: 'views/queries/queries.html',
        controller: 'QueriesCtrl',
        activetab: 'queries'
    });
}]);
var queries = angular.module('cliffhanger.queries');
//main controller for queries page
queries.controller('QueriesCtrl', function ($scope, $uibModal, $log, $location, queryService, issueService, $rootScope) {
    //list of selected queries
    $scope.selected = [];
    //list of alerts to show to user
    $scope.alerts = [];
    //queries sorted by date created by default
    $scope.propertyName = 'dateCreated';
    //set theme color
    $rootScope.theme.color = 'blue';
    //boolean for sort by drop down
    $scope.isCollapsed = true;
    //boolean for if there are queries list from server
    $scope.showNoQueriesMessage = false;
    //boolean for if query results have been downloaded
    $scope.download = false;


    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    //redirect to login if invalid user
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });

    //for logout dropdown
    $scope.toggleLogoutDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.logoutisopen = !$scope.status.logoutisopen;
    };

    //for sort by dropdown
    $scope.toggleSortByDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.sortbyisopen = !$scope.status.sortbyisopen;
    };

    //sets the sort by parameters
    $scope.setSort = function (sort) {
        $scope.propertyName = sort;
        $scope.reverse = false;
        if (sort == 'dateCreatedReverse') {
            $scope.propertyName = 'dateCreated';
            $scope.reverse = true;
        }
    };

    //get a list of all the queries
    $scope.getQueries = function () {
        if ($rootScope.user.roles == 'ROLE_ADMIN') {
            $scope.getAllQueries = function () {
                queryService.getAllQueries().then(
                    //success
                    function (response) {
                        $scope.queryList = eval(response);
                    },
                    //error
                    function (error) {
                        $scope.queryList = [];
                        $scope.alerts.push({
                            msg: error.message,
                            type: 'danger'
                        });
                    })
            }
            $scope.getAllQueries();
        } else {
            $scope.getUserQueries = function () {
                queryService.getUserQueries().then(
                    //success
                    function (response) {
                        $scope.queryList = eval(response);
                    },
                    //error
                    function (error) {
                        $scope.queryList = [];
                        $scope.alerts.push({
                            msg: error.message,
                            type: 'danger'
                        });
                    })
            }
            $scope.getUserQueries();
        }
    }
    $scope.getQueries();

    //opens view modal
    $scope.view = function (q) {
        var modalInstance = $uibModal.open({
            templateUrl: 'viewQueryModalContent.html',
            controller: 'ViewQueryModalInstanceCtrl',
            size: 'lg',
            resolve: {
                query: function () {
                    return q;
                }
            }
        });
        //refresh queries
        modalInstance.result.then(function (q) {
            $scope.getQueries();
        })
    };

    //opens deleteQuery modal for query q
    $scope.deleteQuery = function (q) {
        var modalInstance = $uibModal.open({
            templateUrl: 'queryDelete.html',
            controller: 'QueryDeleteModalCtrl',
            size: 'md',
            resolve: {
                query: function () {
                    return q;
                }
            }
        });
        //on modal completion
        modalInstance.result.then(function (q) {
            $log.warn('Deleted', q);
            queryService.deleteQuery(q).then(
                //success
                function (response) {
                    for (i in $scope.queryList) {
                        if (q.name == $scope.queryList[i].name) {
                            $scope.queryList.splice(i, 1)
                            $scope.alerts.push({
                                msg: "Query deleted",
                                type: 'success'
                            })
                        }
                    }
                },
                //error
                function (error) {
                    $scope.alerts.push({
                        msg: error.message,
                        type: 'danger'
                    });
                });
        });
    };
});
//controller for an instance of ViewQueryModal
queries.controller('ViewQueryModalInstanceCtrl', function ($scope, $uibModalInstance, $log, query, queryService, issueService) {
    //
    $scope.query = query;
    //
    $scope.maxSteps = 2;
    //what step is the modal on
    $scope.step = 1;
    //
    $scope.tableResult = {};
    //list of alerts
    $scope.alerts = [];
    //
    $scope.postReportSubmissionMessage = "";
    //
    $scope.isSaveCollapsed = true;
    //
    $scope.loadingPreview = false;
    //
    $scope.queryRanFine = true;
    //
    $scope.connectionFailed = false;
    //
    $scope.noResults = false;
    //
    $scope.reportSubmitted = false;
    //
    $scope.shouldShowNotifyDevsForm = false;
    //
    $scope.shouldShowRequestForm = false;
    //initialize new problem
    $scope.newProblemInput = {
            subject: '',
            body: ''
        }
        //initialize a new request
    $scope.newRequestInput = {
        subject: '',
        body: '',
        type: 'VIEW'
    }


    //advance the modal to the next step
    $scope.next = function () {
        $scope.step++;
        if ($scope.step == 2) {
            $log.log("runQuery()");
            $scope.runQuery();
        }
    };

    //go back a step in the modal
    $scope.previous = function () {
        $scope.step--;
        if ($scope.step < $scope.maxSteps) {
            $scope.progressType = null;
            $scope.tableResult = null;
        }
        $scope.queryRanFine = true;
        $scope.noResults = false;
    };

    //dismiss the modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    //updates a query
    $scope.updateQuery = function () {
        queryService.updateQuery($scope.query, $scope.query.sqlString).then(
            //success
            function (response) {
                $uibModalInstance.close($scope.query);
            },
            //error
            function (error) {
                $scope.alerts.push({
                    msg: error.message,
                    type: 'danger'
                });
            })
    };

    //save the edit query as a new query
    $scope.saveAs = function () {
        if ($scope.newQuery.description == null || $scope.newQuery.description == undefined) {
            $scope.newQuery.description = "";
        }
        $scope.newQuery.sqlString = $scope.query.sqlString;
        queryService.saveQuery($scope.newQuery).then(
            //success
            function (response) {
                $scope.alerts.push({
                    msg: "Query Successfully Saved!",
                    type: 'success'
                });
                $uibModalInstance.close(response);
            },
            //error
            function (error) {
                $scope.alerts.push({
                    msg: error.message,
                    type: 'danger'
                });
            });
    };

    //create new zeppelin note
    $scope.exportZeppelin = function () {
        var newNote = {
            name: $scope.query.name,
            paragraphs: [
                {
                    title: $scope.query.description,
                    text: '%hive\n' + $scope.query.sqlString
                }
            ]
        }
        queryService.newZeppelinQuery(newNote).then(function (response) {
            window.open(window.zeppelin + '#/notebook/' + response.body);
        })
    };

    //run the query
    $scope.runQuery = function () {
        $scope.loadingPreview = true;
        var querySQL = $scope.query.sqlString;
        queryService.runQuery(querySQL).then(
            //success callback
            function (response) {
                $scope.loadingPreview = false;
                if (response.rows == undefined || response.rows.length == 0) {
                    // no results
                    $scope.progressType = 'danger';
                    $scope.queryRanFine = false;
                    $scope.noResults = true;
                    $scope.newProblemInput.body = "Cliffhanger Report: Running the join query succeeded but the result table was empty. \nQuery used: \n" + querySQL;
                } else {
                    $scope.tableResult = response;
                    $scope.progressType = 'success';
                }
            },
            //error
            function (error) {
                $scope.loadingPreview = false;
                $scope.progressType = 'danger';
                $scope.queryRanFine = false;
                $scope.connectionFailed = true;
                $scope.newProblemInput.body = "ERROR : \n" + error.message + "\n\nQUERY : \n" + querySQL;
                //                $scope.newProblemInput.body = "Cliffhanger Report: HTTP call during method runQuery() in QueryService.js was not status 200. There is likely a problem with the REST service or Hive. \nQuery used: \n" + querySQL;
                $log.error(error);
                $scope.errorMsg = error.message;
            });
    };

    //show notify devs form
    $scope.showNotifyDevsForm = function () {
        $scope.shouldShowNotifyDevsForm = true;
    };

    //hide Notify Devs Form
    $scope.hideNotifyDevsForm = function () {
        $scope.shouldShowNotifyDevsForm = false;
    };

    //creates and sends a new Discussion Thread - problem
    $scope.reportProblem = function () {
        issueService.createIssue($scope.newProblemInput).then(
            //success
            function (response) {
                $scope.postReportSubmissionMessage = "Your problem has been reported to the developers.";
                $scope.reportSubmitted = true;
            },
            //error
            function (data) {
                $scope.postReportSubmissionMessage = "There was a problem reporting your problem.";
                $scope.reportSubmitted = false;
            });
    };

    //showRequestForm
    $scope.showRequestForm = function () {
        $scope.shouldShowRequestForm = true;
        $scope.newRequestInput.subject = 'Requesting new Table/View using the query ' + $scope.query.name;
        $scope.newRequestInput.body = $scope.query.sqlString;
    };

    //hideRequestForm
    $scope.hideRequestForm = function () {
        $scope.shouldShowRequestForm = false;
    };

    //creates and sends a new Discussion Thread - request statement
    $scope.sendRequest = function () {
        $scope.newRequestInput.subject = $scope.newRequestInput.type + " " + $scope.newRequestInput.subject;
        issueService.createIssue($scope.newRequestInput).then(
            //success
            function (response) {
                $scope.postReportSubmissionMessage = "Your request has been sent to the developers.";
                $scope.reportSubmitted = true;
            },
            //error
            function (data) {
                $scope.postReportSubmissionMessage = "There was a problem sending your request.";
                $scope.reportSubmitted = false;
            });
    };
});

//controller for instance of QueryDeleteModal
queries.controller('QueryDeleteModalCtrl', function ($scope, $uibModalInstance, $log, query) {
    $scope.query = query;
    //complete modal
    $scope.delete = function () {
        $uibModalInstance.close(query);
    };
    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

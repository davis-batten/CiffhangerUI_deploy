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
    $scope.selected = [];
    $scope.showNoQueriesMessage = false;
    $scope.download = false;
    //queries sorted by date created by default
    $scope.propertyName = 'dateCreated';
    $scope.alerts = []; //list of alerts to show to user
    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    //set theme color
    $rootScope.theme.color = 'blue';
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });
    $scope.isCollapsed = true;
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
    $scope.setSort = function (sort) {
        $scope.propertyName = sort;
        $scope.reverse = false;
        if (sort == 'dateCreatedReverse') {
            $scope.propertyName = 'dateCreated';
            $scope.reverse = true;
        }
    };
    $scope.getQueries = function () {
        if ($rootScope.user.roles == 'ROLE_ADMIN') {
            $scope.getAllQueries = function () {
                queryService.getAllQueries().then(function (data) {
                    $log.debug('response', data);
                    if (data.status == 'Success') {
                        $log.debug('data obj', data.data);
                        $scope.queryList = eval(data.data);
                    } else {
                        $scope.queryList = [];
                    }
                })
            }
            $scope.getAllQueries();
        } else {
            $scope.getUserQueries = function () {
                queryService.getUserQueries().then(function (data) {
                    $log.debug('response', data);
                    if (data.status == 'Success') {
                        $log.debug('data obj', data.data);
                        $scope.queryList = eval(data.data);
                    } else {
                        $scope.queryList = [];
                    }
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
            queryService.deleteQuery(q).then(function (response) {
                for (i in $scope.queryList) {
                    if (q.name == $scope.queryList[i].name) {
                        $scope.queryList.splice(i, 1)
                        $scope.alerts.push({
                            msg: "Query deleted",
                            type: 'success'
                        })
                    }
                }
            }, function (response) {
                $scope.alerts.push({
                    msg: 'Problem communicating',
                    type: 'danger'
                })
                $log.log($scope.data)
            });
        });
    };
});
//controller for an instance of ViewQueryModal
queries.controller('ViewQueryModalInstanceCtrl', function ($scope, $uibModalInstance, $log, query, queryService, issueService) {
    $scope.query = query;
    $scope.maxSteps = 2;
    $scope.isSaveCollapsed = true;
    $scope.tableResult = {};
    $scope.alerts = [];
    $scope.loadingPreview = false;
    $scope.queryRanFine = true;
    $scope.connectionFailed = false;
    $scope.noResults = false;
    $scope.postReportSubmissionMessage = "";
    $scope.reportSubmitted = false;
    $scope.newProblemInput = {
        subject: '',
        body: ''
    }
    $scope.newRequestInput = {
        subject: '',
        body: '',
        type: 'VIEW'
    }
    $scope.shouldShowNotifyDevsForm = false;
    $scope.shouldShowRequestForm = false;
    $scope.step = 1; //what step is the modal on
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
    $scope.updateQuery = function () {
        queryService.updateQuery($scope.query, $scope.query.sqlString).then(function (response) {
            if (response.status == 'Success') {
                $log.log('Successfullly updated query');
                $uibModalInstance.close($scope.query);
            } else {
                $scope.alerts.push({
                    msg: 'Failed to update query',
                    type: 'danger'
                });
            }
        }, function (response) {
            $log.error(response);
            $scope.alerts.push({
                msg: 'Failed to update query',
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
        queryService.saveQuery($scope.newQuery).then(function (data) {
            if (data.status == 'Success') {
                $scope.alerts.push({
                    msg: "Query Successfully Saved!",
                    type: 'success'
                });
                $log.debug(data);
                $uibModalInstance.close(data.data);
            } else {
                $scope.alerts.push({
                    msg: "Save Failed",
                    type: 'danger'
                });
                $log.debug(data);
            }
            $log.debug($scope.statement);
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
        queryService.runQuery(querySQL).then(function (response) { //success callback
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
        }, function (error) {
            $scope.loadingPreview = false;
            $scope.progressType = 'danger';
            $scope.queryRanFine = false;
            $scope.connectionFailed = true;
            $scope.newProblemInput.body = "Cliffhanger Report: HTTP call during method runQuery() in QueryService.js was not status 200. There is likely a problem with the REST service or Hive. \nQuery used: \n" + querySQL;
            $log.error(error);
            $scope.errorMsg = error.message;
        });
    };
    $scope.showNotifyDevsForm = function () {
        $scope.shouldShowNotifyDevsForm = true;
    };
    $scope.hideNotifyDevsForm = function () {
        $scope.shouldShowNotifyDevsForm = false;
    };
    $scope.reportProblem = function () {
        issueService.createIssue($scope.newProblemInput).then(function (response) {
            // success
            $scope.postReportSubmissionMessage = "Your problem has been reported to the developers.";
            $scope.reportSubmitted = true;
        }, function (data) {
            // fail
            $scope.postReportSubmissionMessage = "There was a problem reporting your problem.";
            $scope.reportSubmitted = false;
        });
    };
    $scope.showRequestForm = function () {
        $scope.shouldShowRequestForm = true;
        $scope.newRequestInput.subject = 'Request for: ' + $scope.query.name + ' Query';
        $scope.newRequestInput.body = $scope.query.sqlString;
    };
    $scope.hideRequestForm = function () {
        $scope.shouldShowRequestForm = false;
    };
    $scope.sendRequest = function () {
        $scope.newRequestInput.subject = $scope.newRequestInput.type + " " + $scope.newRequestInput.subject;
        issueService.createIssue($scope.newRequestInput).then(function (response) {
            //success
            $scope.postReportSubmissionMessage = "Your request has been sent to the developers.";
            $scope.reportSubmitted = true;
        }, function (data) {
            //fail
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

//service for dealing with datasets on the Grails backend using REST API
angular.module('cliffhanger.datasets').service('datasetService', function ($log, $http, $rootScope, $q) {
    //this service method creates a new Dataset on the backend
    this.addDataset = function (newDataset) {
            $log.log("calling addDataset with: " + JSON.stringify(newDataset));
            return $http.post($rootScope.baseUrl + '/dataset/create', newDataset).then(
                //success callback
                function (response) {
                    $log.info('Success!');
                    $log.info(response);
                    return response.data;
                }, //error callback
                function (response) {
                    $log.warn('Failure!');
                    $log.warn(response);
                    return $q.reject(response.data);
                });
        }
        //this service method gets an existing Dataset from the backend
    this.getDataset = function (name) {
            $log.log(JSON.stringify(name));
            return $http.get($rootScope.baseUrl + '/dataset/get' + name).then(
                //success callback
                function (response) {
                    $log.info('Success!');
                    $log.info(response);
                    return response.data;
                }, //error callback
                function (response) {
                    $log.warn('Failure!');
                    $log.warn(response);
                    return $q.reject(response.data);
                });
        }
        //this service method gets all existing Datasets from the backend
    this.getAllDatasets = function () {
            return $http.get($rootScope.baseUrl + '/dataset/list').then(function (response) { //success callback
                $log.info(response); //list all data from response
                if (response.data.status == 'Success') {
                    $log.info('Successfully retrieved datasets');
                    return response.data;
                } else {
                    $log.warn('Failed to retrieve datasets');
                    return $q.reject(response.data);
                }
            }, function (response) { //error callback
                $log.warn(response);
                return $q.reject(response.data);
            });
        }
        //this service method updates a specified dataset on the backend
    this.updateDataset = function (prevName, dataset) {
            return $http.put($rootScope.baseUrl + '/dataset/update/' + prevName, dataset).then(
                //success callback
                function (response) {
                    return response.data;
                }, //error callback
                function (response) {
                    return $q.reject(response.data);
                });
        }
        //this service method deletes a specified dataset from the backend
    this.deleteDataset = function (dataset) {
        var datasetName = dataset.name;
        return $http.delete($rootScope.baseUrl + '/dataset/delete/' + datasetName).then(function (response) { //success callback
            $log.info(response); //list all data from response
            if (response.data.status == 'Success') {
                $log.info('Successfully deleted dataset ' + datasetName);
                return response.data;
            } else {
                $log.warn('Failed to delete ' + datasetName);
                return $q.reject(response.data);
            }
        }, function (response) { //error callback
            $log.warn(response);
            return $q.reject(response);
        });
    }
});

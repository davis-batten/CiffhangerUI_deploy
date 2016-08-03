//service for dealing with datasets on the Grails backend using REST API
angular.module('cliffhanger.datasets').service('datasetService', function ($log, $http, $rootScope, $q) {
    //this service method creates a new Dataset on the backend
    this.addDataset = function (newDataset) {
            $log.log("calling addDataset with: " + JSON.stringify(newDataset));
            //$log.log("newDataSet createdBy: " + JSON.stringify(newDataset.createdBy));
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

    // this service method gets a list of column data from a hive table including column names and data types
    this.getHiveTableSchema = function (dbTableName) {
        var dbTableInfo = {
            db_table_name: dbTableName,
            username: $rootScope.user.username
        };
        return $http.post($rootScope.baseUrl + '/dataset/hiveLookup/', dbTableInfo).then(
            function (response) {
                //            function called after success
                $log.info("found table " + dbTableName + " in hive. Column data: " + response);
                return response.data;
            },
            function (response) {
                //            function called after error
                $log.info("table " + dbTableName + " not found in Hive. Error message: " + response.data.data);
                return $q.reject(response.data);
            });
    }

    // this service method gets a list of DB_Name.Table_Names 
    this.getAllTables = function () {
        return $http.get($rootScope.baseUrl + '/dataset/listHiveTables/' + $rootScope.user.username).then(
            function (response) {
                //            function called after success
                $log.info("Hive tables retrieved");
                return response.data;
            },
            function (response) {
                //            function called after error
                $log.info("failed to retrieve hive tables");
                return $q.reject(response.data);
            });
    }

    // this service method gets the first 5 rows of a dataset
    this.previewDataset = function (dataset) {
        $log.debug('dataset', dataset)
        var allColumnNames = ""
        for (var i = 0; i < dataset.attributes.length; i++) {
            if (i != 0) allColumnNames += ", ";
            allColumnNames += dataset.attributes[i].col_name;
        }
        var query = "SELECT " + allColumnNames + " FROM " + dataset.db_table_name + " LIMIT 5";
        var req = {
            query: query,
            username: $rootScope.user.username
        }
        return $http.post($rootScope.baseUrl + '/query/run', req).then(
            function (response) {
                $log.debug('preview', response)
                return response.data;
            },
            function (error) {
                return $q.reject(error);
            }
        );
    }
});

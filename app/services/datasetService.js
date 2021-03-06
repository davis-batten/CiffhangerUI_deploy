//service for dealing with datasets on the Grails backend using REST API
angular.module('cliffhanger.datasets').service('datasetService', function ($log, $http, $rootScope, $q) {

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

    this.getAllDatasets = function () {
        return $http.get($rootScope.baseUrl + '/dataset/list').then(
            //success
            function (response) {
                $log.info(response); //list all data from response
                $log.info('Successfully retrieved datasets');
                return response.data;

            },
            //error
            function (response) {
                $log.warn(response);
                return $q.reject(response.data);
            });
    }

    this.updateDataset = function (prevName, dataset) {
        var input = {
            username: $rootScope.user.username,
            dataset: dataset
        }
        return $http.put($rootScope.baseUrl + '/dataset/update/' + prevName, input).then(
            //success callback
            function (response) {
                return response.data;
            }, //error callback
            function (response) {
                return $q.reject(response.data);
            });
    }

    this.deleteDataset = function (dataset) {
        var datasetName = dataset.name;
        return $http.delete($rootScope.baseUrl + '/dataset/delete/' + datasetName).then(
            //success
            function (response) {
                $log.info('Successfully deleted dataset ', datasetName);
                return response.data;
            },
            //error
            function (response) {
                $log.error(response);
                return $q.reject(response);
            });
    }

    // Import a list of Attribute objects for a dataset which already have the col_names and data_types filled in using a string containing databaseName.tableName
    this.getHiveTableSchema = function (dbTableName) {
        var dbTableInfo = {
            db_table_name: dbTableName,
            username: $rootScope.user.username
        };
        return $http.post($rootScope.baseUrl + '/dataset/hiveLookup/', dbTableInfo).then(
            function (response) {
                //            function called after success
                $log.info("found table " + dbTableName + " in hive. Column data: ", response.data);
                return response.data;
            },
            function (response) {
                //            function called after error
                $log.info("table " + dbTableName + " not found in Hive. Error message: " + response.data.message);
                return $q.reject(response.data);
            });
    }

    // Get a list of DB_Name.Table_Names 
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
                $log.error(response);
                return $q.reject(response.data);
            });
    }

    // Get first 5 rows of a data for the specified dataset
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
                $log.debug(error);
                return $q.reject(error.data);
            }
        );
    }
});

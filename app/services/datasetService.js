angular.module('cliffhanger.datasets')
    .service('datasetService', function ($log, $http, $rootScope) {

        this.addDataset = function (name, desc, attributes) {
            var newDataset = {
                name: name,
                description: desc,
                attributes: attributes
            }

            $log.log(JSON.stringify(newDataset));

            $http.post($rootScope.baseUrl + '/dataset/create', JSON.stringify(newDataset))
                .then(function (response) {
                    $log.info('Success!');
                    $log.info(response);
                    //TODO return response
                }, function (response) {
                    $log.warn('Failure!');
                    $log.warn(response);

                });
        }
    });

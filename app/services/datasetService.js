//service for dealing with datasets on the Grails backend using REST API
angular.module('cliffhanger.datasets')
    .service('datasetService', function ($log, $http, $rootScope) {

        //this service method creates a new Dataset on the backend
        this.addDataset = function (name, desc, attributes) {
            var newDataset = {
                name: name,
                description: desc,
                attributes: attributes
            }

            $log.log(JSON.stringify(newDataset));

            $http.post($rootScope.baseUrl + '/dataset/create', JSON.stringify(newDataset))
                .then(
                    //success callback
                    function (response) {
                        $log.info('Success!');
                        $log.info(response);
                        //TODO return response
                    },
                    //error callback
                    function (response) {
                        $log.warn('Failure!');
                        $log.warn(response);

                    }
                );
        }

    });

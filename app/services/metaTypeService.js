//service for dealing with Meta-Types on the Grails backend using REST API
angular.module('cliffhanger.metaTypes')
    .service('metaTypeService', function ($log, $http, $rootScope, $q) {
        
       
         //this service method creates a new Meta-tag on the backend
        this.addMetaType = function (name, desc) {

            $log.log(JSON.stringify(newMetaType));
            $http.post($rootScope.baseUrl + '/metaType/create', newMetaType)
            
                .then(
                    //success callback
                    function (response) {
                        $log.info('Success!');
                        $log.info(response);

                    },
                    //error callback
                    function (response) {
                        $log.warn('Failure!');
                        $log.warn(response);

                    }
                );
        }




        //this service method gets an existing Meta-Type from the backend
        this.getMetaType = function (name) {

            $log.log(JSON.stringify(name));

            $http.get($rootScope.baseUrl + '/metaType/get' + name)
                .then(
                    //success callback
                    function (response) {
                        $log.info('Success!');
                        $log.info(response);

                        //$scope.data = (reponse.data.);
                    },
                    //error callback
                    function (response) {
                        $log.warn('Failure!');
                        $log.warn(response);

                    }
                );
        }



        //this service method gets all existing Meta-Types from the backend
        this.getAllMetaTypes = function () {


            $http.get($rootScope.baseUrl + '/metaType/list')
                .then(
                    //success callback
                    function (response) {
                        if (response.data.status == 'Success') {
                            $log.info('Success!');
                            $log.info(response);
                            //list all data from response
                            return response.data
                        } else {
                            $log.warn('Failed to retrieve meta-types');
                            return $q.reject(response.data);
                        }
                    },
                    //error callback
                    function (response) {
                        $log.warn('Failure!');
                        $log.warn(response);

                    }
                );
        }
    });

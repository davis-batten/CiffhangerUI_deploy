//service for dealing with Meta-Types on the Grails backend using REST API
angular.module('cliffhanger.tags')
    .service('tagService', function ($log, $http, $rootScope, $q) {


        //this service method creates a new Meta-tag on the backend
        this.addTag = function (name, desc) {
            var newTag = {
                name: name,
                description: desc
            }

            $log.log('json newTag', JSON.stringify(newTag));
            return $http.post($rootScope.baseUrl + '/tag/create', newTag)

            .then(
                //success callback
                function (response) {
                    $log.info('Success!');
                    //$log.debug('add tag response', response);
                    return response.data;
                },
                //error callback
                function (response) {
                    $log.warn('Failure!');
                    $log.warn(response);
                    return $q.reject(response.data);

                }
            );
        }




        //this service method gets an existing Meta-Type from the backend
        this.getTag = function (name) {

            $log.log(JSON.stringify(name));

            $http.get($rootScope.baseUrl + '/tag/get' + name)
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
        this.getAllTags = function () {


            return $http.get($rootScope.baseUrl + '/tag/list')
                .then(
                    //success callback
                    function (response) {
                        if (response.data.status == 'Success') {
                            $log.info('Success!');
                            $log.info('response', response);
                            //list all data from response
                            return response.data;
                        } else {
                            $log.warn('Failed to retrieve tags');
                            return $q.reject(response.data);
                        }
                    },
                    //error callback
                    function (response) {
                        $log.warn('Failure!');
                        return $q.reject(response.data);

                    }
                );

        }
    });

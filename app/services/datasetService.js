angular.module('cliffhanger.datasets')
    .service('datasetService', function($log){

        this.addDataset = function(name, desc, attributes) {
            var newDataset = {
                name: name,
                description: desc,
                attributes: attributes
            }

            $log.log(JSON.stringify(newDataset));
        }


});

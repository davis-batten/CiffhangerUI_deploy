CliffhangerUI

This project is the front-end for the Cliffhanger app.

Installation: 
    Make sure you have the following node_modules installed: 
        + angular-ui-bootstrap
        + bower
        + http-server

    Make sure you have the following bower_components installed:
        + angular
        + angular-animate
        + angular-bootstrap-checkbox
        + angular-route
        + bootstrap
        + jquery
    
    
To run the project locally on a webserver execute the following command at the project root folder:
    npm start
This will start the app at the default location of localhost:8000
    

File Directory Format:

    app -- all files to do with the app itself
        bower_components -- components installed with bower (in gitignore!)
        components -- custom components (and components installed with node)
        services -- holds angular services that communicate with grails backend
            datasetService.js -- service for dataset entities
        views -- where all of the main UI files are
            compare -- files for #/datasets/compare
            dashboard -- files for #/dashboard
            datasets -- files for #/datasets
            metaTypes -- files for #/datasets/metaTypes
            queries -- files for #/queries
        app.css -- main css for entire application
        app.js -- main javascript module for application
        index.html -- main html for application
    node_modules -- files installed with node (in gitignore!)
    .bowerrc -- bower path config
    .gitignore -- tells git which files to ignore during commits
    bower.json -- bower config file
    LICENSE -- contains info on MIT license
    package.json -- npm config file
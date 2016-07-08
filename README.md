CliffhangerUI
=============

This project is the front-end for the Cliffhanger app.

Installation: 
-------------

Make sure you have the following node_modules installed: 
-   angular-ui-bootstrap
-   bower (global)
-   forever (global)
-   http-server
-   jasmine-core
-   karma-chrome-launcher
-   karma-html-reporter
-   karma-jasmine
-   karma-junit-reporter \*
-   lodash
-   ng-tags-input \*
-   node-http-server \*
-   shelljs \*
        
Make sure you have the following bower_components installed:
-   angular
-   angular-animate
-   angular-bootstrap-checkbox
-   angular-loader
-   angular-mocks
-   angular-route
-   angular-sanitize
-   angular-tags
-   angular-ui-bootstrap-bower \*
-   angular-ui-grid \*  
-   bootstrap
-   bootstrap-css \*
-   font-awesome \*
-   jquery
-   ng-csv
-   ng-tags-input
        
Note: Just running "npm start" should take care of installing most of these.
    
*Items marked with an * may not be necessary to run/test app.*
    
How To Use:
-----------

To run the project locally on a webserver execute the following command at the project root folder: `npm start`
This will start the app at the default location of localhost:8000.

To test the project execute the following command at the project root folder: `npm test`
Then open a webbrowser at localhost:9876, test results will be output both to the command line and karma_html/index.html.
    
    
**Production deployment instructions *coming soon*!**


File Directory Format:
----------------------

    api_target -- files for web version of API documentation
    app -- all files to do with the app itself
        bower_components -- components installed with bower (in gitignore!)
        components -- custom components (and components installed with node)
        resources -- images and media (like icons)
        services -- holds angular services that communicate with grails backend
            tests -- location of all jasmine tests for services
        views -- where all of the main UI files are
            compare -- compare matrix view
            dashboard -- currently unused
            datasets -- dataset skeleton management view
            queries -- saved queries management view
            query_wizard -- build query wizard view
            tags -- tag management view
        app.css -- main css for entire application
        app.js -- main javascript module for application
        index.html -- main html for application
    karma_html -- HTML output of most recently run karma/jasmine tests
    node_modules -- files installed with node (in gitignore!)
    .bowerrc -- bower path config
    .gitignore -- tells git which files to ignore during commits
    bower.json -- bower config file
    karma.conf.js -- global configurations for karma testing suite
    LICENSE -- contains info on MIT license
    package.json -- npm config file
    swagger.yaml -- API documentation using OpenAPI specs
    
    
    Note: Files in the form *_test.js are Jasmine tests
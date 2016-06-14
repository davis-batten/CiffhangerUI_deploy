//jshint strict: false
module.exports = function (config) {
    config.set({

        basePath: './app',

        files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-bootstrap-checkbox/angular-bootstrap-checkbox.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'app.js',
      'components/**/*.js',
      'views/**/*.js',
      'services/*.js'
      ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-html-reporter'
    ],

        reporters: ['progress', 'html'],

        htmlReporter: {
            namedFiles: true,
            urlFriendlyName: true,
            reportName: 'index'
        }

    });
};

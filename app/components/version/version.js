'use strict';

angular.module('cliffhanger.version', [
  'cliffhanger.version.interpolate-filter',
  'cliffhanger.version.version-directive'
])

.value('version', '0.0.1');

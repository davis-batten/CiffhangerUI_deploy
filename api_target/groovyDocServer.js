var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){
    sys.puts(stdout);
}

exec("http-server ./groovy_api -p 4444", puts);

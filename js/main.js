function getMD5(file, callback)
{
	var w = new Worker('js/md5.worker.js');
	w.onmessage = function(e){ callback(e.data); };
	w.postMessage(this.edf);
}

$('#original-rom').change(function(e)
{
	getMD5(e.target.files[0], function(x){ console.log(x); });
});
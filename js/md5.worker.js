// @from http://codepen.io/tymondesigns/pen/tswhE
self.addEventListener('message', function(e)
{
	importScripts('vendor/spark-md5.min.js');
	postMessage(SparkMD5.ArrayBuffer.hash(
		(new FileReaderSync()).readAsArrayBuffer(e.data)
	));
},
false);

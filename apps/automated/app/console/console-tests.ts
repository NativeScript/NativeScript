export var test_DummyTestForSnippetOnly0 = function () {
	// >> console-log
	console.log('Hello, world!');
	console.info('I am NativeScript');
	console.warn('Low memory');
	console.error('Uncaught Application Exception');
	// << console-log
};

export var test_DummyTestForSnippetOnly1 = function () {
	// >> console-time
	console.time('LoadTime');
	// << console-time
	// >> console-timeend
	console.timeEnd('LoadTime');
	// << console-timeend
};

export var test_DummyTestForSnippetOnly2 = function () {
	// >> console-assert
	console.assert(2 === 2, '2 equals 2');
	// << console-assert
};

export var test_DummyTestForSnippetOnly3 = function () {
	// >> console-dir
	var obj = { name: 'John', age: 34 };
	console.dir(obj);
	// << console-dir
};

export var test_DummyTestForSnippetOnly5 = function () {
	// >> console-trace
	console.trace();
	// << console-trace
};

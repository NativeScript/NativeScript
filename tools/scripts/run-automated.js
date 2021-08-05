/**
 * Script to run the automated tests & exit after the tests are finished.
 * Mainly intended to be used on CI
 *
 * Usage: node run-automated.js <platform>
 */
const spawn = require('child_process').spawn
const kill = require('tree-kill');

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const spawned_process = spawn('npm', ['start', `apps.automated.${process.argv[2]}`], {
	stdio: ['inherit', 'pipe', 'pipe']
})
const {stdout, stderr} = spawned_process

stdout.pipe(process.stdout)
stderr.pipe(process.stderr)

let lineBuffer = []
let timeout_id;

function exit(code) {
	kill(spawned_process.pid)
	process.exit(code)
}

function onTimeout() {
	console.log(`Tests TIMEOUT (${TIMEOUT_MS}ms)`)
	exit(1)
}

function healthCheck() {
	clearTimeout(timeout_id)
	timeout_id = setTimeout(onTimeout, TIMEOUT_MS)
}

stdout.on('data', data => {
	healthCheck();
	const line = data.toString();

	// start buffering lines when tests are complete
	if(lineBuffer.length || line.includes('=== ALL TESTS COMPLETE ===')) {
		lineBuffer.push(line)
	}

	if(line.includes('Tests EOF!')) {
		let ok = lineBuffer.join('\n').includes('OK, 0 failed')
		console.log(ok ? 'Tests PASSED' : 'Tests FAILED');
		exit(ok ? 0 : 1)
	}
})

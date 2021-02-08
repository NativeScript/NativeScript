/**
 * Script to run the automated tests & exit after the tests are finished.
 * Mainly intended to be used on CI
 *
 * Usage: node run-automated.js <platform>
 */
const spawn = require('child_process').spawn
const kill = require('tree-kill');

const spawned_process = spawn('npm', ['start', `apps.automated.${process.argv[2]}`], {
	stdio: ['inherit', 'pipe', 'pipe']
})

const {stdout, stderr} = spawned_process

stdout.pipe(process.stdout)
stderr.pipe(process.stderr)

let lineBuffer = []

stdout.on('data', data => {
	const line = data.toString();

	// start buffering lines when tests are complete
	if(lineBuffer.length || line.includes('=== ALL TESTS COMPLETE ===')) {
		lineBuffer.push(line)
	}

	if(line.includes('Tests EOF!')) {
		let ok = lineBuffer.join('\n').includes('OK, 0 failed')
		console.log(ok ? 'Tests PASSED' : 'Tests FAILED');
		kill(spawned_process.pid)
		process.exit(ok ? 0 : 1)
	}
})


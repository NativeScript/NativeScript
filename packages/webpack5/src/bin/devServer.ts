import { createServer } from 'http'
// import { spawn } from 'child_process'
// yarn --cwd /Users/rigor789/Code/echo-server start

// let statuses: {
// 	[hash: string]: IHMRStatusData
// } = {}

export interface IHMRStatusData {
	seq: number
	uuid: string,
	hash: string
	status: string
}

export function run() {
	createServer((req, res) => {
		if (req.url === '/ping') {
			console.log('PING -> PONG!')
			return res.end("Pong.");
		}

		if (req.method !== 'POST') {
			res.statusCode = 400;
			return res.end("Unsupported method.");
		}

		let data = "";
		req.on("data", chunk => {
			data += chunk;
		});

		req.on("end", () => {
			try {
				const signal = JSON.parse(data) as IHMRStatusData;
				// if (!statuses[signal.hash] || statuses[signal.hash].seq < signal.seq) {
				// 	statuses[signal.hash] = signal
				// }
				if (process.send) {
					process.send({
						type: 'hmr-status',
						version: 1,
						hash: signal.hash,
						data: signal
					}, (error) => {
						if (error) {
							console.error(`Process Send Error: `, error);
						}

						return null;
					});
				}

				res.end('ok.');
			} catch (e) {
				res.statusCode = 400;
				res.end("Invalid JSON.");
			}
		});
	}).listen(8238)

	// spawn('/Users/rigor789/Code/echo-server/node_modules/.bin/ts-node', ['/Users/rigor789/Code/echo-server/index.ts'], {
	// 	cwd: '/Users/rigor789/Code/echo-server/',
	// 	stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
	// }).on('message', function (data) {
	// 	console.log({
	// 		messageFromEchoServer: data
	// 	});
	// });
}


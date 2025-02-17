import test from 'ava';
import delay from 'delay';
import inRange from 'in-range';
import timeSpan from 'time-span';
import pSettle from './index.js';

test('main', async t => {
	t.deepEqual(
		// eslint-disable-next-line prefer-promise-reject-errors
		await pSettle([delay(100, {value: 1}), 2, Promise.reject(3)]),
		[
			{
				isFulfilled: true,
				isRejected: false,
				value: 1,
			},
			{
				isFulfilled: true,
				isRejected: false,
				value: 2,
			},
			{
				isFulfilled: false,
				isRejected: true,
				reason: 3,
			},
		],
	);
});

test('concurrency option works', async t => {
	const fixture = [
		async () => {
			await delay(300);
			return 10;
		},
		async () => {
			await delay(200);
			return 20;
		},
		async () => {
			await delay(100);
			return 30;
		},
	];

	const end = timeSpan();

	t.deepEqual(
		await pSettle(fixture, {concurrency: 1}),
		[
			{
				isFulfilled: true,
				isRejected: false,
				value: 10,
			},
			{
				isFulfilled: true,
				isRejected: false,
				value: 20,
			},
			{
				isFulfilled: true,
				isRejected: false,
				value: 30,
			},
		],
	);

	t.true(inRange(end(), {start: 590, end: 760}));
});

test('handles empty iterable', async t => {
	t.deepEqual(await pSettle([]), []);
});

test('handles null and undefined', async t => {
	t.deepEqual(
		await pSettle([null, undefined]),
		[
			{
				isFulfilled: true,
				isRejected: false,
				value: null,
			},
			{
				isFulfilled: true,
				isRejected: false,
				value: undefined,
			},
		],
	);
});

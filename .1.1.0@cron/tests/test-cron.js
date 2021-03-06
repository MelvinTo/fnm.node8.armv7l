var chai = require('chai'),
	expect = chai.expect,
	sinon = require('sinon'),
	cron = require('../lib/cron');

describe('cron', function() {
	it('should run every second (* * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('* * * * * *', function() {
			c++;
		}, null, true);

		clock.tick(1000);
		job.stop();
		clock.restore();

		expect(c).to.eql(1);
	});

	it('should run second with oncomplete (* * * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('* * * * * *', function() {
			c++;
		}, function () {
			expect(c).to.eql(1);
			done();
		}, true);

		clock.tick(1000);
		clock.restore();
		job.stop();
	});

	it('should use standard cron no-seconds syntax (* * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('* * * * *', function() {
			c++;
		}, null, true);

		clock.tick(1000); //tick second

		clock.tick(59 * 1000); //tick minute

		job.stop();
		clock.restore();

		expect(c).to.eql(1);
	});

	it('should run every second for 5 seconds (* * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('* * * * * *', function() {
			c++;
		}, null, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();

		expect(c).to.eql(5);
	});

	it('should run every second for 5 seconds with oncomplete (* * * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('* * * * * *', function() {
			c++;
		}, function() {
			expect(c).to.eql(5);
			done();
		}, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should run every second for 5 seconds (*/1 * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('*/1 * * * * *', function() {
			c++;
		}, null, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(5);
	});

	//ensure that this is running on the second second
	it('should run every 2 seconds for 1 seconds (*/2 * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('*/2 * * * * *', function() {
			c++;
		}, null, true);

		clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(0);
	});

	it('should run every 2 seconds for 5 seconds (*/2 * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('*/2 * * * * *', function() {
			c++;
		}, null, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(2);
	});

	it('should run every second for 5 seconds with oncomplete (*/1 * * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('*/1 * * * * *', function() {
			c++
		}, function() {
			expect(c).to.eql(5);
			done();
		}, true);

		for (var i = 0; i < 5; i++)
			clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should run every second for a range ([start]-[end] * * * * *)', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('0-8 * * * * *', function() {
			c++;
		}, null, true);

		clock.tick(10000); //run for 10 seconds

		clock.restore();
		job.stop();
		expect(c).to.eql(8);
	});

	it('should run every second for a range with oncomplete ([start]-[end] * * * * *)', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('0-8 * * * * *', function() {
			c++;
		}, function() {
			expect(c).to.eql(8);
			done();
		}, true);

		clock.tick(10000);

		clock.restore();
		job.stop();
	});

	it('should run every second (* * * * * *) using the object constructor', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function() {
				c++;
			},
			start: true
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(1);
	});

	it('should run every second with oncomplete (* * * * * *) using the object constructor', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function(done) {
				c++;
			},
			onComplete: function () {
				expect(c).to.eql(1);
				done();
			},
			start: true
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should start and stop job', function(done) {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var job = new cron.CronJob('* * * * * *', function() {
			c++;
			this.stop();
		}, function() {
			expect(c).to.eql(1);

			clock.restore();
			done();
		});
		job.start();

		clock.tick(1000);
	});

	it('should run on a specific date', function() {
		var c = 0;
		var d = new Date();
		var clock = sinon.useFakeTimers(d.getTime());
		var s = d.getSeconds()+1;
		d.setSeconds(s);

		var job = new cron.CronJob(d, function() {
			var t = new Date();
			expect(t.getSeconds()).to.eql(d.getSeconds());
			c++;
		}, null, true);
		clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(1);
	});

	it('should run on a specific date with oncomplete', function(done) {
		var c = 0;
		var d = new Date();
		var clock = sinon.useFakeTimers(d.getTime());
		var s = d.getSeconds()+1;
		d.setSeconds(s);

		var job = new cron.CronJob(d, function() {
			var t = new Date();
			expect(t.getSeconds()).to.eql(d.getSeconds());
			c++;
		}, function() {
			expect(c).to.eql(1);
			done();
		}, true);
		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	describe('with timezone', function() {
		it('should run a job using cron syntax', function () {
			var clock = sinon.useFakeTimers();

			var c = 0;

			var moment = require("moment-timezone");
			var zone = "America/Chicago";

			// New Orleans time
			var t = moment();
			t.tz(zone);

			// Current time
			d = moment();

			// If current time is New Orleans time, switch to Los Angeles..
			if (t.hours() === d.hours()) {
				zone = "America/Los_Angeles";
				t.tz(zone);
			}
			expect(d.hours()).to.not.eql(t.hours());

			// If t = 59s12m then t.setSeconds(60)
			// becones 00s13m so we're fine just doing
			// this and no testRun callback.
			t.add(1, 's');
			// Run a job designed to be executed at a given 
			// time in `zone`, making sure that it is a different
			// hour than local time.
			var job = new cron.CronJob(t.seconds() + ' ' + t.minutes() + ' ' + t.hours() +  ' * * *', function(){
				c++;
			}, null, true, zone);

			clock.tick(1000);
			clock.restore();
			job.stop();
			expect(c).to.eql(1);
		});

		it('should run a job using a date', function () {
			var c = 0;

			var moment = require("moment-timezone");
			var zone = "America/Chicago";

			// New Orleans time
			var t = moment();
			t.tz(zone);

			// Current time
			d = moment();

			// If current time is New Orleans time, switch to Los Angeles..
			if (t.hours() === d.hours()) {
				zone = "America/Los_Angeles";
				t.tz(zone);
			}
			expect(d.hours()).to.not.eql(t.hours());

			d.add(1, 's');
			var clock = sinon.useFakeTimers(d._d.getTime());

			var job = new cron.CronJob(d._d, function() {
				c++;
			}, null, true, zone);

			clock.tick(1000);
			clock.restore();
			job.stop();
			expect(c).to.eql(1);
		});
	});

	it('should wait and not fire immediately', function() {
		var clock = sinon.useFakeTimers();
		var c = 0;

		var d = new Date().getTime() + 31 * 86400 * 1000;

		var job = cron.job(new Date(d), function() {
			c++;
		});
		job.start();

		clock.tick(1000);

		clock.restore();
		job.stop();
		expect(c).to.eql(0);
	});

	it('should start, change time, start again', function() {
		var c = 0;
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob('* * * * * *', function() {
			c++;
		});

		job.start();
		clock.tick(1000);

		job.stop();
		var time = cron.time('*/2 * * * * *');
		job.setTime(time);
		job.start();

		clock.tick(4000);

		clock.restore();
		job.stop();
		expect(c).to.eql(3);
  });

	it('should start, change time, exception', function() {
		var c = 0;
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob('* * * * * *', function() {
			c++;
		});

		var time = new Date();
		job.start();

		clock.tick(1000);

		job.stop();
		expect(function() {
			job.setTime(time);
		}).to.throw;

		clock.restore();
		job.stop();
		expect(c).to.eql(1);
	});

	it('should scope onTick to running job', function() {
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob('* * * * * *', function() {
			expect(job).to.be.instanceOf(cron.CronJob);
			expect(job).to.eql(this);
		}, null, true);

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should scope onTick to object', function() {
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob('* * * * * *', function() {
			expect(this.hello).to.eql('world');
			expect(job).to.not.eql(this);
		}, null, true, null, {'hello':'world'});

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should scope onTick to object within contstructor object', function() {
		var clock = sinon.useFakeTimers();

		var job = new cron.CronJob({
			cronTime: '* * * * * *',
			onTick: function() {
				expect(this.hello).to.eql('world');
				expect(job).to.not.eql(this);
			},
			start: true,
			context: {hello: 'world'}
		});

		clock.tick(1000);

		clock.restore();
		job.stop();
	});

	it('should not get into an infinite loop on invalid times', function() {
		var clock = sinon.useFakeTimers();

		var invalid1 = new cron.CronJob('* 60 * * * *', function() {
			assert.ok(true);
		}, null, true);
		var invalid2 = new cron.CronJob('* * 24 * * *', function() {
			assert.ok(true);
		}, null, true);

		clock.tick(1000);

		// assert that it gets here
		invalid1.stop();
		invalid2.stop();

		clock.restore();
	});

	it('should test start of month', function() {
		var c = 0;
		var d = new Date('12/31/2014');
		d.setSeconds(59);
		d.setMinutes(59);
		d.setHours(23);
		var clock = sinon.useFakeTimers(d.getTime());

		var job = new cron.CronJob('0 0 0 1 * *', function() {
			c++;
		}, null, true);

		clock.tick(1001);
		expect(c).to.eql(1);

		clock.tick(2678399001);
		expect(c).to.eql(1);

		clock.tick(2678400001); //jump over 2 firsts
		clock.restore();
		job.stop();

		expect(c).to.eql(3);
	});

	it('should run every second monday');
});

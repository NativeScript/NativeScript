Execute Tests
=============

Android:

```
npm run e2e -- --runType android23 --reuseDevice
```

iOS:

```
npm run  e2e -- --runType sim.iPhoneX.iOS112 --reuseDevice
```

Scenarios
=============

ROOT FRAME:

1. [Done] Show modal dialog with frame
	1. Navigate to modal second page within modal dialog
		1. Go back
	2. Show nested modal dialog
		2. Close nested modal dialog
	3. Show nested modal dialog with frame
		3. Close nested modal dialog
	4. Close modal dialog
2. [Done] Show modal dialog
	1. Show nested modal dialog
		1. Close nested modal dialog
	2. Show nested modal dialog with frame
		2. Close nested modal dialog
	3. Close modal dialog
3. [Done] Show modal tabview
	1. Navigate to second page within tab item frame
		1. Go back
	2. Show nested modal dialog
		2. Close nested modal dialog
	3. Show nested modal dialog with frame
		3. Close nested modal dialog
	4. Close modal dialog
4. Navigate to second page within root frame
	1. Show modal dialog with frame
		1. Navigate to second page within modal dialog
			1. Go back
		2. Show nested modal dialog
			2. Close nested modal dialog
		3. Show nested modal dialog with frame
			3. Close nested modal dialog
		4. Close modal dialog
	2. Show modal dialog
		1. Show nested modal dialog
			1. Close nested modal dialog
		2. Show nested modal dialog with frame
			2. Close nested modal dialog
		3. Close modal dialog
	3. Go back

ROOT TABVIEW:

[Same as above]

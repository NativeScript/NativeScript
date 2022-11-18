@nativescript/webpack rewrite

The rewrite allows us to simplify things, and introduce some breaking changes.
Listing them here, so we can keep track of them - will be in the merge commit, and the release notes once we are ready.

BREAKING CHANGES:
 - `package.json` main should now use a relative path to the package.json instead of the app directory
   
   For example (given we have a `src` directory where our app is):
   
   `"main": "app.js"` becomes `"main": "src/app.js"`  **OR** `"main": "src/app.ts"` (whether using JS or TS)
   
   This simplifies things, and will allow ctrl/cmd + clicking on the filename in some editors.
 
 - `postinstall` scripts have been removed.
 
   The configuration will not need to change in the user projects between updates.
 
   For existing projects we will provide an easy upgrade path, through `ns migrate` and a binary in the package.
   
   For new projects `ns create` should create the config file by invoking a binary in the package. 

 - removed resolutions for short imports - use full imports instead.
 
   For example:
   ```
   import http from 'http'
   // becomes
   import { http } from '@nativescript/core'
   ```

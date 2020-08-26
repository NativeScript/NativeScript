# Intro

This is a fork of `css-value`, with the reference repo available at:

https://github.com/NativeScript/css-value/tree/nativescript

Note that the NativeScript-related changes are in the `nativescript` branch.

To simplify development, we are not using a git submodule. All changes to `css-value` must be synced back to our forked repo, and ideally submitted to upstream in a pull request.

# Modifying css-value

All changes need to happen on a **master-based** branch in our fork at (same as above):

https://github.com/NativeScript/css-value/

Ideally we should have a pull request submitted upstream.

Changes not accepted (yet) to the upstream repo should be cherry-picked to the `nativescript` branch.

# Upgrading to a later release of css-value

1. Pull the latest changes from upstream to the master branch.
2. Push the updated master to our repo.
3. Review and rebase our changes in the `nativescript` branch on top of the new master.
4. Commit the changed package files (`.js`, `.json`, etc) to the NativeScript repo below the `css-value` folder.

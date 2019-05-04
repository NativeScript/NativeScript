# The plan file tells Habitat how to build a package.
#
# In this plan, we're asking Habitat to provide us with Node.js and NPM
# (by declaring a dependency on the core/node package) so we can install our
# application's JavaScript dependencies (and ultimately run our app). Then we
# copy the files we'll need to run the package into a directory in the Habitat
# Studio that will become the resulting package.
#
# To learn more about writing Habitat plans, see Developing Packages
# in the Habitat docs at https://www.habitat.sh/docs/developing-packages.
#
# To explore all Habitat-maintained and community-contributed packages,
# visit the Habitat Builder depot at https://bldr.habitat.sh/#/pkgs.

pkg_name=sample-node-app
pkg_origin=your_origin
pkg_version="1.1.0"
pkg_deps=(core/node)

# Habitat provides you with a number of built-in "callbacks" to use
# in the course of your build, all of which are explained in the docs
# at https://habitat.sh/docs/reference/#reference-callbacks.
#
# Here, we're implementing the do_build and do_install callbacks
# to install dependencies and assemble the application package.

do_build() {

  # By default, we're in the directory in which the Studio was entered
  # (in this case, presumably the project root), so we can run commands
  # as though we were in that same directory. By the time we reach this
  # callback, `npm` will have been installed for us.
  npm install
}

do_install() {

  # The `pkg_prefix` variable contains the fully-qualified Studio-relative path to
  # a specific build run (e.g., /hab/pkgs/<YOUR_ORIGIN>/sample-node-app/1.1.0/20180620174915).
  # In this callback, we copy the files that our application requires at runtime
  # into that directory, and once this step completes, Habitat will take
  # over to produce the finished package as a .hart file.
  local app_path="$pkg_prefix/app"
  mkdir -p $app_path

  cp -R \
    node_modules \
    public \
    routes \
    views \
    package.json \
    app.js \
    index.js \
    $app_path
}

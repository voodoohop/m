# Source code directory structure

## Overview

The source code of atom-shell is separated into a few parts, and we are mostly
following Chromium on the separation conventions.

You may need to become familiar with [Chromium's multi-process
architecture](http://dev.chromium.org/developers/design-documents/multi-process-architecture)
to understand the source code better.

## Structure of source code

* **atom** - Source code of atom-shell.
  * **app** - System entry code.
  * **browser** - The frontend including the main window, UI, and all browser
    side things. This talks to the renderer to manage web pages.
    * **lib** - Javascript part of browser side initialization code.
    * **ui** - Implementation of UI stuff for different platforms.
      * **cocoa** - Cocoa specific source code.
      * **gtk** - GTK+ specific source code.
      * **win** - Windows GUI specific source code.
    * **default_app** - The default page to show when atom-shell is started
      without providing an app.
    * **api** - The implementation of browser side APIs.
       * **lib** - Javascript part of the API implementation.
    * **net** - Network related code.
    * **mac** - Mac specific Objective-C source code.
    * **resources** - Icons, platform-dependent files, etc.
  * **renderer** - Code that runs in renderer process.
    * **lib** - Javascript part of renderer initialization code.
    * **api** - The implementation of renderer side APIs.
       * **lib** - Javascript part of the API implementation.
  * **common** - Code that used by both browser and renderer, including some
    utility functions and code to integrate node's message loop into Chromium's
    message loop.
    * **lib** - Common Javascript initialization code.
    * **api** - The implementation of common APIs, and foundations of
      atom-shell's built-in modules.
       * **lib** - Javascript part of the API implementation.
* **chromium_src** - Source code that copied from Chromium.
* **docs** - Documentations.
* **spec** - Automatic tests.
* **atom.gyp** - Building rules of atom-shell.
* **common.gypi** - Compiler specific settings and building rules for other
  components like `node` and `breakpad`.

## Structure of other directories

* **script** - Scripts used for development purpose like building, packaging,
  testing, etc.
* **tools** - Helper scripts used by gyp files, unlike `script`, scripts put
  here should never be invoked by users directly.
* **vendor** - Source code of third party dependencies, we didn't use
  `third_party` as name because it would confuse with the same directory in
  Chromium's source code tree.
* **node_modules** - Third party node modules used for building.
* **out** - Temporary output directory of `ninja`.
* **dist** - Temporary directory created by `script/create-dist.py` script
  when creating an distribution.
* **external_binaries** - Downloaded binaries of third-party frameworks which
  do not support to be built via `gyp`.

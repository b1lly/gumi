gumi
====

Simple jQuery plugin for creating custom styled drop-downs and form select elements with CSS.


## Usage Documentation

To use gumi in your project, please check out the `dist` directory and visit
our documentation site below:

	http://b1lly.github.io/gumi

## What you need to build Gumi

In order to build and contribute to Gumi, you need to have Node.js/npm latest and git 1.7 or later.
(Earlier versions might work OK, but are not tested.)

For Windows you have to download and install [git](http://git-scm.com/downloads) and [Node.js](http://nodejs.org/download/).

Mac OS users should install [Homebrew](http://mxcl.github.com/homebrew/). Once Homebrew is installed, run `brew install git` to install git,
and `brew install node` to install Node.js.

Linux/BSD users should use their appropriate package managers to install git and Node.js, or build from source
if you swing that way. Easy-peasy.


## How to build and minify your own Gumi

Clone a copy of the main Gumi git repo by running:

```bash
git clone git://github.com/b1lly/gumi.git
```

Enter the Gumi directory and fetch all the node tooling to minify and build your project.

```bash
cd gumi && npm install
```

This should install grunt and all of the grunt packages onto your machine.

Now by running the `grunt` command in the gumi directory, you will get your project minified into `dist`

```bash
grunt
```

Enjoy
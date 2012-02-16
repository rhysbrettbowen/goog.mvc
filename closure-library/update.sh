#!/bin/sh

rm -rf closure-library.tar.gz
rm -rf closure-library

svn export http://closure-library.googlecode.com/svn/trunk/ closure-library

tar czf closure-library.tar.gz closure-library
rm -rf closure-library



#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function
from glob import glob
import os
from os.path import join as pjoin
from setuptools import setup, find_packages

HERE = os.path.dirname(os.path.abspath(__file__))




# The name of the project
name = 'qoffeeapi'

# Get the version
version_info = (0, 1, 0, 'dev')
version = ".".join(map(str, version_info))


setup_args = dict(
    name            = name,
    version         = version,
    scripts         = glob(pjoin('scripts', '*')),
    packages        = find_packages(),
    author          = 'Max Simon',
    author_email    = 'max.simon@ibm.com',
    platforms       = "Linux, Mac OS X, Windows",
    include_package_data = True,
    python_requires=">=3.6",
    install_requires = [
        'python-dotenv>=0.19.1'
    ],
    extras_require = {
        'test': [
            'pytest>=4.6',
            'pytest-cov',
            'nbval',
        ]
    },
    entry_points = {
    },
)

if __name__ == '__main__':
    setup(**setup_args)

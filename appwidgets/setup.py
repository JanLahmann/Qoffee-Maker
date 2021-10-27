#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

from __future__ import print_function
from glob import glob
import os
from os.path import join as pjoin
from setuptools import setup, find_packages


from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
    get_version,
    skip_if_exists
)

HERE = os.path.dirname(os.path.abspath(__file__))




# The name of the project
name = 'appwidgets'

# Get the version
version = get_version(pjoin(name, '_version.py'))


# Representative files that should exist after a successful build
jstargets = [
    pjoin(HERE, name, 'nbextension', 'index.js')
]


package_data_spec = {
    name: [
        'nbextension/**js*'
    ]
}


data_files_spec = [
    ('share/jupyter/nbextensions/appwidgets', 'appwidgets/nbextension', '**'),
    ('etc/jupyter/nbconfig/notebook.d', '.', 'appwidgets.json'),
]


cmdclass = create_cmdclass('jsdeps', package_data_spec=package_data_spec,
    data_files_spec=data_files_spec)
npm_install = combine_commands(
    install_npm(HERE, build_cmd='build:prod'),  # build:prod will probably fail. Run build:lib and build:nbextension by hand
    ensure_targets(jstargets),
)
cmdclass['jsdeps'] = skip_if_exists(jstargets, npm_install)


setup_args = dict(
    name            = name,
    description     = 'Providing widgets for an app experience',
    version         = version,
    scripts         = glob(pjoin('scripts', '*')),
    cmdclass        = cmdclass,
    packages        = find_packages(),
    author          = 'Max Simon',
    author_email    = 'max.simon@ibm.com',
    platforms       = "Linux, Mac OS X, Windows",
    keywords        = ['Jupyter', 'Widgets', 'IPython'],
    include_package_data = True,
    python_requires=">=3.6",
    install_requires = [
        'ipywidgets>=7.0.0',
        'beautifulsoup4>=4.10'
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

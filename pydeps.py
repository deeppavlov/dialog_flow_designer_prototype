import os, re
from typing import Set
from pathlib import Path
from glob import glob

exclude = 'python/venv/lib/python.*/.*distutils|lxml|pip|pkg_resources|yaml|setuptools.*/.*'

packages_dir = glob("python/venv/lib/python*/site-packages")[0]
all_files: Set[str] = set()
for root, dirs, files in os.walk(packages_dir):
    rootpath = Path(root)
    filepaths = [str(rootpath / filename) for filename in files ]
    all_files.update(filepaths)
    # for dirname in dirs.copy():
    #     if re.match(exclude, dirname, flags=re.IGNORECASE):
    #         dirs.remove(dirname)
    if '__pycache__' in dirs:
        dirs.remove('__pycache__')

files_to_add = [  ]

print('\n'.join([str(f) for f in all_files]))

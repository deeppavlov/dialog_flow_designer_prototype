import os, re
from pathlib import Path
from zipfile import ZipFile
from glob import glob
from typing import Set

pkgs_zip = Path("python", "deps.zip")
pkgs_include = r".*libcst|mypy_extensions|typing_extensions|typing_inspect.*"
pkgs_dir = glob("python/venv/lib/python*/site-packages")[0]

files_to_add: Set[Path] = set()
for root, dirs, files in os.walk(pkgs_dir):
    fpaths = [Path(root, filename) for filename in files]
    files_to_add.update(
        fp for fp in fpaths if re.match(pkgs_include, fp.parts[5], flags=re.IGNORECASE)
    )
    if "__pycache__" in dirs:
        dirs.remove("__pycache__")

if pkgs_zip.exists():
    pkgs_zip.unlink()

with ZipFile(pkgs_zip, "w") as zf:
    for fp in files_to_add:
        zf.write(fp, Path(*fp.parts[5:]))

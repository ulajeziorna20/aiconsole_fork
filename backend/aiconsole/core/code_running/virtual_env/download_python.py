import logging
import os
import platform
import tarfile

import requests

_log = logging.getLogger(__name__)


def download_python():
    _log.info("Detecting machine architecture...")
    arch_name = platform.machine()
    system_name = platform.system()

    file_name = None
    download_url = None

    if system_name == "Darwin":
        if arch_name == "x86_64":
            _log.info("Detected Intel architecture for macOS.")
            variant = "x86_64-apple-darwin"
        elif arch_name == "arm64":
            _log.info("Detected Apple M1 architecture.")
            variant = "aarch64-apple-darwin"
        else:
            _log.info(f"Unknown architecture: {arch_name}")
            exit(1)

    elif system_name == "Linux":
        _log.info("Detected Linux architecture.")
        variant = "x86_64-unknown-linux-gnu"

    elif system_name == "Windows":
        _log.info("Detected Windows architecture.")
        variant = "x86_64-pc-windows-msvc-shared"

    else:
        _log.info(f"Unknown operating system: {system_name}")
        exit(1)

    file_name = f"cpython-3.10.13+20231002-{variant}-install_only.tar.gz"
    download_url = f"https://github.com/indygreg/python-build-standalone/releases/download/20231002/{file_name}"

    _log.info(f"Downloading standalone Python for {system_name} {arch_name}...")
    response = requests.get(download_url)
    with open(file_name, "wb") as file:
        file.write(response.content)

    _log.info("Extracting Python...")
    with tarfile.open(file_name) as tar:
        tar.extractall(path=".")

    os.remove(file_name)

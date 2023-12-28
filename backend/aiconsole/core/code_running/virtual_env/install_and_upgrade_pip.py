import logging
import subprocess

_log = logging.getLogger(__name__)


def install_and_update_pip(venv_path):
    # Check and install pip if not available
    pip_path = venv_path / "bin" / "pip"
    if not pip_path.exists():  # Windows compatibility
        pip_path = venv_path / "Scripts" / "pip.exe"

    if not pip_path.exists():
        _log.info("Installing pip in the virtual environment.")
        subprocess.Popen(
            [str(venv_path / "bin" / "python"), "-m", "ensurepip"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        ).communicate()

    # Upgrade pip
    _log.info("Upgrading pip in the virtual environment.")
    subprocess.Popen(
        [str(pip_path), "install", "--upgrade", "pip"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    ).communicate()

import logging
import platform
import subprocess

from aiconsole.consts import DIR_WITH_AICONSOLE_PACKAGE

_log = logging.getLogger(__name__)


def install_dependencies(venv_or_python_path):
    # only if DIR_WITH_AICONSOLE_PACKAGE has pyproject.toml
    if not (DIR_WITH_AICONSOLE_PACKAGE / "pyproject.toml").exists():
        _log.info(
            f"Skipping installation of aiconsole and dependencies because {DIR_WITH_AICONSOLE_PACKAGE} does not have pyproject.toml (bundled version?)"
        )
        return

    # TODO: Since we are enforcing having pip, even for windows build, this could be adjusted to use pip directly
    if platform.system() == "Windows":
        python_path = venv_or_python_path / "python.exe"
        _log.info(f"Installing aiconsole and dependencies  ({python_path} -m pip) ...")
        subprocess.Popen(
            [python_path, "-m", "pip", "install", DIR_WITH_AICONSOLE_PACKAGE],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        ).communicate()
    else:
        pip_path = venv_or_python_path / "bin" / "pip"
        _log.info(f"Installing aiconsole and dependencies  ({pip_path}) ...")
        subprocess.Popen(
            [pip_path, "install", DIR_WITH_AICONSOLE_PACKAGE], stdout=subprocess.PIPE, stderr=subprocess.PIPE
        ).communicate()

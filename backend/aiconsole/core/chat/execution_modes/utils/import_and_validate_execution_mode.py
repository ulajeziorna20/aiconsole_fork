import importlib

from aiconsole.core.assets.agents.agent import AICAgent
from aiconsole.core.chat.execution_modes.execution_mode import ExecutionMode


async def import_and_validate_execution_mode(agent: AICAgent):
    execution_mode = agent.execution_mode

    # Port 2.9 agent to 2.11
    if execution_mode == "aiconsole.core.execution_modes.normal:execution_mode_normal":
        execution_mode = "aiconsole.core.chat.execution_modes.normal:execution_mode"
    elif execution_mode == "aiconsole.core.execution_modes.interpreter:execution_mode_interpreter":
        execution_mode = "aiconsole.core.chat.execution_modes.interpreter:execution_mode"
    elif execution_mode == "aiconsole.core.execution_modes.example_countdown:execution_mode_example_countdown":
        execution_mode = "aiconsole.core.chat.execution_modes.example_countdown:execution_mode"

    split = execution_mode.split(":")

    if len(split) != 2:
        raise ValueError(
            f"Invalid execution_mode in agent {agent.name}: {execution_mode} - should be module_name:object_name"
        )

    module_name, object_name = execution_mode.split(":")
    module = importlib.import_module(module_name)
    obj = getattr(module, object_name, None)

    if obj is None:
        raise ValueError(f"Could not find {object_name} in {module_name} module in agent {agent.name}")

    if not isinstance(obj, ExecutionMode):
        raise ValueError(f"{object_name} in {module_name} is not an ExecutionMode (in agent {agent.name})")

    return obj

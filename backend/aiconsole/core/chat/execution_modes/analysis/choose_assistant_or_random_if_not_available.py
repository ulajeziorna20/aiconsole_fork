import random

from aiconsole.core.assets.agents.agent import Agent
from aiconsole.core.chat.execution_modes.analysis.agents_to_choose_from import (
    agents_to_choose_from,
)


def choose_assistant_or_random_if_not_available() -> Agent:
    agents = agents_to_choose_from()

    for _agent in agents:
        # TODO: default agent should come from project settings
        if "asistant" == _agent.id:
            return _agent

    return random.choice(agents)

from abc import ABC, abstractmethod


class CodeRunner(ABC):
    @abstractmethod
    def run(self, code: str) -> dict:
        pass

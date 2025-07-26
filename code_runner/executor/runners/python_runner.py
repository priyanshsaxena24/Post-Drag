import io
import contextlib
from .base import CodeRunner


class PythonRunner(CodeRunner):
    def run(self, code: str, input=None) -> dict:
        stdout = io.StringIO()
        stderr = io.StringIO()

        try:
            with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                exec(code, {"__builtins__": __builtins__, "input": input})
            return {
                "output": stdout.getvalue().strip(),
                "error": None,
            }
        except Exception as e:
            return {
                "output": "",
                "error": str(e),
            }

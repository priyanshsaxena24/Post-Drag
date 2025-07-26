from .base import CodeRunner
import pythonmonkey as pm


class JavaScriptRunner(CodeRunner):
    def run(self, code: str, input=None) -> dict:
        try:
            # Inject `input` into the global context if needed
            context = {"input": input} if input is not None else {}

            # Set context variables before evaluating
            for k, v in context.items():
                pm.globalThis[k] = v

            result = pm.eval(code)
            return {"output": result, "error": None}
        except Exception as e:
            return {"output": "", "error": str(e)}

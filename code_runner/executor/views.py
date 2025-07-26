from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .runners.python_runner import PythonRunner
from .runners.javascript_runner import JavaScriptRunner

LANGUAGE_RUNNERS = {
    "python": PythonRunner,
    "javascript": JavaScriptRunner,
}


@csrf_exempt
def execute_code(request, language):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        data = json.loads(request.body)
        code = data.get("code", "")

        runner_class = LANGUAGE_RUNNERS.get(language)
        if not runner_class:
            return JsonResponse(
                {"error": f"Unsupported language: {language}"}, status=400
            )

        runner = runner_class()
        output = runner.run(code, input=input)

        return JsonResponse(output)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

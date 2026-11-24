#!/usr/bin/env bash
# Smoke-test a built Qoffee-Maker image before it is pushed. Usage: docker-smoke-test.sh IMAGE PLATFORM
# 1.4.0 and 1.5.0 were published although the notebook's import cell failed in them (ARM: wheels linking
# libraries the image lacks; amd64: qiskit 1.x), so CI now runs the app's own code and server.
set -euo pipefail
image=$1
platform=$2

docker run --rm -i --platform "$platform" --entrypoint bash "$image" -s <<'EOF'
set -euo pipefail

echo "== Python extension modules that link a library the image lacks"
python - <<'PY'
import importlib.machinery, os, site, subprocess, sys

own_suffix = importlib.machinery.EXTENSION_SUFFIXES[0]
broken = []
for top in site.getsitepackages() + [site.getusersitepackages()]:
    for root, _, files in os.walk(top):
        # Libraries vendored by auditwheel (*.libs) are found via the extension's RPATH, not their own.
        if any(part.endswith(".libs") for part in root.split(os.sep)):
            continue
        for name in files:
            # Only modules this interpreter can import (skip builds for other Python versions).
            if not name.endswith(".so") or (".cpython-" in name and not name.endswith(own_suffix)):
                continue
            path = os.path.join(root, name)
            out = subprocess.run(["ldd", path], capture_output=True, text=True).stdout
            missing = [line.strip() for line in out.splitlines() if "not found" in line]
            if missing:
                broken.append(path)
                print(path, *missing, sep="\n    ")
if broken:
    sys.exit(1)
print("none")
PY

echo "== Execute qoffee.ipynb plus a cell that runs every circuit the way the app's buttons do (no .env)"
# The notebook only defines the app; its circuits run on UI events, so the appended cell calls them directly.
# --stdin keeps the working directory, where the notebook reads its css files.
python - <<'PY' | jupyter nbconvert --stdin --to notebook --execute --ExecutePreprocessor.timeout=1800 --output /tmp/smoke
import json, sys

nb = json.load(open("qoffee.ipynb"))
nb["cells"].append({"cell_type": "code", "metadata": {}, "outputs": [], "execution_count": None, "source": """
for entry in qcreg:
    executor = CircuitExecutor(entry["circuit"])
    analytical = executor.probabilities_analytical()   # StatevectorSimulator
    qasm = executor.probabilities_qasm(num_shots=100)  # transpile + QasmSimulator
    assert abs(sum(analytical.values()) - 1) < 1e-3 and abs(sum(qasm.values()) - 1) < 1e-3, entry["id"]  # the app rounds amplitudes to 5 decimals
    print(entry["id"], CircuitExecutor.get_maximum_key(qasm))
mock = CircuitExecutor(qcreg[4]["circuit"]).probabilities_mock(num_shots=100)  # FakeMontreal: layout, routing, noise
assert abs(sum(mock.values()) - 1) < 1e-3
print("mock device", mock)
"""})
json.dump(nb, sys.stdout)
PY

echo "== Start the Jupyter server and check the app's server and notebook extensions"
log=/tmp/jupyter.log
jupyter notebook --allow-root --no-browser --ip 127.0.0.1 --port 8887 --NotebookApp.token=smoke >"$log" 2>&1 &
python - "$log" <<'PY'
import sys, time, urllib.error, urllib.request

def status(path):
    try:
        return urllib.request.urlopen("http://127.0.0.1:8887" + path + "?token=smoke", timeout=10).status
    except urllib.error.HTTPError as e:
        return e.code
    except OSError:
        return None

for _ in range(120):
    if status("/api/status") == 200:
        break
    time.sleep(2)
checks = {
    "/tree": 200,
    "/notebooks/qoffee.ipynb": 200,
    "/nbextensions/qoffeefrontend/app.js": 200,
    "/nbextensions/appwidgets/extension.js": 200,
    "/nbextensions/ibm_quantum_widgets/extension.js": 200,
}
failed = [f"{path}: {status(path)}" for path, want in checks.items() if status(path) != want]
log = open(sys.argv[1]).read()
if "Error loading server extension" in log:
    failed.append("server log:\n" + log)
# qoffeeapi registers /auth/callback; without HomeConnect credentials it errors, but it must not be missing.
if status("/auth/callback") in (None, 404):
    failed.append("/auth/callback: qoffeeapi route missing")
print(*(failed or ["all routes answer"]), sep="\n")
sys.exit(1 if failed else 0)
PY
EOF

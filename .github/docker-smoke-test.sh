#!/usr/bin/env bash
# Smoke-test a built Qoffee-Maker image before it is pushed. Usage: docker-smoke-test.sh IMAGE PLATFORM
# 1.4.0 and 1.5.0 were published although the notebook's import cell failed in them (ARM: wheels linking
# libraries the image lacks; amd64: qiskit 1.x), so CI now runs the notebook itself.
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

echo "== Execute every cell of qoffee.ipynb (no .env, so no credentials)"
jupyter nbconvert --to notebook --execute --ExecutePreprocessor.timeout=900 qoffee.ipynb --output /tmp/smoke.ipynb </dev/null

echo "== Run a 1-qubit circuit on QasmSimulator"
python - <<'PY'
from qiskit import QuantumCircuit, execute
from qiskit.providers.aer import QasmSimulator

qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)
counts = execute(qc, QasmSimulator(), shots=100).result().get_counts()
print(counts)
assert sum(counts.values()) == 100
PY
EOF

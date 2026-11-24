#!/usr/bin/env bash
# Smoke-test a built Qoffee-Maker image before it is pushed: usage: docker-smoke-test.sh IMAGE PLATFORM
# 1.4.0 and 1.5.0 were published although the notebook's import cell failed in them (ARM: wheels linking
# libraries the image lacks; amd64: qiskit 1.x), so CI now runs the notebook itself.
set -euo pipefail
image=$1
platform=$2

docker run --rm --platform "$platform" --entrypoint "" "$image" bash -c '
set -euo pipefail

echo "== Python extension modules linking libraries the image lacks"
dirs=$(python -c "import site; print(\" \".join(site.getsitepackages() + [site.getusersitepackages()]))")
broken=0
while IFS= read -r -d "" so; do
  if ldd "$so" 2>/dev/null | grep -q "not found"; then
    echo "$so:"; ldd "$so" | grep "not found"; broken=1
  fi
done < <(find $dirs -name "*.so*" -type f -print0 2>/dev/null)
[ "$broken" = 0 ] || exit 1
echo none

echo "== Execute every cell of qoffee.ipynb (no .env, so no credentials)"
jupyter nbconvert --to notebook --execute --ExecutePreprocessor.timeout=900 qoffee.ipynb --output /tmp/smoke.ipynb

echo "== Run a 1-qubit circuit on QasmSimulator"
python -c "
from qiskit import QuantumCircuit, execute
from qiskit.providers.aer import QasmSimulator
qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)
counts = execute(qc, QasmSimulator(), shots=100).result().get_counts()
print(counts)
assert sum(counts.values()) == 100
"
'

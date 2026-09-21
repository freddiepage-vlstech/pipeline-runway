#!/usr/bin/env bash
#
# Regenerates the Angular client SDK from each service's OpenAPI contract
# (INFRA-7). Per ADR-0004, this is run both by developers after a contract
# change and by CI (ci-durion.yml), which fails the build if the regenerated
# output differs from what's committed under src/.
#
# Uses openapi-typescript-codegen (pure npm, no JVM/Maven Central download)
# rather than @openapitools/openapi-generator-cli — the latter's underlying
# generator is a JAR pulled from repo1.maven.org at run time, which this
# project's network egress does not allow. openapi-typescript-codegen's
# `--client angular` output is equivalent for this purpose: an @Injectable
# Angular service per tag, typed models, and an NgModule wrapper — see
# README.md in this directory for what's committed and why.
set -euo pipefail
cd "$(dirname "$0")"

SERVICES=(companies-service contacts-service opportunities-service)

for svc in "${SERVICES[@]}"; do
  name="${svc%-service}"
  className="$(echo "$name" | sed -E 's/(^|-)([a-z])/\U\2/g')Api"  # companies -> CompaniesApi
  echo "== Generating ${name} client (${className}) from services/${svc}/openapi.yaml =="
  npx --yes openapi-typescript-codegen \
    --input "../../services/${svc}/openapi.yaml" \
    --output "src/${name}" \
    --client angular \
    --name "${className}"
done

echo "Done. Regenerated: ${SERVICES[*]}"

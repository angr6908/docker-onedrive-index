#!/bin/sh
set -eu

if [ -n "${NAT64_DNS:-}" ]; then
  tmp_resolv="$(mktemp)"
  nat64_nameserver="nameserver ${NAT64_DNS}"

  printf '%s\n' "$nat64_nameserver" > "$tmp_resolv"
  grep -Fvx "$nat64_nameserver" /etc/resolv.conf >> "$tmp_resolv" || true
  cat "$tmp_resolv" > /etc/resolv.conf
  rm -f "$tmp_resolv"
fi

exec "$@"

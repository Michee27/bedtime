# Runs the Stripe CLI through Docker (native stripe.exe is blocked on this machine).
# Usage: .\stripe.ps1 login | .\stripe.ps1 projects init | ...
# Config/login and plugins persist in the "stripe-config" Docker volume; the project folder is mounted at /work.
$tty = if ([Console]::IsInputRedirected -or [Console]::IsOutputRedirected) { '-i' } else { '-it' }
docker run --rm $tty `
  -v stripe-config:/root/.config/stripe `
  -v "${PWD}:/work" -w /work `
  -e STRIPE_API_KEY `
  stripe-cli-debian @args
exit $LASTEXITCODE

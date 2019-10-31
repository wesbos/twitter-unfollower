const config = {
  // dryRun: process.argv.includes('--dry-run'),
  maxDays: process.argv.includes('--max-days-90') 
    ? 90 : process.argv.includes('--max-days-180') 
    ? 180 : process.argv.includes('--max-days-270')
    ? 270 : process.argv.includes('--max-days-365')
    ? 365 : 90,
  noDropDb: process.argv.includes('--no-drop-db'),
  confirmUnfollow: process.argv.includes('--confirm-unfollow'),
}

module.exports = config;

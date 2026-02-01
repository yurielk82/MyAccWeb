module.exports = {
  apps: [
    {
      name: 'my-acc',
      script: 'npx',
      args: 'next start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}

import withPWA from 'next-pwa'

   const withPWAConfig = withPWA({
     dest: 'public',
     disable: process.env.NODE_ENV === 'development',
   })

   export default withPWAConfig({
     // your existing config stays here
   })
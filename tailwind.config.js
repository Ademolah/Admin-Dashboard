// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         qiBlue: "#0046a5",      // QuickInvoice NG Blue
//         qiGreen: "#00b86b",     // QuickInvoice NG Green
//       },
//     },
//   },
//   plugins: [],
// }



/** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         qiBlue: "#0046a5",      // QuickInvoice NG Blue
//         qiGreen: "#00b86b",     // QuickInvoice NG Green
//       },
//     },
//   },
//   plugins: [],
// }



/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qiBlue: "#0046a5",      // QuickInvoice NG Blue
        qiGreen: "#00b86b",     // QuickInvoice NG Green
      },
    },
  },
  plugins: [],
}
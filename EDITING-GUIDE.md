# Huffed and Puffed Publishing Website Editing Guide

Open `index.html` in a browser to view the site. Most routine edits happen in `content.js`.

## Common Edits

- Company wording: edit `company`.
- Authors: edit the `authors` array.
- Books: edit the `books` array. Add an `asin` when an Amazon listing is ready.
- Direct sales: edit `directSales.paymentPageUrl` after choosing Stripe, PayPal, Shopify, or another checkout page.
- Amazon marketplaces: edit `marketplaces`. The site remembers the viewer's manual selection in the browser.
- Private page prototype: edit `privatePage.demoPasswords` to test one or more passwords.

## Cover Images

The current site uses designed front-cover placeholders. When real covers are ready, add image paths to book objects and update `coverArt()` in `app.js` to prefer those images.

For KDP wraparound covers, crop or export the front cover only before placing it on the website.

## Security Note

The private page is a prototype convenience gate. It is not secure because static websites send the JavaScript and password hint to the browser. For real file management, use hosted authentication and server-side storage.

## Direct-Sale Suggestions

- Stripe Payment Links: best for simple card checkout.
- PayPal Checkout: fast setup and familiar to buyers.
- Shopify Starter: better if stock, shipping, and a growing catalogue matter.

## Barcode Maker

No previous barcode-maker files were found in this workspace. The current page is a self-contained EAN-13 placeholder in `app.js`.

When you provide yesterday's files, the simplest swap is:

- Put any barcode-specific JavaScript in `outputs/assets/`.
- Replace the `renderBarcode()`, `ean13Checksum()`, and `drawBarcode()` functions in `app.js`.
- Keep the route name `#barcode` so the navigation still works.

The free barcode page now validates genuine ISBN-10/ISBN-13 input, converts valid ISBN-10 values to Bookland EAN-13, and includes a Google AdSense placeholder.

The public barcode page includes ISBN, ISSN, ISMN, UPC-A, EAN, Code 39, Code 128, ITF, Data Matrix, Aztec, PDF417, conversion helpers, and QR generation. Specialist formats use a public barcode image service; replace this with a bundled JavaScript barcode library if you want the tool to be fully self-contained.

Ad placeholders are styled with `.ad-slot`. Replace those blocks with AdSense script/slot code only after Google approves the site.

## GitHub + Cloudflare Pages Deployment

This site is static, so GitHub plus Cloudflare Pages is a good fit.

1. Create a GitHub repository.
2. Upload the contents of the `outputs` folder as the web root.
3. In Cloudflare Pages, connect the GitHub repo.
4. Set build command to blank.
5. Set output directory to `/` if the repository contains only the `outputs` contents, or `outputs` if the whole workspace is committed.
6. Add your custom domain in Cloudflare Pages once the first deploy is live.

For a private file-management page, do not rely on the prototype password screen. Use Cloudflare Access, a server-backed admin tool, or a private Google Drive/Dropbox workflow linked from the site.

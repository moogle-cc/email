# Overview

The tool acts as a domain level email client for AWS SES and can be used to send and receive emails just like you would with Gmail or Outlook. The app is built using React and styles using custom, handwritten css.

Here's what the inbox looks like live. 
![Moogle Inbox Screenshot](https://github.com/moogle-cc/email/blob/ec0b9d8987d0325b44fe3aa99c2cd646ec05d7a2/images/Moogle%20Email%20Screenshot.png)

Full Disclosure - the search function does not work at all. The search box is just for decorative purposes for now. To be fait, I haven't missed it all that much since I've been using my own inbox. The comments function is also broken right now but I will be fixing it soon.

To function correctly, the client relies on three APIs. The APIs are covered in more detail later.

1. `LIST [GET]` - returns a list of the most recent N emails (newest first) received by AWS SES on your domain
2. `EMAIL [GET]` - returns the contents of the eml file received by AWS in JSON format
3. `SEND [POST]` - POSTs a JSON object containing all the details necessary to send a raw email via SES

If you want to build a read-only inbox, remove support for the last API

# Security

This client is secured using AWS Cognito

# Flow

## Logging in
1. User visits the url on which this email client is running
2. User is redirected to AWS Cognito to login 
3. Cognito redirects the user back to the url in step 1 along with `id_token` and `access_token`
4. App extracts `id_token` and `access_token` and saves it in localstorage (not ideal, TO-DO: needs to be stored somewhere safer)

## Reading emails
1. Using the `id_token` as the Authorization: header, the app queries the `LIST` api to download the most recent emails
2. Then, using the `EMAIL` api, it downloads the contents of each email to determine which email address the email was sent to
3. Then, it creates BUCKETS on the client side. The name of each bucket is the unique email address on which you received emails. Recall that this is a domain level inbox client so if you received emails send to gym@example.com and shopping@example.com, the client will show you two buckets - `Gym` and `Shopping`
4. There are three default buckets called ALL, SPAM, and SENT - ALL shows all emails, SPAM shows emails suspected to be spam, and SENT shows emails sent by you or anyone else using your domain's email client

## Sending emails
1. The client comes with a built-in email composer built using `jodit-react`
2. Emails are dispatched using the SEND api using AWS SES's `send-raw-email` endpoint
3. If you are replying to a received email, the client calls the SEND api with an extra value - `References <mesage-id>` where `<message-id>` is the id of the message to which you are replying. The API uses this value to include the `References` and `In-Reply-To` headers while calling `send-raw-email`
4. By default, each email is also BCC-ed to a secret inbox so that you can review your SENT emails later

# APIs

1. LIST - this GET API returns a list of most recently received emails. API endpoint is `EMAILS_LIST_URL` in `constants.js`.
   @domain: domain name on which emails are received E.g., ramachandr.in
   @folderpath: /path/to/folder containing the raw `eml` files
   Returns list of eml file ids

2. EMAIL - this GET API returns the content of a single eml file. API endpoint is `EMAILS_CONTENT_URL` in `constants.js`.
   @domain: domain name on which emails are received E.g., ramachandr.in
   @id: path/to/emlfiles/abcdefghi1234567890
   Returns the contents of the email file as a JSON object as parsed by nodemailer

3. SEND - this POST API calls the lambda which sends raw emails on our behalf. API endpoint is `EMAILS_CONTENT_URL` in `constants.js`.
   @domain: domain name on which emails are received E.g., ramachandr.in
   Returns success or failure status of request to send email. Email sending happens synchronously. 
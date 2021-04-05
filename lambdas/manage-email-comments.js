const AWS = require('aws-sdk');
const moment = require('moment');
const URL = require('url').URL;
AWS.config.update({region: 'us-east-1'});

var s3 = new AWS.S3({signatureVersion: 'v4'});
const createResponse = (status, body) => {
    return {
        statusCode: status || 400,
        headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(body || {msg: 'no data'}).replace(EMOJI_REGEX, '##'),
    };
};

const EMOJI_REGEX = /\p{Emoji_Presentation}/gu;

let getDomain = (event) => {
    let d = event.headers.origin || event.headers.referer || undefined;
    if(d){
      let host = (new URL(d)).hostname;
      if(host === 'localhost') return process.env.DEFAULT_EMAIL_DOMAIN;
      return host;
    }
    return undefined;
};

exports.handler = async (event) => {
    console.log(event);
    if(eventIsValid(event)){
        switch (event.httpMethod.toUpperCase()){
            case 'POST':
                let domain = getDomain(event);
                if(domain){
                    let body = JSON.parse(event.body.replace(EMOJI_REGEX, ''));
                    console.log(body);
                    let bucket = process.env.EMAIL_BUCKET;
                    let commentsPrefix = process.env.EMAIL_COMMENTS_PREFIX;
                    return await writeCommentToS3(bucket, domain, commentsPrefix, body)
                    .then(r => {
                        return createResponse(r ? 200 : 400, {msg: (`comment ${r ? 'saved' : 'ignored'}`)});
                    })
                    .catch(e => {
                        console.log(e);
                        return createResponse();
                    });
                }
                console.log(`No domain found in event headers`);
                return createResponse();
        }
    }
    return createResponse(400, {msg: 'invalid data'});
};

let writeCommentToS3 = async (bucket, domain, commentsPrefix, body) => {
    if(body.thread_identifier){
        let comment_id = getS3FileDatePrefix(undefined, undefined, true);
        body.comment_id = comment_id;
        return await s3.putObject({
            Bucket: bucket,
            Key: `${domain}/${commentsPrefix}/${body.thread_identifier}-${body.comment_id}.json`,
            Body: JSON.stringify(body),
            ContentType: `application/json`})
            .promise()
        .then(d => d);
    }
};

const EMAIL_COMMENTS_LOCATION = process.env.EMAIL_COMMENTS_LOCATION;
const COMMENT_BODY_FIELDS = [
'thread_identifier', //this value should be the email_id
'update_type', //'NEW' | 'DELETE'
'commenter_name',
'commenter_id',
'commented_at',
'html_part',
'text_part'];

let getS3FileDatePrefix = (date, format, withTimestamp) => {
    let ts = date ? date.getTime() : Date.now();
    return `${moment(ts).format(format ? format : 'YYYY-MM-DD')}` + 
    `${withTimestamp ? ts * -1 : ''}`;
};

let eventIsValid = (event) => {
    if(event.httpMethod){
        switch(event.httpMethod.toUpperCase()){
            case 'POST':
                if(!event.body) return false;
                let body = JSON.parse(event.body);
                let extraBodyFieldWasFound = Object.keys(body).find((key) => {
                    !COMMENT_BODY_FIELDS.includes(key);
                });
                let notInBody = COMMENT_BODY_FIELDS.find(f => !Object.keys(body).includes(f));
                if(!notInBody && !extraBodyFieldWasFound){
                    return true;
                }
                return false;
            default:
                return false;
        }
    }
    return false;
};

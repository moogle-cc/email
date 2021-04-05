const AWS = require('aws-sdk');
const moment = require('moment');
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

exports.handler = async (event) => {
    if(eventIsValid(event)){
        switch (event.httpMethod.toUpperCase()){
            case 'POST':
                let body = JSON.parse(event.body.replace(EMOJI_REGEX, ''));
                return await writeCommentToS3(body)
                .then(r => {
                    return createResponse(r ? 200 : 400, {msg: (`comment ${r ? 'saved' : 'ignored'}`)});
                })
                .catch(e => {
                    return createResponse();
                });
        }
    }
    return createResponse(400, {msg: 'invalid data'});
};

let writeCommentToS3 = async (body) => {
    if(body.thread_identifier){
        let comment_id = getS3FileDatePrefix(undefined, undefined, true);
        body.comment_id = comment_id;
        return await s3.putObject({
            Bucket: EMAIL_COMMENTS_LOCATION,
            Key: `comments/${body.thread_identifier}-${body.comment_id}.json`,
            Body: JSON.stringify(body),
            ContentType: `application/json`})
            .promise()
        .then(d => d);
    }
};

const EMAIL_COMMENTS_LOCATION = process.env.EMAIL_COMMENTS_LOCATION;
const COMMENT_BODY_FIELDS = [
'thread_identifier', //this value should be the email_id
'comment_id', //'NEW' or <existing-id>
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
                let notInBody = COMMENT_BODY_FIELDS.find(f => f==='comment_id' ? false : !Object.keys(body).includes(f));
                if(!notInBody){
                    return true;
                }
                return false;
            default:
                return false;
        }
    }
    return false;
};
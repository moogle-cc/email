import React from 'react';

const COMMENT_ARRAY = [
    {
        name: "Team Moogle",
        timeStamp: "2 months ago",
        body: "Hey, Did you know that you can use Markdown to leave comments? These comments can even include links. Just no emojis for now!"
    },
    {
        name: "Team Moogle2",
        timeStamp: "4 months ago",
        body: "Hey, Did you know that you can use Markdown to leave comments? These comments can even include links. Just no emojis for now!"
    }
];

const CommentList = () => {
    return (
        <div>
            <ul style={{padding:"1em 0"}}>
            {
                COMMENT_ARRAY ?
                COMMENT_ARRAY.map((comment, index) => (
                    <li style={{backgroundColor: index%2===0 ? "#f5f5f5" : "", margin: "1rem 0", padding:"0.5rem"}}>
                        <div><strong>{comment.name} @ {comment.timeStamp}</strong></div>
                        <div>{comment.body}</div>
                    </li>
                )) 
                : null
            }
            </ul>
        </div>
    )
}

export default CommentList;
import React, { useState } from 'react';
import MarkdownView from 'react-showdown';

const CommentForm = () => {
    const [commentData, setCommentData] = useState({
        name: "",
        body: "",
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const handleChange =(e) => {
        const {name, value} = e.target;
        setCommentData({...commentData, [name]: value})
    }
    return (
        <form>
            <div className="field">
                <label className="label">Name</label>
                <div className="control">
                    <input className="input" type="text" placeholder="Your Name" />
                </div>
            </div>
            <div className="field">
                <label className="label">Your Comment</label>
                <div className="control">
                    <textarea className="textarea" name="body" value={commentData.body} onChange={handleChange} placeholder="Example: This email needs to be re-sent to HR"></textarea>
                </div>
            </div>
            <div >
                <button className="button is-full secondary-icon-style" style={{width: "90%"}}>Submit</button>  
                <i onClick={(e) => {e.preventDefault(); setIsModalVisible(true)}}className="fas fa-info-circle" style={{fontSize: "1.2em"}}></i>
            </div>
            
            <MarkdownView markdown={commentData.body || "You can see your comment preview here"}/>     
            <div className={isModalVisible ? "modal is-active" : "modal"}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Markdown Cheatsheet</p>
                        <button className="delete" onClick={(e)=> {e.preventDefault(); setIsModalVisible(false)}} aria-label="close"></button>
                    </header>
                    <section className="modal-card-body">
                        <ul className="pl-5">
                            <li>&#8226; **Bold** : <strong>Bold</strong></li>
                            <li>&#8226; *Italics*: <em>Italics</em></li>
                            <li>&#8226; [Link Text](https://moogle.cc): <a href="https://moogle.cc">Link Text</a></li>
                            <li>&#8226; We don't yet support emojis</li>
                        </ul>
                    </section>
                </div>
            </div>   
        </form>
    )
}

export default CommentForm;
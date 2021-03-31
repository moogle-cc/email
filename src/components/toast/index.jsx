import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './toast.css';

const Toast = props => {
    const { toastList } = props;
    const [list, setList] = useState(toastList);
    const dismissTime = 3500;
    const autoDelete = true;
    useEffect(() => {
        setList([...toastList]);
        // eslint-disable-next-line
    }, [toastList]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (autoDelete && toastList.length && list.length) {
                deleteToast(toastList[0].id);
            }
        }, dismissTime);

        return () => {
            clearInterval(interval);
        }
        // eslint-disable-next-line
    }, [toastList, autoDelete, dismissTime, list]);

    const deleteToast = id => {
        const listItemIndex = list.findIndex(e => e.id === id);
        const toastListItem = toastList.findIndex(e => e.id === id);
        list.splice(listItemIndex, 1);
        toastList.splice(toastListItem, 1);
        setList([...list]);
    }

    return (
        <>
            <div className={`notification-container top-right`}>
                {
                    list.map((toast, i) =>
                        <div
                            key={i}
                            className={`notification toast top-right`}
                        >
                            <button style={{float: "right"}} onClick={() => deleteToast(toast.id)}>
                                <i class="fas fa-times"></i>
                            </button>
                            {/* <div className="notification-image">
                                <img src={toast.icon} alt="" />
                            </div> */}
                            <div>
                                <p className="notification-title">{toast.title}</p>
                                <p className="notification-message">
                                    {toast.description}
                                </p>
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
}

Toast.propTypes = {
    toastList: PropTypes.array.isRequired,

}

export default Toast;

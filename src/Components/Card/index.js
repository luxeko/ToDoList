import React from 'react';

import './style.scss';

const Card = ({ card, handleAddNewTask, children }) => {
   
    //fa-solid fa-marker
    //fa-solid fa-rocket
    //fa-solid fa-circle-check
    let classIcon = "";
    if(card.get('id') === 'td') {
        classIcon = "fa-solid fa-marker"
    } else if (card.get('id') === 'ip') {
        classIcon = "fa-solid fa-rocket"
    } else {
        classIcon = "fa-solid fa-circle-check"
    }
    return (
    <div className="card">
        <div className="column__header">
            <h2 className="column__title">
                <span className="column__item--count">{card.get('tasks').size}</span>
                <i style={{color: "#ff2f2f"}} className={ classIcon }></i> &nbsp;
                <span className="column__text">{card.get('title')}</span>
                
            </h2>
            <p className="column__btn" onClick={handleAddNewTask(card.get('id'))}>
                <i className="fa-solid fa-plus"></i> &nbsp;
                New task
            </p>
        </div>
        <div className="column__content">
           {children}
        </div>
    </div>

    )
}

export default Card;
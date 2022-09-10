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
        <div className="card__header">
            <h4 className="card__title">
                <span className="card__item--count">{card.get('tasks').size}</span>
                <div>
                    <i style={{color: "#ff2f2f", margin:"0px 5px 0px 10px", fontSize: "18px"}} className={ classIcon }></i>
                    <span className="card__text">{card.get('title')}</span>
                </div>
            </h4>
            <div className='card__btn'>
                <p className="card__btn--add" onClick={handleAddNewTask(card.get('id'))}>
                    <i style={{marginRight: "5px"}} className="fa-solid fa-plus"></i>
                    New task
                </p>
                <div className='card__action'>
                    <span className="card__action--filter material-icons-sharp">filter_alt</span>
                    {/* <span className="card__action--filter material-icons-sharp" onClick={handleSearchTask(card.get('id'))}>filter_alt</span> */}
                </div>
            </div>
        </div>
        <div className="card__content">
           {children}
        </div>
    </div>

    )
}

export default Card;
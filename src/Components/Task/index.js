import React, { Fragment } from 'react';

import './style.scss';

import { Draggable   } from 'react-beautiful-dnd';

const Task = (props) => (
    <Draggable 
        index={props.index}
        draggableId={props.task.get('id')}
        isDragDisabled={props.isEditing}>
        {
            provided => (
                <div className="task"
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                >
                  {
                    props.isEditing ? 
                        <div className="task__editing">
                            <input type="text"
                            className="task__editor"
                            defaultValue={props.task.get('content')}
                            onChange={props.handleChangeTaskContent} />
                            <div className="task__editing-action">
                                <i className="fa-solid fa-check" onClick={props.updateTask}></i>
                                <i className="fa-solid fa-ban" onClick={props.handleCancelEdit}></i>
                            </div>
                            <div className="task__editing-bgr" onClick={props.handleCancelEdit}></div>
                        </div>
                      : <Fragment>
                        <div className="task__time">
                            <i className="fa-solid fa-calendar-days"></i>&nbsp;
                            {props.task.get('time')}
                        </div>
                        <div className="task__main">
                            <i className="fa-solid fa-bars" style={{marginRight:"10px"}}></i>
                            <div className="task__content">
                                {props.task.get('content')}
                            </div>
                            <div className="task__action">
                                <div className="task__btn" onClick={props.handleChooseEditTask}>
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </div>
                                <div className="task__btn" onClick={props.handleDeleteTask}>
                                    <i className="fa-solid fa-trash-can"></i>
                                </div>
                            </div>
                            </div>
                      </Fragment>
                  }
                </div>
            )
        }

    </Draggable>

)

export default Task;
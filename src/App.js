import React, { Component, useRef, useEffect } from "react";
import "./style.scss";
import toast from "./Assets/toast";
import { fromJS } from "immutable";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Card from "./Components/Card/index.js";
import Task from "./Components/Task/index.js";
import AddNewModal from "./Components/AddNewModel/index.js";
import styled from "styled-components";

import { v1 as uuidv1 } from "uuid";
class App extends Component {
    state = {
        searchTask: [],
        displayModal: false,
        editingCardIndex: "",
        taskContent: "",
        editingTaskIndex: null,
        editedTaskId: null,
        isSearch: false,
        cards: fromJS([
            { id: "td", title: "TO_DO", tasks: [] },
            { id: "ip", title: "IN PROGRESS", tasks: [] },
            { id: "de", title: "DONE", tasks: [] },
        ]),
    };
    componentDidMount() {
        // this.setState({ searchTask:taskAfterSearch });
        this.onScroll();
        const cards = localStorage.getItem("cards");
        if (cards) {
            this.setState({ cards: fromJS(JSON.parse(cards)) });
        }
    }
    onScroll() {
        const cards = document.getElementsByClassName("card");
        for (let index = 0; index < cards.length; index++) {
            // eslint-disable-next-line no-loop-func
            cards[index].addEventListener("scroll", () => {
                if (cards[index].offsetHeight + cards[index].scrollTop > cards[index].scrollHeight) {
                    const { cards } = this.state;
                    const newTask = fromJS({
                        id: uuidv1(),
                        content: "New Task After Scroll",
                        time: this.formatDate(new Date()),
                    });
                    const updatedCard = cards.updateIn([index, "tasks"], (tasks) => tasks.push(newTask));
                    this.setState(
                        {
                            displayModal: false,
                            editingCardIndex: "",
                            taskContent: "",
                            cards: fromJS(updatedCard),
                        },
                        () => {
                            localStorage.setItem("cards", JSON.stringify(updatedCard.toJS()));
                        }
                    );
                    toast({
                        title: "Create New",
                        message: "Thêm thông tin thành công",
                        type: "success",
                        duration: 2000,
                    });
                }
            });
        }
    }

    handleToggleModal =
        (choosenCard = "") =>
        () => {
            this.setState((prevState) => ({
                displayModal: !prevState.displayModal,
                editingCardIndex: choosenCard,
            }));
        };

    handleChangeTaskContent = (e) => this.setState({ taskContent: e.target.value });

    handleChangeEditingCardIndex = (editingCardIndex) => () => this.setState({ editingCardIndex: editingCardIndex });

    padTo2Digits = (num) => {
        return num.toString().padStart(2, "0");
    };
    formatDate = (date) => {
        const time = new Date();
        return time.toLocaleTimeString() + ", " + [this.padTo2Digits(date.getDate()), this.padTo2Digits(date.getMonth() + 1), date.getFullYear()].join("/");
    };
    
    handleSearchTaskByDate = () => {
        // lấy date trong input (yyyy/mm/dd) => split để convert thành mảng
        const getDateInSearchInput = document.getElementById("search_by_date").value.split("-");
        const getYear = getDateInSearchInput[0];
        const getMonth = getDateInSearchInput[1];
        const getDay = getDateInSearchInput[2];

        // chuyển date thành dạng (dd/mm/yyyy)
        const dateTime = getDay + getMonth + getYear;

        const { cards } = this.state;
        const taskArr = [];
        cards.map((card, cardIndex) => (
            card.get("tasks").map((task) => {
                if(dateTime.trim("") === task.get("time").split(",")[1].replaceAll("/", "").trim("")) {
                    taskArr.push({
                        cardID:cardIndex,
                        arrTask: task
                    });
                }
            })
        )
        );
        this.setState({searchTask: taskArr, isSearch: true})
    };
    handleAddNewTask = () => {
        const { taskContent } = this.state;
        if (taskContent.trim() === "") {
            toast({
                title: "Error",
                message: "Vui lòng điền thông tin",
                type: "error",
                duration: 2000,
            });
        } else {
            const { editingCardIndex, cards } = this.state;
            const newTask = fromJS({
                id: uuidv1(),
                content: taskContent,
                time: this.formatDate(new Date()),
            });
            const cardIndex = cards.findIndex((card) => card.get("id") === editingCardIndex);
            const updatedCard = cards.updateIn([cardIndex, "tasks"], (tasks) => tasks.push(newTask));
            this.setState(
                {
                    displayModal: false,
                    editingCardIndex: "",
                    taskContent: "",
                    cards: fromJS(updatedCard),
                },
                () => {
                    localStorage.setItem("cards", JSON.stringify(updatedCard.toJS()));
                }
            );
            console.log("them thanh cong");
            toast({
                title: "Create New",
                message: "Thêm thông tin thành công",
                type: "success",
                duration: 2000,
            });
        }
    };

    handleDeleteTask = (cardIndex, taskIndex) => () => {
        const result = window.confirm("Are your sure to delete this task?");
        if (result) {
            const { cards } = this.state;
            const updatedCard = cards.updateIn([cardIndex, "tasks"], (tasks) => tasks.remove(taskIndex));
            this.setState({ cards: fromJS(updatedCard) }, () => {
                localStorage.setItem("cards", JSON.stringify(updatedCard.toJS()));

                toast({
                    title: "Delete",
                    message: "Xoá thành công",
                    type: "success",
                    duration: 2000,
                });
            });
        }
    };
    handleChooseEditTask = (cardIndex, taskIndex, taskId) => () => {
        this.setState({
            editingCardIndex: cardIndex,
            editingTaskIndex: taskIndex,
            editedTaskId: taskId,
        });
    };

    updateTask = () => {
        const { cards, editingCardIndex, taskContent, editingTaskIndex, time = this.formatDate(new Date()) } = this.state;
        const updatedCard = cards.updateIn([editingCardIndex, "tasks"], (tasks) => tasks.setIn([editingTaskIndex, "content"], taskContent).setIn([editingTaskIndex, "time"], time));

        this.setState(
            {
                editingCardIndex: "",
                taskContent: "",
                editedTaskId: null,
                editingTaskIndex: null,
                cards: fromJS(updatedCard),
            },
            () => {
                localStorage.setItem("cards", JSON.stringify(updatedCard.toJS()));
            }
        );
        toast({
            title: "Update",
            message: "Update thành công",
            type: "success",
            duration: 2000,
        });
    };
    handleCancelEdit = () => {
        this.setState({
            editingCardIndex: "",
            taskContent: "",
            editedTaskId: null,
            editingTaskIndex: null,
        });
    };

    handleSaveDrag = (result) => {
        const { source, destination, reason } = result;
        if (reason === "DROP" && destination) {
            const { cards } = this.state;
            const sourceCardIndex = cards.findIndex((card) => card.get("id") === source.droppableId);
            const task = cards.getIn([sourceCardIndex, "tasks", source.index]);
            let updateCard = cards.updateIn([sourceCardIndex, "tasks"], (tasks) => tasks.remove(source.index));
            const destinationCardIndex = cards.findIndex((card) => card.get("id") === destination.droppableId);
            updateCard = updateCard.updateIn([destinationCardIndex, "tasks"], (tasks) => tasks.insert(destination.index, task));
            this.setState(
                {
                    cards: fromJS(updateCard),
                },
                () => {
                    localStorage.setItem("cards", JSON.stringify(updateCard.toJS()));
                }
            );
        }
    };
    InputSearch({...props}) {
        return (
            <input  {...props} />
        )
    }
    render() {
        // const test = styled.h1`
        //     font-size: 15px;
        //     text-align: center;
        //     color: red;
        // `;
        const { cards, displayModal, editingCardIndex, taskContent, editedTaskId, searchTask, isSearch } = this.state;
        console.log(searchTask);
        const cardAfterSearch = [];
        searchTask.map(card => {
            cardAfterSearch.push(card.cardID)
        })
        return (
            <div className="App">
                <div id="toast"></div>
                <div className="title">TO DO LIST</div>
                <div style={{ margin: "0px 0px 20px 0px" }}>
                    <div className="input-group" style={{ display: "flex" }}>
                        <div style={{ width: "300px", height: "40px", border: "1px solid #999", borderRight: "none", borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px" }} className="form-outline">
                            {/* <input style={{  }} type="date" id="search_by_date" className="form-control" /> */}
                            <this.InputSearch 
                                id="search_by_date"
                                type="date"
                                className="form-control"
                                style={{width: "100%", height: "100%", fontSize: "15px", borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px", padding: "0px 10px"}}
                            />
                        </div>
                        <button
                            onClick={this.handleSearchTaskByDate}
                            type="button"
                            className="btn btn-primary"
                            style={{ fontSize: "15px", borderTopRightRadius: "8px", borderBottomRightRadius: "8px", padding: "5px 20px", border: "1px solid #999", background: "#5680f9", color: "white", cursor: "pointer" }}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>

                    </div>
                </div>
                <DragDropContext onDragEnd={this.handleSaveDrag}>
                    <div className="container">
                        {isSearch && searchTask.length !== 0  ? 
                        // Hàm in ra các task thoả mãn tìm kiếm
                        cards.map((card, cardIndex) => (
                            <Card key={card.get("id")} card={card} handleAddNewTask={this.handleToggleModal}>
                                <Droppable droppableId={card.get("id")}>
                                    
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: "300px" }}>
                                            {cardAfterSearch.map((task, taskIndex) => (
                                                <Task
                                                    key={task.get("id")}
                                                    index={taskIndex}
                                                    isEditing={task.get("id") === editedTaskId}
                                                    handleChangeTaskContent={this.handleChangeTaskContent}
                                                    task={task}
                                                    scrollAddTask={this.scrollAddTask}
                                                    updateTask={this.updateTask}
                                                    handleCancelEdit={this.handleCancelEdit}
                                                    handleChooseEditTask={this.handleChooseEditTask(cardIndex, taskIndex, task.get("id"))}
                                                    handleDeleteTask={this.handleDeleteTask(cardIndex, taskIndex)}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </Card>
                        ))
                        :
                        <div>abcd</div>
                        
                        }
                    </div>
                </DragDropContext>
                {displayModal && (
                    <AddNewModal
                        editingCardIndex={editingCardIndex}
                        taskContent={taskContent}
                        handleChangeTaskContent={this.handleChangeTaskContent}
                        handleChangeEditingCardIndex={this.handleChangeEditingCardIndex}
                        handleAddNewTask={this.handleAddNewTask}
                        handleToggleModal={this.handleToggleModal()}
                        selectedCard={this.state.selectedCard}
                        handleChangeSelectedCard={this.handleChangeSelectedCard}
                    />
                )}
            </div>
        );
    }
}
export default App;

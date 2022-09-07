import './style.scss'

import  toast from './Assets/toast.js'
import { fromJS } from 'immutable'
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Card from './Components/Card/index.js'
import Task from './Components/Task/index.js'
import AddNewModal from './Components/AddNewModel/index.js'
import { Component } from 'react';
import './Assets/toast.scss';

import { v1 as uuidv1 } from 'uuid';

class App extends Component {
    state = {
        displayModal: false,
        editingCardIndex: '',
        taskContent: '',
        editingTaskIndex: null,
        editedTaskId: null,
        cards: fromJS([
          { id: 'td', title: 'TO DO', tasks: [] },
          { id: 'ip', title: 'IN PROGRESS', tasks: [] },
          { id: 'de', title: 'DONE', tasks: [] }
        ])
    } 
    componentDidMount() {
        const cards = localStorage.getItem('cards');
        if (cards) {
            this.setState({ cards: fromJS(JSON.parse(cards)) });
        }
    }
    handleToggleModal = (choosenCard = '') => () => {
        this.setState(prevState => ({
          displayModal: !prevState.displayModal,
          editingCardIndex: choosenCard
        }));
    }
    handleChangeTaskContent = (e) => this.setState({ taskContent: e.target.value })
    handleChangeEditingCardIndex = (editingCardIndex) => () => this.setState({ editingCardIndex: editingCardIndex })

    handleAddNewTask = () => {
        const { taskContent } = this.state
        if (taskContent.trim() === '') {
            toast({
                title: 'Error',
                message: 'Vui lòng điền thông tin',
                type: 'error',
                duration: 2000
            })
        } else {
            const { editingCardIndex, cards } = this.state;
            const newTask = fromJS({
                id: uuidv1(),
                content: taskContent,
                time: new Date().toLocaleString()
            });
            const cardIndex = cards.findIndex(card => card.get('id') === editingCardIndex);
            const updatedCard = cards.updateIn([cardIndex, 'tasks'], tasks => tasks.push(newTask));
            this.setState({
                displayModal: false,
                editingCardIndex: '',
                taskContent: '',
                cards: fromJS(updatedCard)
            }, () => {
                localStorage.setItem('cards', JSON.stringify(updatedCard.toJS()));
            });
            toast({
                title: 'Create New',
                message: 'Thêm thông tin thành công',
                type: 'success',
                duration: 2000
            })
        }
    }

    handleDeleteTask = (cardIndex, taskIndex) => () => {
        const result = window.confirm('Are your sure to delete this task?');
        if (result) {
            const { cards } = this.state;
            const updatedCard = cards.updateIn(
                [cardIndex, 'tasks'],
                tasks => tasks.remove(taskIndex));
            this.setState({ cards: fromJS(updatedCard) }, () => {
                localStorage.setItem('cards', JSON.stringify(updatedCard.toJS()));
                toast({
                    title: 'Delete',
                    message: 'Xoá thành công',
                    type: 'success',
                    duration: 2000
                })
          });
        }
      }
    handleChooseEditTask = (cardIndex, taskIndex, taskId) => () => {
        this.setState({
          editingCardIndex: cardIndex,
          editingTaskIndex: taskIndex,
          editedTaskId: taskId
        })
    }
    updateTask = () => {
        const { cards, editingCardIndex, taskContent, editingTaskIndex, time = new Date().toLocaleString() } = this.state;
        const updatedCard = cards.updateIn(
            [editingCardIndex, 'tasks'],
            tasks => tasks.setIn([editingTaskIndex, 'content'], taskContent).setIn([editingTaskIndex, 'time'], time)
        );
        
        this.setState({
            editingCardIndex: '',
            taskContent: '',
            editedTaskId: null,
            editingTaskIndex: null,
            cards: fromJS(updatedCard)
            }, () => {
                localStorage.setItem('cards', JSON.stringify(updatedCard.toJS()));
        });
        toast({
            title: 'Update',
            message: 'Update thành công',
            type: 'success',
            duration: 2000
        })
    }
    handleCancelEdit = () => {
        this.setState({
          editingCardIndex: '',
          taskContent: '',
          editedTaskId: null,
          editingTaskIndex: null
        });
    }
    handleSaveDrag = (result) => {
        const { source, destination, reason } = result;
        if (reason === 'DROP' && destination) {
            const { cards } = this.state;
            const sourceCardIndex = cards.findIndex(card => card.get('id') === source.droppableId);
            const task = cards.getIn([sourceCardIndex, 'tasks', source.index]);
            let updateCard = cards.updateIn(
                [sourceCardIndex, 'tasks'],
                tasks => tasks.remove(source.index)
            );
            const destinationCardIndex = cards.findIndex(card => card.get('id') === destination.droppableId);
            updateCard = updateCard.updateIn(
                [destinationCardIndex, 'tasks'],
                tasks => tasks.insert(destination.index, task)
            );
            this.setState({
                cards: fromJS(updateCard)
            }, () => {
                localStorage.setItem('cards', JSON.stringify(updateCard.toJS()));
            });
        }
    }
    render() {
        const { cards, displayModal, editingCardIndex, taskContent, editedTaskId } = this.state;
        return (
          <div className="App">
            <div id='toast'></div>
            <div className="title">TO DO LIST</div>
            <DragDropContext onDragEnd={this.handleSaveDrag}>
                <div className="container">
                    {
                    cards.map((card, cardIndex) => (
                        <Card key={card.get('id')}
                        card={card}
                        handleAddNewTask={this.handleToggleModal}
                        >
                        <Droppable droppableId={card.get('id')}>
                            {
                                provided => (
                                    <div ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{ minHeight: '500px' }}>
                                    {
                                        card.get('tasks').map((task, taskIndex) => (
                                        <Task key={task.get('id')}
                                            index={taskIndex}
                                            isEditing={task.get('id') === editedTaskId}
                                            handleChangeTaskContent={this.handleChangeTaskContent}
                                            task={task}
                                            updateTask={this.updateTask}
                                            handleCancelEdit={this.handleCancelEdit}
                                            handleChooseEditTask={this.handleChooseEditTask(cardIndex, taskIndex, task.get('id'))}
                                            handleDeleteTask={this.handleDeleteTask(cardIndex, taskIndex)} />
                                        ))
                                    }
                                    {provided.placeholder}
                                    </div>
                                )
                            }
                        </Droppable>
                        </Card>
                    ))
                    }
                </div>
            </DragDropContext>
            {
                displayModal && <AddNewModal editingCardIndex={editingCardIndex}
                taskContent={taskContent}
                handleChangeTaskContent={this.handleChangeTaskContent}
                handleChangeEditingCardIndex={this.handleChangeEditingCardIndex}
                handleAddNewTask={this.handleAddNewTask}
                handleToggleModal={this.handleToggleModal()}
                selectedCard={this.state.selectedCard}
                handleChangeSelectedCard={this.handleChangeSelectedCard} />
            }
          </div>
        );
    }
}
export default App;

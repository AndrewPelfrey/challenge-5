// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
 return nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  // console.log('Creating task card for:', task);

    var $taskCard = $(`<div>`).addClass(`card border-dark mb-3 draggable`).attr(`id`, task.id);
    var $cardHeader = $(`<div>`).addClass(`card-header`);
    var $cardBody = $(`<div>`).addClass(`card-body`);
    var $cardFooter = $(`<div>`).addClass(`card-footer`);

    var $title = $('<h2>').addClass('header-text').text(task.title);
    $cardHeader.append($title);

    var $description = $(`<p>`).addClass(`body-text`).text(task.description);
    $cardBody.append($description);

    var $date = $(`<p>`).addClass(`footer-text`).text(task.deadline);
    $cardFooter.append($date);

    var $delete = $(`<button>`).addClass(`delete-button`).text(`Delete`);
    $cardFooter.append($delete);

    var dueDate = new Date(task.deadline);
    var currentDate = new Date();
    var daysUntilDue = Math.floor((dueDate - currentDate) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      $taskCard.addClass(`overdue`);
    } else if (daysUntilDue <= 2) {
        $taskCard.addClass(`almost-due`);
      }
    

    return $taskCard.append($cardHeader, $cardBody, $cardFooter);
  }

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    const $todoCards = $(`#todo-cards`);
    // console.log("rendering task list");
    taskList.forEach(task => {
        const $taskCard = createTaskCard(task);
        $todoCards.append($taskCard);
        // console.log("Appended task card");

        $taskCard.draggable({
          revert: "invalid",
          zIndex: 1000,
          snap: ".lane", // Snap to the lanes
          snapMode: "inner",
        }); 
        // console.log("making them draggable");
    });
}


// Todo: create a function to handle adding a new task
function handleAddTask(event){
event.preventDefault();
console.log("add task button clicked");

const title = $(`#titleInput`).val();
const description = $(`#descriptionInput`).val();
const date = $(`#datepicker`).val();

const newTask = {
    id: generateTaskId(),
    title: title,
    description: description,
    deadline: date,
    status: `Not started`
};

taskList.push(newTask);

const $taskCard = createTaskCard(newTask);

$(`#todo-cards`).append($taskCard);

$taskCard.draggable({
  zIndex: 1000,
});

localStorage.setItem(`tasks`, JSON.stringify(taskList));

// renderTaskList();

console.log(taskList)

}

// Todo: create a function to handle deleting a task
function handleDeleteTask(taskId){
  console.log("Deleting task", taskId);

$(`#${taskId}`).remove();

const taskIdNum = parseInt(taskId, 10);


taskList = taskList.filter(task => task.id !== taskIdNum);
console.log("updating after deletion", taskList)

localStorage.setItem(`tasks`, JSON.stringify(taskList));
console.log(`tasks in local storage after deletion: `, localStorage.getItem("tasks"));


}

// Todo: create a function to handle dropping a task into a new status lane
// Researched a lot to help me with this and still couldnt quite figure it out.
// also used chat gpt to help me with some of this code
function handleDrop(event, ui) {
  const $droppable = $(this);
  const $draggable = ui.draggable;

  // Adjust the tolerance for precise snapping behavior
  $droppable.droppable("option", "tolerance", "pointer");

  // Check if the draggable element is already in the droppable element
  if ($droppable.find($draggable).length === 0) {
      // Get the position of the droppable element
      const droppableOffset = $droppable.offset();
      const droppableHeight = $droppable.height();

      // Calculate the position to snap the draggable element
      let relativeTop;
      if ($droppable.children('.card').length > 0) {
          // If there are existing cards, snap below the last card
          const lastCard = $droppable.children('.card').last();
          const lastCardOffset = lastCard.offset();
          relativeTop = lastCardOffset.top - droppableOffset.top + lastCard.outerHeight(true);
      } else {
          // Otherwise, snap to the top of the droppable element
          relativeTop = 0;
      }

      // Append the draggable element to the droppable element
      $droppable.append($draggable);

      // Set the position of the draggable element
      $draggable.css({
          position: "relative",
          top: relativeTop,
          left: 0  // Reset left position to align with the droppable element
      });

      // Update task status if applicable
      if ($draggable.hasClass('card')) {
          const taskId = $draggable.attr('id');
          const sectionId = $droppable.attr('id');

          const taskIndex = taskList.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
              switch (sectionId) {
                  case 'in-progress':
                      taskList[taskIndex].status = 'In Progress';
                      break;
                  case 'done':
                      taskList[taskIndex].status = 'Done';
                      break;
                  default:
                      break;
              }
          }
      }
  }
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  $(".modal-content .btn-primary").on("click", function (event) {
      event.preventDefault(); // Prevent the default form submission behavior
      handleAddTask(event); // Pass the event object to the function
      $("#formModal").modal("hide"); // Hide the modal
  });
  // delete button
  $(document).on("click", ".delete-button", function (event) {
    event.preventDefault();
    const taskId = $(this).closest(".card").attr("id");
    handleDeleteTask(taskId);
});
// close button
$(".modal-content .btn-secondary").on("click", function () {
  $("#formModal").modal("hide");
});
  // Initialize datepicker
  $('#datepicker').datepicker({
      changeMonth: true,
      changeYear: true,
  });

// check of the target of the drag event is the card itself or a child element if it is the card itself, clone it, otherwise find the parent card and clone that
    // Michael helped me with those code: 
  // Make lanes droppable
  $(".lane").droppable({
      accept: `.draggable`,
      drop: handleDrop,
      helper: function (e) {
          const original = $(e.target).hasClass('ui-draggable')
              ? $(e.target)
              : $(e.target).closest('.ui-draggable');
          return original.clone().css({
              maxWidth: original.outerWidth(),
          });
      },
  });

  // Render the task list
  renderTaskList();
});
//initial page rendering
let ourHTML = items
  .map((item) => {
    return itemTemplate(item);
  })
  .join("");
document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML);

//create feature
function itemTemplate(item) {
  return `<li
    class="
      list-group-item list-group-item-action
      d-flex
      align-items-center
      justify-content-between
    "
  >
    <span class="item-text">${item.text}</span>
    <div>
      <button data-id = "${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id = "${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`;
}
//submit event works for both click and enter key

let createField = document.getElementById("create-field");
document.getElementById("create-form").addEventListener("submit", (e) => {
  e.preventDefault();
  axios
    .post("/create-item", {
      text: createField.value,
    })
    .then((response) => {
      //the result is shown here for broswer
      //created element is shown from here
      document
        .getElementById("item-list")
        .insertAdjacentHTML("beforeend", itemTemplate(response.data));
      createField.value = "";
      createField.focus();
    })
    .catch(() => {
      console.log("error occured.");
    });
});

document.addEventListener("click", (e) => {
  //delete feature
  if (e.target.classList.contains("delete-me")) {
    if (confirm("Do you really want to delete this item permanently? ")) {
      //using axios
      axios
        .post("/delete-item", {
          id: e.target.getAttribute("data-id"),
        })
        .then(() => {
          //the result is shown here for broswer
          e.target.parentElement.parentElement.remove();
        })
        .catch(() => {
          console.log("error occured.");
        });
    }
  }
  //Update Feautre
  if (e.target.classList.contains("edit-me")) {
    let newItem = prompt(
      "Enter to do item here: ",
      e.target.parentElement.parentElement.querySelector(".item-text").innerHTML
    );
    //live post request to server
    //axios.post() returns a promise
    if (newItem) {
      axios
        .post("/update-item", {
          text: newItem,
          id: e.target.getAttribute("data-id"),
        })
        .then(() => {
          //the result is shown here for broswer
          e.target.parentElement.parentElement.querySelector(
            ".item-text"
          ).innerHTML = newItem;
        })
        .catch(() => {
          console.log("error occured.");
        });
    }
  }
});

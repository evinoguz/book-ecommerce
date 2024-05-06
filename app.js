let bookList = [],
  basketList = [];
toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};
// Basket-Button
const toggleModal = () => {
  const basketModalElement = document.querySelector(".basket__modal");
  basketModalElement.classList.toggle("active");
};
// Books Data
const getBooks = () => {
  fetch("./products.json")
    .then((res) => res.json())
    .then((books) => (bookList = books));
};
getBooks();

const createBookStars = (starRate) => {
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i)
      starRateHtml += `<i class="bi bi-star-fill active"></i>`;
    else starRateHtml += `<i class="bi bi-star-fill"></i>`;
  }
  return starRateHtml;
};

// Store - Book List
const createBookItemsHtml = () => {
  const bookListElement = document.querySelector(".book__list");
  let bookListHtml = "";
  bookList.forEach((book, index) => {
    bookListHtml += `
        <div class="col-5 ${index % 2 == 0 && "offset-2"} my-5">
        <div class="row book__card">
            <div class="col-6">
                <img class="img-fluid shadow" width="258" height="400" src="${
                  book.imgSource
                }">
            </div>
            <div class="col-6 d-flex flex-column justify-content-between">
                <div class="book_detail">
                    <span class="fos gray fs-5">${book.author}</span></br>
                    <span class="fs-4 fw-bold">${book.name}</span></br>
                    <span class="book_start-rate">
                        ${createBookStars(book.starRate)}
                        <span class="gray">${book.reviewCount} reviews</span>
                    </span></br>
                </div>
                <p class="book_description fos gray">
                ${book.description}
                </p>
                <div>
                    <span class="black fw-bold fs-4 me-2">${book.price}₺</span>
                    ${
                      book.oldPrice
                        ? `<span class="fs-4 fw-bold old__price">${book.oldPrice}₺</span>`
                        : ""
                    }
                </div> 
                <button class="btn__purple" onclick="addBookToBasket(${
                  book.id
                })">ADD BASKET</button>               
            </div>
        </div>
    </div>
        `;
  });
  bookListElement.innerHTML = bookListHtml;
};
// Store - Categories
const BOOK_TYPE = {
  ALL: "Tümü",
  NOVEL: "Roman",
  CHILDREN: "Çocuk",
  SELFIMPROVEMENT: "Kişisel Gelişim",
  HISTORY: "Tarih",
  FINANCE: "Finans",
  SCIENCE: "Bilim",
};
// Store - Book Filter
const createBookTypesHtml = () => {
  const filterElement = document.querySelector(".filter");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (filterTypes.findIndex((filter) => filter == book.type) == -1)
      filterTypes.push(book.type);
  });
  filterTypes.forEach((type, index) => {
    filterHtml += `<li class="${
      index == 0 ? "active" : null
    }" onclick="filterBooks(this)" data-type="${type}">${
      BOOK_TYPE[type] || type
    }</li>`;
  });
  filterElement.innerHTML = filterHtml;
};
const filterBooks = (filterItem) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterItem.classList.add("active");
  let bookType = filterItem.dataset.type;
  getBooks();
  if (bookType != "ALL")
    bookList = bookList.filter((book) => book.type == bookType);
  createBookItemsHtml();
};
// Basket-List
const listBasketItems = () => {
  localStorage.setItem("basketList", JSON.stringify(basketList));
  const basketListElement = document.querySelector(".basket__list");
  const basketCountElement = document.querySelector(".basket__count");
  basketCountElement.innerHTML = basketList.length ? basketList.length : null;
  const totalPriceElement = document.querySelector(".total__price");
  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    basketListHtml += `
        <li class="basket__item">
        <img src="${item.product.imgSource}" width="100" height="100" alt="image">
        <div class="basket__item-info">
            <h3 class="book__name">${item.product.name}</h3>
            <span class="book__price">${item.product.price}₺</span>
            <span class="book__remove" onclick="removeItemToBasket(${item.product.id})"><i class="bi bi-trash3-fill text-danger"></i></span>
        </div>
        <div class="book__count">
            <span class="decrease" onclick="decreaseItemToBasket(${item.product.id})">-</span>
            <span class="my-2">${item.quantity}</span>
            <span class="increase" onclick="increaseItemToBasket(${item.product.id})">+</span>
        </div>
    </li>
        `;
  });
  basketListElement.innerHTML = basketListHtml
    ? basketListHtml
    : `<span class="d-flex justify-content-center">No items to Buy again.</span>`;
  totalPriceElement.innerHTML =
    totalPrice > 0 ? "Total: " + totalPrice.toFixed(2) + "₺" : null;
};
// Basket-Add
const addBookToBasket = (bookId) => {
  let findedBook = bookList.find((book) => book.id == bookId);
  if (findedBook) {
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id == bookId
    );
    if (basketAlreadyIndex == -1) {
      let addedItem = { quantity: 1, product: findedBook };
      basketList.push(addedItem);
    } else {
      if (
        basketList[basketAlreadyIndex].quantity <
        basketList[basketAlreadyIndex].product.stock
      )
        basketList[basketAlreadyIndex].quantity += 1;
      else {
        toastr.error("Sorry, we don't have enough stock.");
        return;
      }
    }
    listBasketItems();
    toastr.success("Book added to basket successfully.");
  }
};
// Basket-Delete
const removeItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    basketList.splice(findedIndex, 1);
  }
  listBasketItems();
};
// Basket-Decrease
const decreaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity != 1)
      basketList[findedIndex].quantity -= 1;
    else removeItemToBasket(bookId);
    listBasketItems();
  }
};
// Basket-Increase
const increaseItemToBasket = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    if (
      basketList[findedIndex].quantity < basketList[findedIndex].product.stock
    )
      basketList[findedIndex].quantity += 1;
    else toastr.error("Sorry, we don't have enough stock.");
    listBasketItems();
  }
};
// Storing Data
if (localStorage.getItem("basketList")) {
  basketList = JSON.parse(localStorage.getItem("basketList"));
  listBasketItems();
}

setTimeout(() => {
  createBookItemsHtml();
  createBookTypesHtml();
}, 100);
